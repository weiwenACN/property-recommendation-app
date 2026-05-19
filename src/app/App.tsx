import { useEffect, useMemo, useRef, useState } from 'react';
import { SplashScreen } from './components/onboarding/SplashScreen';
import { SignUpScreen } from './components/onboarding/SignUpScreen';
import { ChatScreen, type SparkEntry } from './components/chat/ChatScreen';
import { GuestPromptSheet } from './components/guest/GuestPromptSheet';
import { AgentProfileScreen } from './components/agent/AgentProfileScreen';
import { SparkScreen } from './components/spark/SparkScreen';
import { CreateAccountScreen } from './components/onboarding/CreateAccountScreen';
import { OTPScreen } from './components/onboarding/OTPScreen';
import { PreferencesScreen } from './components/onboarding/PreferencesScreen';
import { WelcomeBackModal } from './components/onboarding/WelcomeBackModal';
import {
  loadPreferences,
  savePreferences,
  clearPreferences,
  phoneKey,
} from './data/preferenceStore';
import {
  loadBookmarks,
  saveBookmarks,
} from './data/bookmarkStore';
import {
  loadCalculations,
  deleteCalculation as deleteCalcFromStore,
  type SavedCalculation,
} from './data/calculatorStore';
import {
  ensureDemoConversations,
  getOrCreateConversation,
  addMessageToConversation,
  markConversationRead,
  loadConversations,
  type Conversation,
} from './data/messageStore';
import {
  loadViewed,
  recordView,
  clearViewed,
  type ViewedEntry,
} from './data/viewedStore';
import { Toast } from './components/common/Toast';
import { FloatingCompareCTA } from './components/comparison/FloatingCompareCTA';
import { RecentlyViewedScreen } from './components/history/RecentlyViewedScreen';
import { SimilarPropertiesScreen } from './components/similar/SimilarPropertiesScreen';
import { HomeScreen } from './components/home/HomeScreen';
import { AreaResultsScreen } from './components/areas/AreaResultsScreen';
import { PropertyDetailScreen } from './components/property/PropertyDetailScreen';
import { ComparisonScreen } from './components/comparison/ComparisonScreen';
import { BookmarksScreen } from './components/bookmarks/BookmarksScreen';
import { BookmarkUndoSnackbar } from './components/bookmarks/BookmarkUndoSnackbar';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { MessagesScreen } from './components/messages/MessagesScreen';
import {
  NotificationsScreen,
  type Notification,
} from './components/notifications/NotificationsScreen';
import { BottomNav } from './components/navigation/BottomNav';
import { LoanCalculator } from './components/calculator/LoanCalculator';
import { MyCalculationsScreen } from './components/calculations/MyCalculationsScreen';
import {
  properties as allProperties,
  type Property,
  type RecommendedArea,
} from './data/properties';
import type { SearchMode } from './data/pricing';
import { agentById, DEFAULT_AGENT_ID } from './data/agents';
import { signOut as signOutApi } from './data/authApi';
import { resetSparkSession } from './components/spark/SparkScreen';

type OnboardingStep = 'splash' | 'signup' | 'create-account' | 'otp' | 'preferences';
type MainScreen =
  | 'home'
  | 'spark'
  | 'area-results'
  | 'property-detail'
  | 'comparison'
  | 'bookmarks'
  | 'favourites'
  | 'history'
  | 'similar-properties'
  | 'profile'
  | 'notifications'
  | 'chat'
  | 'agent-profile'
  | 'messages'
  | 'my-calculations';

type TabId = 'home' | 'spark' | 'favourites' | 'messages' | 'profile';

const initialNotifications: Notification[] = [
  {
    id: 'seed-new-listing',
    type: 'new-listing',
    title: 'New listing in Shoreditch',
    body: 'A modern 2-bed apartment matching your preferences just went live.',
    propertyId: '1',
    timestamp: Date.now() - 1000 * 60 * 15,
    read: false,
  },
];

