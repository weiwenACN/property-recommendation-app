import { useState } from 'react';
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
import { HomeScreen } from './components/home/HomeScreen';
import { AreaResultsScreen } from './components/areas/AreaResultsScreen';
import { PropertyDetailScreen } from './components/property/PropertyDetailScreen';
import { ComparisonScreen } from './components/comparison/ComparisonScreen';
import { FavouritesScreen } from './components/favourites/FavouritesScreen';
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
  | 'favourites'
  | 'profile'
  | 'notifications';

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
  const [activeTab, setActiveTab] = useState<'search' | 'favourites' | 'compare' | 'profile'>('search');

  const [selectedArea, setSelectedArea] = useState<RecommendedArea | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [favourites, setFavourites] = useState<Property[]>([]);
  const [comparisonProperties, setComparisonProperties] = useState<Property[]>([]);

  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [pendingToast, setPendingToast] = useState<string | null>(null);

  // Onboarding handlers
  const handleSplashComplete = () => {
    setOnboardingStep('signup');
  };

  // Stand-in for a real "POST /login" call. Looks up saved preferences
  // for this phone (currently localStorage; swap with an API call when a
  // backend lands).
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

  // Main app handlers
  const handleAreaSelect = (area: RecommendedArea) => {
    setSelectedArea(area);
    setMainScreen('area-results');
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setMainScreen('property-detail');
  };

  const handleFavorite = () => {
    if (selectedProperty) {
      const isFavorited = favourites.some((p) => p.id === selectedProperty.id);
      if (isFavorited) {
        setFavourites(favourites.filter((p) => p.id !== selectedProperty.id));
      } else {
        setFavourites([...favourites, selectedProperty]);
      }
    }
  };

  const handleRemoveFavourite = (propertyId: string) => {
    setFavourites(favourites.filter((p) => p.id !== propertyId));
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
        setSelectedArea((current) => current ?? null);
        setMainScreen('property-detail');
        return;
      }
    }
    setMainScreen('home');
  };

  const handleTabChange = (tab: 'search' | 'favourites' | 'compare' | 'profile') => {
    setActiveTab(tab);
    if (tab === 'search') {
      setMainScreen('home');
    } else if (tab === 'favourites') {
      setMainScreen('favourites');
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Show onboarding
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

  return (
    <div className="size-full flex flex-col">
      <div className="flex-1 overflow-hidden pb-16">
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
            onBack={handleBackToHome}
            onPropertySelect={handlePropertySelect}
          />
        )}

        {mainScreen === 'property-detail' && selectedProperty && (
          <PropertyDetailScreen
            property={selectedProperty}
            searchMode={searchMode}
            onBack={handleBackToAreaResults}
            onFavorite={handleFavorite}
            onCompare={handleCompare}
            onContactAgentSent={handleContactAgentSent}
            isFavorited={favourites.some((p) => p.id === selectedProperty.id)}
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

        {mainScreen === 'favourites' && (
          <FavouritesScreen
            favourites={favourites}
            searchMode={searchMode}
            onPropertySelect={handlePropertySelect}
            onRemoveFavourite={handleRemoveFavourite}
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

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
