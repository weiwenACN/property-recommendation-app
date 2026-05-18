import { useEffect, useMemo, useRef, useState } from 'react';
import { SplashScreen } from './components/onboarding/SplashScreen';
import { SignUpScreen } from './components/onboarding/SignUpScreen';
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

type OnboardingStep = 'splash' | 'signup' | 'create-account' | 'otp' | 'preferences';
type MainScreen =
  | 'home'
  | 'area-results'
  | 'property-detail'
  | 'comparison'
  | 'bookmarks'
  | 'profile'
  | 'notifications';

type TabId = 'search' | 'bookmarks' | 'compare' | 'profile';

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

  const [searchMode, setSearchMode] = useState<SearchMode>('rent');

  const [mainScreen, setMainScreen] = useState<MainScreen>('home');
  const [activeTab, setActiveTab] = useState<TabId>('search');

  const [selectedArea, setSelectedArea] = useState<RecommendedArea | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);
  const [comparisonProperties, setComparisonProperties] = useState<Property[]>([]);

  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [pendingToast, setPendingToast] = useState<string | null>(null);

  // Undo snackbar state.
  const [pendingUndo, setPendingUndo] = useState<Property | null>(null);
  const pendingUndoCommitRef = useRef<number | null>(null);

  const activePhoneKey = useMemo(
    () => (onboardingComplete ? phoneKey(countryCode, phoneNumber) : null),
    [onboardingComplete, countryCode, phoneNumber],
  );

  // Hydrate bookmarks from storage once we know who the user is.
  useEffect(() => {
    if (!activePhoneKey) return;
    setBookmarkIds(loadBookmarks(activePhoneKey));
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
    setSelectedProperty(property);
    setMainScreen('property-detail');
  };

  const handleFavoriteFromDetail = () => {
    if (selectedProperty) handleBookmarkToggle(selectedProperty);
  };

  const handleCompare = () => {
    if (selectedProperty) {
      if (comparisonProperties.length < 2) {
        setComparisonProperties([...comparisonProperties, selectedProperty]);
      }
      if (comparisonProperties.length === 1) {
        setMainScreen('comparison');
        setActiveTab('compare');
      }
    }
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
    } else if (tab === 'bookmarks') {
      setMainScreen('bookmarks');
    } else if (tab === 'compare') {
      setMainScreen('comparison');
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

  const isFullBleedScreen = mainScreen === 'property-detail';

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
          />
        )}

        {mainScreen === 'area-results' && selectedArea && (
          <AreaResultsScreen
            area={selectedArea}
            searchMode={searchMode}
            bookmarkIds={bookmarkIds}
            onBookmarkToggle={handleBookmarkToggle}
            onBack={handleBackToHome}
            onPropertySelect={handlePropertySelect}
          />
        )}

        {mainScreen === 'property-detail' && selectedProperty && (
          <PropertyDetailScreen
            property={selectedProperty}
            searchMode={searchMode}
            onBack={handleBackToAreaResults}
            onFavorite={handleFavoriteFromDetail}
            onCompare={handleCompare}
            onContactAgentSent={handleContactAgentSent}
            isFavorited={isBookmarked(selectedProperty.id)}
          />
        )}

        {mainScreen === 'comparison' && (
          <ComparisonScreen
            properties={comparisonProperties}
            searchMode={searchMode}
            onBack={() => setMainScreen('home')}
            onPropertySelect={handlePropertySelect}
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
      </div>

      {pendingUndo && (
        <BookmarkUndoSnackbar
          propertyTitle={pendingUndo.title}
          onUndo={handleUndoRemove}
          onDismiss={handleDismissUndo}
        />
      )}

      {!isFullBleedScreen && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}
    </div>
  );
}