export default function App() {
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('splash');
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+44');
  const [userPreferences, setUserPreferences] = useState<string[]>([]);
  const [welcomeBackPrefs, setWelcomeBackPrefs] = useState<string[] | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestPromptOpen, setGuestPromptOpen] = useState(false);
  const [guestPromptFeature, setGuestPromptFeature] = useState<string | undefined>(undefined);
  const [chatProperty, setChatProperty] = useState<Property | null>(null);
  const [chatReturnTo, setChatReturnTo] = useState<MainScreen>('property-detail');
  const [sparkEntry, setSparkEntry] = useState<SparkEntry | null>(null);

  // ── Conversations (Messages tab) ─────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    ensureDemoConversations(); // seeds demo data once per device
    return loadConversations();
  });

  const [searchMode, setSearchMode] = useState<SearchMode>('rent');

  const [mainScreen, setMainScreen] = useState<MainScreen>('home');
  const [activeTab, setActiveTab] = useState<TabId>('home');

  const [selectedArea, setSelectedArea] = useState<RecommendedArea | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [similarContext, setSimilarContext] = useState<Property | null>(null);
  const [propertyDetailReturnTo, setPropertyDetailReturnTo] = useState<MainScreen | null>(null);
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [viewedEntries, setViewedEntries] = useState<ViewedEntry[]>([]);
  const [globalToast, setGlobalToast] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [pendingToast, setPendingToast] = useState<string | null>(null);

  // Undo snackbar state.
  const [pendingUndo, setPendingUndo] = useState<Property | null>(null);
  const pendingUndoCommitRef = useRef<number | null>(null);

  const activePhoneKey = useMemo(
    () => (onboardingComplete ? phoneKey(countryCode, phoneNumber) : null),
    [onboardingComplete, countryCode, phoneNumber],
  );

  // Hydrate bookmarks + viewed history from storage once we know who the user is.
  useEffect(() => {
    if (!activePhoneKey) return;
    setBookmarkIds(loadBookmarks(activePhoneKey));
    setViewedEntries(loadViewed(activePhoneKey));
  }, [activePhoneKey]);

  const persistBookmarks = (ids: string[]) => {
    if (activePhoneKey) saveBookmarks(activePhoneKey, ids);
  };

  const bookmarkedProperties = useMemo(() => {
    return bookmarkIds
      .map((id) => allProperties.find((p) => p.id === id))
      .filter((p): p is Property => Boolean(p));
  }, [bookmarkIds]);

  const isBookmarked = (id: string) => bookmarkIds.includes(id);

  // Add to bookmarks (idempotent).
  const addBookmark = (property: Property) => {
    setBookmarkIds((prev) => {
      if (prev.includes(property.id)) return prev;
      const next = [...prev, property.id];
      persistBookmarks(next);
      return next;
    });
  };

  // Remove from bookmarks + queue the undo snackbar.
  const removeBookmark = (property: Property) => {
    setBookmarkIds((prev) => {
      const next = prev.filter((id) => id !== property.id);
      persistBookmarks(next);
      return next;
    });
    setPendingUndo(property);
  };

  const handleBookmarkToggle = (property: Property) => {
    if (isBookmarked(property.id)) {
      removeBookmark(property);
    } else {
      addBookmark(property);
    }
  };

  const handleUndoRemove = () => {
    if (!pendingUndo) return;
    const property = pendingUndo;
    setPendingUndo(null);
    addBookmark(property);
  };

  const handleDismissUndo = () => {
    setPendingUndo(null);
  };

  // ── Onboarding ──────────────────────────────────────────────────────────
  const handleSplashComplete = () => {
    setOnboardingStep('signup');
  };

  const lookupSavedPreferences = (country: string, phone: string): string[] | null => {
    return loadPreferences(phoneKey(country, phone));
  };

  const persistPreferences = (preferences: string[]) => {
    savePreferences(phoneKey(countryCode, phoneNumber), preferences);
  };

  const handleSignUpContinue = (phone: string, country: string) => {
    setPhoneNumber(phone);
    setCountryCode(country);

    const saved = lookupSavedPreferences(country, phone);
    if (saved && saved.length > 0) {
      setWelcomeBackPrefs(saved);
      return;
    }
    setOnboardingStep('otp');
  };

  const handleOpenCreateAccount = () => {
    setOnboardingStep('create-account');
  };

  const handleCreateAccountRegister = (country: string, phone: string) => {
    setCountryCode(country);
    setPhoneNumber(phone);

    const saved = lookupSavedPreferences(country, phone);
    if (saved && saved.length > 0) {
      setWelcomeBackPrefs(saved);
      return;
    }
    setOnboardingStep('otp');
  };

  const handleOTPVerify = () => {
    setOnboardingStep('preferences');
  };

  const handlePreferencesComplete = (preferences: string[]) => {
    setUserPreferences(preferences);
    persistPreferences(preferences);
    setOnboardingComplete(true);
  };

  const handlePreferencesSkip = () => {
    setOnboardingComplete(true);
  };

  const handleContinueAsGuest = () => {
    setIsGuest(true);
    setOnboardingComplete(true);
  };

  const handleKeepSavedPreferences = () => {
    if (!welcomeBackPrefs) return;
    setUserPreferences(welcomeBackPrefs);
    setWelcomeBackPrefs(null);
    setOnboardingComplete(true);
  };

  const handleStartFresh = () => {
    setUserPreferences([]);
    clearPreferences(phoneKey(countryCode, phoneNumber));
    setWelcomeBackPrefs(null);
    setOnboardingStep('preferences');
  };

  const handleUpdatePreferences = (preferences: string[]) => {
    setUserPreferences(preferences);
    persistPreferences(preferences);
  };

  // ── Navigation handlers ─────────────────────────────────────────────────
  const handleAreaSelect = (area: RecommendedArea) => {
    setSelectedArea(area);
    setMainScreen('area-results');
  };

  const handlePropertySelect = (property: Property) => {
    if (mainScreen !== 'property-detail') {
      setPropertyDetailReturnTo(mainScreen);
    }
    setSelectedProperty(property);
    setMainScreen('property-detail');
    if (activePhoneKey) {
      const next = recordView(activePhoneKey, property.id);
      setViewedEntries(next);
    }
  };

  const handleClearHistory = () => {
    if (activePhoneKey) clearViewed(activePhoneKey);
    setViewedEntries([]);
  };

  const handleOpenHistory = () => {
    setMainScreen('history');
    // History is accessible from Profile tab — keep profile tab highlighted
    setActiveTab('profile');
  };

  const handleStartBrowsingFromHistory = () => {
    setActiveTab('home');
    setMainScreen('home');
  };

  const handleOpenSimilar = (target: Property) => {
    setSimilarContext(target);
    setMainScreen('similar-properties');
  };

  const handleBackFromSimilar = () => {
    if (similarContext) {
      setSelectedProperty(similarContext);
      setSimilarContext(null);
    }
    setMainScreen('property-detail');
  };

  const handleFavoriteFromDetail = () => {
    if (selectedProperty) handleBookmarkToggle(selectedProperty);
  };

  const comparisonProperties = useMemo(() => {
    return comparisonIds
      .map((id) => allProperties.find((p) => p.id === id))
      .filter((p): p is Property => Boolean(p));
  }, [comparisonIds]);

  const isInComparison = (id: string) => comparisonIds.includes(id);

  const showToast = (message: string) => setGlobalToast(message);

  const handleComparisonToggle = (property: Property) => {
    setComparisonIds((prev) => {
      if (prev.includes(property.id)) {
        return prev.filter((id) => id !== property.id);
      }
      if (prev.length >= 3) {
        showToast('You can compare up to 3 properties at a time');
        return prev;
      }
      return [...prev, property.id];
    });
  };

  const handleClearComparison = () => setComparisonIds([]);

  const handleOpenComparison = () => {
    setMainScreen('comparison');
    // Comparison is accessed via the floating CTA, not a tab — keep current tab active
  };

  const handleRemoveFromComparison = (property: Property) => {
    setComparisonIds((prev) => prev.filter((id) => id !== property.id));
  };

  // Compare-from-detail keeps working: adds the current property and jumps to compare.
  const handleCompare = () => {
    if (!selectedProperty) return;
    setComparisonIds((prev) => {
      if (prev.includes(selectedProperty.id)) return prev;
      if (prev.length >= 3) {
        showToast('You can compare up to 3 properties at a time');
        return prev;
      }
      return [...prev, selectedProperty.id];
    });
    setMainScreen('comparison');
  };

  const handleContactAgentSent = (property: Property) => {
    const agentForProp = agentById(property.agentId ?? DEFAULT_AGENT_ID) ?? agentById(DEFAULT_AGENT_ID)!;
    const notif: Notification = {
      id: `agent-${Date.now()}`,
      type: 'agent-confirmation',
      title: 'Inquiry sent',
      body: `Agent ${agentForProp.fullName} from ${agentForProp.agencyName.split(' · ')[1] ?? agentForProp.agencyName} will contact you shortly about ${property.title}.`,
      propertyId: property.id,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
    setPendingToast(`Agent ${agentForProp.fullName} will contact you shortly.`);
  };

  const openGuestPrompt = (feature?: string) => {
    setGuestPromptFeature(feature);
    setGuestPromptOpen(true);
  };

  const handleGuestBookmarkToggle = (property: Property) => {
    if (isGuest) { openGuestPrompt('save properties'); return; }
    handleBookmarkToggle(property);
  };

  const handleGuestComparisonToggle = (property: Property) => {
    if (isGuest) { openGuestPrompt('compare properties'); return; }
    handleComparisonToggle(property);
  };

  const handleGuestFavoriteFromDetail = () => {
    if (isGuest) { openGuestPrompt('save properties'); return; }
    handleFavoriteFromDetail();
  };

  const handleGuestCompare = () => {
    if (isGuest) { openGuestPrompt('compare properties'); return; }
    handleCompare();
  };

  /**
   * Shared helper: opens ChatScreen for a specific property+agent pair.
   * Writes to messageStore (idempotent) so the Messages tab stays in sync.
   */
  const openChatFor = (
    property: Property,
    returnTo: MainScreen,
    autoMsg?: string,
  ) => {
    const agentId = property.agentId ?? DEFAULT_AGENT_ID;
    const convId = `${property.id}_${agentId}`;

    // Ensure the conversation exists in the store
    getOrCreateConversation(property.id, agentId);
    const openingMsg = autoMsg ?? `Hi, I'm interested in ${property.title}.`;
    // Only add the opening message if this is a brand-new conversation
    const conv = loadConversations().find((c) => c.id === convId);
    if (conv && conv.messages.length === 0) {
      addMessageToConversation(convId, openingMsg, 'user');
    }
    setConversations(loadConversations());

    setChatProperty(property);
    setChatReturnTo(returnTo);
    setSparkEntry({
      autoMessage: openingMsg,
      sessionKey: convId,
      listedPrice: searchMode === 'rent' ? property.rentPrice : property.salePrice,
    });
  };

  const handleChatWithAgent = () => {
    if (!selectedProperty) return;
    openChatFor(selectedProperty, 'property-detail');
    setMainScreen('chat');
  };

  // Called silently when user swipes right — no navigation, just records intent
  // and seeds the chat session so it's ready when they tap "View" on the toast.
  const handleSparkInterested = (property: Property) => {
    openChatFor(
      property,
      'spark',
      `Hi, I'm interested in this property — ${property.address}.`,
    );
    // Deliberately does NOT call setMainScreen — navigation happens only via handleViewSparkChat.
  };

  // Called from the toast "View" button after the celebration screen is dismissed.
  const handleViewSparkChat = (property: Property) => {
    openChatFor(
      property,
      'spark',
      `Hi, I'm interested in this property — ${property.address}.`,
    );
    setMainScreen('chat');
  };

  /** Opens a conversation from the Messages tab. */
  const handleOpenConversation = (conv: Conversation) => {
    const property = allProperties.find((p) => p.id === conv.propertyId);
    if (!property) return;

    const firstUserMsg = conv.messages.find((m) => m.sender === 'user');
    const autoMessage =
      firstUserMsg?.text ?? `Hi, I'm interested in ${property.title}.`;

    markConversationRead(conv.id);
    setConversations(loadConversations());

    setChatProperty(property);
    setChatReturnTo('messages');
    setSparkEntry({
      autoMessage,
      sessionKey: conv.id,
      listedPrice: searchMode === 'rent' ? property.rentPrice : property.salePrice,
    });
    setMainScreen('chat');
  };

  const handleViewAgentProfile = () => {
    setMainScreen('agent-profile');
  };

  const handleFirstMessageSent = () => {
    if (chatProperty) handleContactAgentSent(chatProperty);
  };

  const handleOpenNotifications = () => {
    setMainScreen('notifications');
  };

  const handleNotificationTap = (notification: Notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
    );
    if (notification.propertyId) {
      const target = allProperties.find((p) => p.id === notification.propertyId);
      if (target) {
        setPropertyDetailReturnTo('notifications');
        setSelectedProperty(target);
        setMainScreen('property-detail');
        return;
      }
    }
    setMainScreen('home');
  };

  // ── My Calculations handlers ──────────────────────────────────────────────

  const handleOpenMyCalculations = () => {
    setMainScreen('my-calculations');
    setActiveTab('profile');
  };

  /** Called when user taps a saved calculation card — opens calculator pre-filled. */
  const handleOpenCalculation = (calc: SavedCalculation) => {
    setCalcPreFill(calc);
    setCalcOpen(true);
  };

  /** Called after a logged-in user successfully saves a calculation. */
  const handleCalcSaved = () => {
    setCalculations(loadCalculations());
    setGlobalToast('Calculation saved to your profile');
  };

  /** Deletes a calculation after confirmation and refreshes state. */
  const handleDeleteCalculation = (id: string) => {
    const updated = deleteCalcFromStore(id);
    setCalculations(updated);
  };

  /**
   * Called when user taps "View property" inside the calculator sheet
   * that was opened from My Calculations for a property-linked calculation.
   */
  const handleViewPropertyFromCalc = () => {
    if (!calcPreFill?.propertyId) return;
    const prop = allProperties.find((p) => p.id === calcPreFill.propertyId);
    if (!prop) return;
    setCalcOpen(false);
    setCalcPreFill(null);
    setPropertyDetailReturnTo(mainScreen as MainScreen);
    setSelectedProperty(prop);
    setMainScreen('property-detail');
  };

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    if (tab === 'home') {
      setMainScreen('home');
    } else if (tab === 'spark') {
      setMainScreen('spark');
    } else if (tab === 'favourites') {
      setMainScreen('bookmarks');
    } else if (tab === 'messages') {
      setMainScreen('messages');
    } else if (tab === 'profile') {
      setMainScreen('profile');
    }
  };

  const handleBackToHome = () => {
    setMainScreen('home');
    setActiveTab('home');
    setSelectedArea(null);
  };

  const handleBackToAreaResults = () => {
    if (propertyDetailReturnTo) {
      const returnTo = propertyDetailReturnTo;
      setMainScreen(returnTo);
      setPropertyDetailReturnTo(null);
      if (returnTo === 'spark') setActiveTab('spark');
      if (returnTo === 'my-calculations') setActiveTab('profile');
      return;
    }
    if (selectedArea) {
      setMainScreen('area-results');
    } else {
      setMainScreen('home');
    }
  };

  const handleStartBrowsingFromBookmarks = () => {
    setActiveTab('home');
    setMainScreen('home');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const messagesUnreadCount = conversations.reduce((s, c) => s + c.unreadCount, 0);

  // ── Calculator open state + saved calculations ────────────────────────────
  const [calcOpen, setCalcOpen] = useState(false);
  /** Saved calculation to pre-fill the calculator sheet with (from My Calculations). */
  const [calcPreFill, setCalcPreFill] = useState<SavedCalculation | null>(null);
  /** In-memory mirror of localStorage calculations — refreshed after save/delete. */
  const [calculations, setCalculations] = useState<SavedCalculation[]>(() => loadCalculations());

  // ── Sign-out ─────────────────────────────────────────────────────────────
  const [isSigningOut, setIsSigningOut] = useState(false);

  /**
   * Full sign-out flow:
   * 1. Trigger the exit animation (slide-down) so the UI looks intentional.
   * 2. Fire the server-side sign-out API simultaneously (best-effort).
   * 3. Clear all in-memory session state — localStorage data is intentionally
   *    preserved (bookmarks, history, preferences) so the user's data is
   *    waiting for them on the next login.
   * 4. Reset the Spark card deck so the next login gets a fresh shuffle.
   * 5. Flip onboardingComplete → false to land on the sign-in screen.
   *    Because all state is cleared first the sign-in screen appears
   *    completely unauthenticated with no previous user data visible.
   * 6. If the API call fails, sign-out still completes client-side
   *    (failure is logged silently so it can be investigated later).
   */
  const handleSignOut = async () => {
    // Start the slide-down exit animation immediately
    setIsSigningOut(true);

    // Fire the server API concurrently — don't await before clearing state
    const apiCall = signOutApi().catch((err) => {
      console.warn('[Star Homes] Sign-out API failed (clearing locally anyway):', err);
    });

    // Let the animation play for 300ms before tearing down the UI
    await new Promise<void>((resolve) => setTimeout(resolve, 300));

    // Wait for the API (it should have resolved by now, but guard anyway)
    await apiCall;

    // ── Clear all in-memory session state ──────────────────────────────────
    // Auth / identity
    setPhoneNumber('');
    setCountryCode('+44');
    setIsGuest(false);
    setWelcomeBackPrefs(null);
    // Preferences (in-memory copy — localStorage record is kept)
    setUserPreferences([]);
    // Bookmarks / comparisons / history (in-memory — localStorage kept)
    setBookmarkIds([]);
    setComparisonIds([]);
    setViewedEntries([]);
    // Navigation & transient UI
    setMainScreen('home');
    setActiveTab('home');
    setSelectedArea(null);
    setSelectedProperty(null);
    setSimilarContext(null);
    setPropertyDetailReturnTo(null);
    setChatProperty(null);
    setSparkEntry(null);
    setGuestPromptOpen(false);
    setGuestPromptFeature(undefined);
    setPendingToast(null);
    setPendingUndo(null);
    setNotifications(initialNotifications);
    setSearchMode('rent');
    // Reset the Spark card deck
    resetSparkSession();

    // ── Navigate to the sign-in screen ────────────────────────────────────
    // Setting onboardingComplete → false re-renders the onboarding shell.
    // Because all state was cleared above, no previous user data is visible.
    setIsSigningOut(false);
    setOnboardingStep('signup');
    setOnboardingComplete(false);
  };

  // ── Onboarding render ───────────────────────────────────────────────────
  if (!onboardingComplete) {
    return (
      <div className="size-full">
        {onboardingStep === 'splash' && <SplashScreen onComplete={handleSplashComplete} />}
        {onboardingStep === 'signup' && (
          <SignUpScreen
            onContinue={(phone, country) => handleSignUpContinue(phone, country)}
            onSignUp={handleOpenCreateAccount}
            onGuestAccess={handleContinueAsGuest}
          />
        )}
        {onboardingStep === 'create-account' && (
          <CreateAccountScreen
            onBack={() => setOnboardingStep('signup')}
            onRegister={handleCreateAccountRegister}
          />
        )}
        {onboardingStep === 'otp' && (
          <OTPScreen
            phoneNumber={phoneNumber}
            countryCode={countryCode}
            onVerify={handleOTPVerify}
            onBack={() => setOnboardingStep('signup')}
          />
        )}
        {onboardingStep === 'preferences' && (
          <PreferencesScreen
            initialSelected={userPreferences}
            heading={
              userPreferences.length === 0 && welcomeBackPrefs === null
                ? 'What matters to you?'
                : 'Set new preferences'
            }
            subheading={
              userPreferences.length === 0 && welcomeBackPrefs === null
                ? 'Select your lifestyle priorities to get personalized recommendations'
                : 'Pick anything that matters — we’ll match areas accordingly.'
            }
            onComplete={handlePreferencesComplete}
            onSkip={handlePreferencesSkip}
          />
        )}

        <WelcomeBackModal
          open={welcomeBackPrefs !== null}
          preferences={welcomeBackPrefs ?? []}
          onKeepThese={handleKeepSavedPreferences}
          onStartFresh={handleStartFresh}
        />
      </div>
    );
  }

  // Full-bleed screens hide the bottom nav (immersive UIs with their own chrome).
  const isFullBleedScreen =
    mainScreen === 'property-detail' ||
    mainScreen === 'chat' ||
    mainScreen === 'agent-profile';

  // Silence unused ref while we keep it for potential future commit-on-dismiss logic.
  void pendingUndoCommitRef;

  return (
    <div className={`size-full flex flex-col${isSigningOut ? ' sign-out-exit' : ''}`}>
      <div className={`flex-1 overflow-hidden ${isFullBleedScreen ? '' : 'content-pb'}`}>
        {mainScreen === 'home' && (
          <HomeScreen
            userPreferences={userPreferences}
            searchMode={searchMode}
            unreadCount={unreadCount}
            pendingToast={pendingToast}
            onDismissToast={() => setPendingToast(null)}
            onOpenNotifications={handleOpenNotifications}
            onSearchModeChange={setSearchMode}
            onAreaSelect={handleAreaSelect}
            onSearch={(query) => console.log('Search:', query)}
            viewedEntries={viewedEntries}
            bookmarkIds={bookmarkIds}
            onBookmarkToggle={handleGuestBookmarkToggle}
            onPropertySelect={handlePropertySelect}
            onViewAllHistory={handleOpenHistory}
            isGuest={isGuest}
            onGuestSignUp={() => {
              setIsGuest(false);
              setOnboardingComplete(false);
              setOnboardingStep('signup');
            }}
          />
        )}

        {mainScreen === 'spark' && (
          <SparkScreen
            properties={allProperties}
            searchMode={searchMode}
            onPropertySelect={handlePropertySelect}
            onInterestedInProperty={handleSparkInterested}
            onViewChat={handleViewSparkChat}
            isGuest={isGuest}
            onGuestPrompt={() => openGuestPrompt('save and contact agents about properties')}
          />
        )}

        {mainScreen === 'area-results' && selectedArea && (
          <AreaResultsScreen
            area={selectedArea}
            searchMode={searchMode}
            bookmarkIds={bookmarkIds}
            onBookmarkToggle={handleGuestBookmarkToggle}
            comparisonIds={comparisonIds}
            onComparisonToggle={handleGuestComparisonToggle}
            onBack={handleBackToHome}
            onPropertySelect={handlePropertySelect}
          />
        )}

        {mainScreen === 'property-detail' && selectedProperty && (
          <PropertyDetailScreen
            property={selectedProperty}
            searchMode={searchMode}
            onBack={handleBackToAreaResults}
            onFavorite={handleGuestFavoriteFromDetail}
            onCompare={handleGuestCompare}
            onChatWithAgent={handleChatWithAgent}
            onViewAgentProfile={handleViewAgentProfile}
            isFavorited={isBookmarked(selectedProperty.id)}
            bookmarkIds={bookmarkIds}
            viewedEntries={viewedEntries}
            onBookmarkToggle={handleGuestBookmarkToggle}
            onPropertySelect={handlePropertySelect}
            onViewAllSimilar={handleOpenSimilar}
            isGuest={isGuest}
            onGuestAction={() => openGuestPrompt('contact agents')}
            onOpenCalculator={() => setCalcOpen(true)}
          />
        )}

        {mainScreen === 'chat' && chatProperty && (() => {
          const chatAgentId = chatProperty.agentId ?? DEFAULT_AGENT_ID;
          const chatAgent = agentById(chatAgentId) ?? agentById(DEFAULT_AGENT_ID)!;
          return (
            <ChatScreen
              agent={{
                name: chatAgent.fullName,
                branch: chatAgent.agencyName,
                initials: chatAgent.initials,
                phone: chatAgent.phone,
                email: chatAgent.email,
              }}
              agentId={chatAgent.id}
              propertyTitle={chatProperty.title}
              searchMode={searchMode}
              onBack={() => {
                setMainScreen(chatReturnTo);
                if (chatReturnTo === 'spark') setActiveTab('spark');
                else if (chatReturnTo === 'messages') setActiveTab('messages');
              }}
              onFirstMessageSent={handleFirstMessageSent}
              sparkEntry={sparkEntry ?? undefined}
            />
          );
        })()}

        {mainScreen === 'agent-profile' && (() => {
          const profileAgentId = selectedProperty?.agentId ?? DEFAULT_AGENT_ID;
          const profileAgent = agentById(profileAgentId) ?? agentById(DEFAULT_AGENT_ID)!;
          return (
            <AgentProfileScreen
              agent={profileAgent}
              onBack={() => setMainScreen('property-detail')}
              onChatWithAgent={() => {
                if (selectedProperty) {
                  openChatFor(selectedProperty, 'property-detail');
                }
                setMainScreen('chat');
              }}
              isGuest={isGuest}
              onGuestAction={() => openGuestPrompt('contact agents')}
            />
          );
        })()}

        {mainScreen === 'comparison' && (
          <ComparisonScreen
            properties={comparisonProperties}
            searchMode={searchMode}
            onBack={() => {
              setActiveTab('home');
              setMainScreen('home');
            }}
            onPropertySelect={handlePropertySelect}
            onRemoveFromComparison={handleRemoveFromComparison}
          />
        )}

        {mainScreen === 'bookmarks' && (
          <BookmarksScreen
            bookmarks={bookmarkedProperties}
            searchMode={searchMode}
            onPropertySelect={handlePropertySelect}
            onRemoveBookmark={removeBookmark}
            onStartBrowsing={handleStartBrowsingFromBookmarks}
          />
        )}

        {mainScreen === 'profile' && (
          <ProfileScreen
            preferences={userPreferences}
            onUpdatePreferences={handleUpdatePreferences}
            onOpenHistory={handleOpenHistory}
            onOpenCalculations={handleOpenMyCalculations}
            onSignOut={handleSignOut}
            isGuest={isGuest}
            onGuestAction={() => openGuestPrompt('save your calculations')}
          />
        )}

        {mainScreen === 'messages' && (
          <MessagesScreen
            conversations={conversations}
            onOpenConversation={handleOpenConversation}
            onStartConversation={() => {
              setActiveTab('spark');
              setMainScreen('spark');
            }}
          />
        )}

        {mainScreen === 'notifications' && (
          <NotificationsScreen
            notifications={notifications}
            onBack={handleBackToHome}
            onNotificationTap={handleNotificationTap}
          />
        )}

        {mainScreen === 'history' && (
          <RecentlyViewedScreen
            entries={viewedEntries}
            searchMode={searchMode}
            bookmarkIds={bookmarkIds}
            onBookmarkToggle={handleGuestBookmarkToggle}
            onPropertySelect={handlePropertySelect}
            onClearHistory={handleClearHistory}
            onBack={handleBackToHome}
            onStartBrowsing={handleStartBrowsingFromHistory}
          />
        )}

        {mainScreen === 'my-calculations' && (
          <MyCalculationsScreen
            calculations={calculations}
            onBack={() => setMainScreen('profile')}
            onOpenCalculation={handleOpenCalculation}
            onDeleteCalculation={handleDeleteCalculation}
            onOpenCalculator={() => setCalcOpen(true)}
          />
        )}

        {mainScreen === 'similar-properties' && similarContext && (
          <SimilarPropertiesScreen
            target={similarContext}
            searchMode={searchMode}
            bookmarkIds={bookmarkIds}
            viewedEntries={viewedEntries}
            onBookmarkToggle={handleGuestBookmarkToggle}
            onPropertySelect={handlePropertySelect}
            onBack={handleBackFromSimilar}
          />
        )}
      </div>

      {pendingUndo && (
        <BookmarkUndoSnackbar
          propertyTitle={pendingUndo.title}
          onUndo={handleUndoRemove}
          onDismiss={handleDismissUndo}
        />
      )}

      {/* Floating Compare CTA: visible whenever 2+ properties are selected,
          except on the detail and comparison screens themselves. */}
      {!isFullBleedScreen && mainScreen !== 'comparison' && (
        <FloatingCompareCTA
          count={comparisonIds.length}
          onCompare={handleOpenComparison}
          onClear={handleClearComparison}
        />
      )}

      {globalToast && <Toast message={globalToast} onDismiss={() => setGlobalToast(null)} />}

      {!isFullBleedScreen && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          badges={messagesUnreadCount > 0 ? { messages: messagesUnreadCount } : undefined}
        />
      )}

      <GuestPromptSheet
        open={guestPromptOpen}
        feature={guestPromptFeature}
        onSignUp={() => {
          setGuestPromptOpen(false);
          setGuestPromptFeature(undefined);
          setIsGuest(false);
          setOnboardingComplete(false);
          setOnboardingStep('signup');
        }}
        onDismiss={() => {
          setGuestPromptOpen(false);
          setGuestPromptFeature(undefined);
        }}
      />

      {/* Loan calculator FAB + sheet — visible on every screen except chat */}
      <LoanCalculator
        propertyContext={
          mainScreen === 'property-detail' ? selectedProperty : null
        }
        visible={mainScreen !== 'chat'}
        open={calcOpen}
        onOpenChange={(v) => {
          setCalcOpen(v);
          // Clear pre-fill when the sheet is closed so the next FAB open is fresh
          if (!v) setCalcPreFill(null);
        }}
        isGuest={isGuest}
        onGuestSave={() => openGuestPrompt('save your calculations')}
        onSaved={handleCalcSaved}
        preFillCalculation={calcPreFill}
        onViewProperty={calcPreFill?.propertyId ? handleViewPropertyFromCalc : undefined}
      />
    </div>
  );
}
