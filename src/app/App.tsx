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
import {
  NotificationsScreen,
  type Notification,
} from './components/notifications/NotificationsScreen';
import { BottomNav } from './components/navigation/BottomNav';
import {
  properties as allProperties,
  type Property,
  type RecommendedArea,
} from './data/properties';
import type { SearchMode } from './data/pricing';
import { agentById, DEFAULT_AGENT_ID } from './data/agents';

type OnboardingStep = 'splash' | 'signup' | 'create-account' | 'otp' | 'preferences';
type MainScreen =
  | 'home'
  | 'spark'
  | 'area-results'
  | 'property-detail'
  | 'comparison'
  | 'bookmarks'
  | 'history'
  | 'similar-properties'
  | 'profile'
  | 'notifications'
  | 'chat'
  | 'agent-profile';

type TabId = 'search' | 'spark' | 'bookmarks' | 'compare' | 'history' | 'profile';

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
  const [chatProperty, setChatProperty] = useState<Property | null>(null);
  const [chatReturnTo, setChatReturnTo] = useState<MainScreen>('property-detail');
  const [sparkEntry, setSparkEntry] = useState<SparkEntry | null>(null);

  const [searchMode, setSearchMode] = useState<SearchMode>('rent');

  const [mainScreen, setMainScreen] = useState<MainScreen>('home');
  const [activeTab, setActiveTab] = useState<TabId>('search');

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

  const handleSignUpContinue = (phone: string) => {
    setPhoneNumber(phone);
    setCountryCode('+44');

    const saved = lookupSavedPreferences('+44', phone);
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
    setActiveTab('history');
  };

  const handleStartBrowsingFromHistory = () => {
    setActiveTab('search');
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
    setActiveTab('compare');
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
    setActiveTab('compare');
  };

  const handleContactAgentSent = (property: Property) => {
    const notif: Notification = {
      id: `agent-${Date.now()}`,
      type: 'agent-confirmation',
      title: 'Inquiry sent',
      body: `Agent Sarah Chen from Canary Wharf Branch will contact you shortly about ${property.title}.`,
      propertyId: property.id,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
    setPendingToast('Agent Sarah Chen from Canary Wharf Branch will contact you shortly.');
  };

  const handleGuestBookmarkToggle = (property: Property) => {
    if (isGuest) { setGuestPromptOpen(true); return; }
    handleBookmarkToggle(property);
  };

  const handleGuestComparisonToggle = (property: Property) => {
    if (isGuest) { setGuestPromptOpen(true); return; }
    handleComparisonToggle(property);
  };

  const handleGuestFavoriteFromDetail = () => {
    if (isGuest) { setGuestPromptOpen(true); return; }
    handleFavoriteFromDetail();
  };

  const handleGuestCompare = () => {
    if (isGuest) { setGuestPromptOpen(true); return; }
    handleCompare();
  };

  const handleChatWithAgent = () => {
    setChatProperty(selectedProperty);
    setChatReturnTo('property-detail');
    setSparkEntry(null);
    setMainScreen('chat');
  };

  // Called silently when user swipes right — no navigation, just records intent
  // and seeds the chat session so it's ready when they tap "View" on the toast.
  const handleSparkInterested = (property: Property) => {
    setChatProperty(property);
    setChatReturnTo('spark');
    setSparkEntry({
      autoMessage: `Hi, I'm interested in this property — ${property.address}.`,
      sessionKey: `spark-${property.id}`,
      listedPrice: searchMode === 'rent' ? property.rentPrice : property.salePrice,
    });
    // Deliberately does NOT call setMainScreen — navigation happens only via handleViewSparkChat.
  };

  // Called from the toast "View" button after the celebration screen is dismissed.
  const handleViewSparkChat = (property: Property) => {
    setChatProperty(property);
    setChatReturnTo('spark');
    setSparkEntry({
      autoMessage: `Hi, I'm interested in this property — ${property.address}.`,
      sessionKey: `spark-${property.id}`,
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

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    if (tab === 'search') {
      setMainScreen('home');
    } else if (tab === 'spark') {
      setMainScreen('spark');
    } else if (tab === 'bookmarks') {
      setMainScreen('bookmarks');
    } else if (tab === 'compare') {
      setMainScreen('comparison');
    } else if (tab === 'history') {
      setMainScreen('history');
    } else if (tab === 'profile') {
      setMainScreen('profile');
    }
  };

  const handleBackToHome = () => {
    setMainScreen('home');
    setActiveTab('search');
    setSelectedArea(null);
  };

  const handleBackToAreaResults = () => {
    if (propertyDetailReturnTo) {
      const returnTo = propertyDetailReturnTo;
      setMainScreen(returnTo);
      setPropertyDetailReturnTo(null);
      if (returnTo === 'spark') setActiveTab('spark');
      return;
    }
    if (selectedArea) {
      setMainScreen('area-results');
    } else {
      setMainScreen('home');
    }
  };

  const handleStartBrowsingFromBookmarks = () => {
    setActiveTab('search');
    setMainScreen('home');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Onboarding render ───────────────────────────────────────────────────
  if (!onboardingComplete) {
    return (
      <div className="size-full">
        {onboardingStep === 'splash' && <SplashScreen onComplete={handleSplashComplete} />}
        {onboardingStep === 'signup' && (
          <SignUpScreen
            onContinue={handleSignUpContinue}
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

  const isFullBleedScreen =
    mainScreen === 'property-detail' ||
    mainScreen === 'chat' ||
    mainScreen === 'agent-profile';

  // Silence unused ref while we keep it for potential future commit-on-dismiss logic.
  void pendingUndoCommitRef;

  return (
    <div className="size-full flex flex-col">
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
          />
        )}

        {mainScreen === 'spark' && (
          <SparkScreen
            properties={allProperties}
            searchMode={searchMode}
            onPropertySelect={handlePropertySelect}
            onInterestedInProperty={handleSparkInterested}
            onViewChat={handleViewSparkChat}
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
          />
        )}

        {mainScreen === 'chat' && chatProperty && (
          <ChatScreen
            agent={{ name: 'Sarah Chen', branch: 'Canary Wharf Branch', initials: 'SC', phone: '07700 900123', email: 'sarah@starhomes.co.uk' }}
            agentId="agent-1"
            propertyTitle={chatProperty.title}
            searchMode={searchMode}
            onBack={() => {
              setMainScreen(chatReturnTo);
              if (chatReturnTo === 'spark') setActiveTab('spark');
            }}
            onFirstMessageSent={handleFirstMessageSent}
            sparkEntry={sparkEntry ?? undefined}
          />
        )}

        {mainScreen === 'agent-profile' && (
          <AgentProfileScreen
            agent={agentById(DEFAULT_AGENT_ID)!}
            onBack={() => setMainScreen('property-detail')}
            onChatWithAgent={() => { setChatProperty(selectedProperty); setMainScreen('chat'); }}
          />
        )}

        {mainScreen === 'comparison' && (
          <ComparisonScreen
            properties={comparisonProperties}
            searchMode={searchMode}
            onBack={() => {
              setActiveTab('search');
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

      {!isFullBleedScreen && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}

      <GuestPromptSheet
        open={guestPromptOpen}
        onSignUp={() => {
          setGuestPromptOpen(false);
          setIsGuest(false);
          setOnboardingComplete(false);
          setOnboardingStep('signup');
        }}
        onDismiss={() => setGuestPromptOpen(false)}
      />
    </div>
  );
}
