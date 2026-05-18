import { useState } from 'react';
import { SplashScreen } from './components/onboarding/SplashScreen';
import { SignUpScreen } from './components/onboarding/SignUpScreen';
import { OTPScreen } from './components/onboarding/OTPScreen';
import { PreferencesScreen } from './components/onboarding/PreferencesScreen';
import { HomeScreen, RecommendedArea } from './components/home/HomeScreen';
import { AreaResultsScreen, Property } from './components/areas/AreaResultsScreen';
import { PropertyDetailScreen } from './components/property/PropertyDetailScreen';
import { ComparisonScreen } from './components/comparison/ComparisonScreen';
import { FavouritesScreen } from './components/favourites/FavouritesScreen';
import { BottomNav } from './components/navigation/BottomNav';

type OnboardingStep = 'splash' | 'signup' | 'otp' | 'preferences';
type MainScreen = 'home' | 'area-results' | 'property-detail' | 'comparison' | 'favourites' | 'profile';

export default function App() {
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('splash');
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userPreferences, setUserPreferences] = useState<string[]>([]);

  const [mainScreen, setMainScreen] = useState<MainScreen>('home');
  const [activeTab, setActiveTab] = useState<'search' | 'favourites' | 'compare' | 'profile'>('search');

  const [selectedArea, setSelectedArea] = useState<RecommendedArea | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [favourites, setFavourites] = useState<Property[]>([]);
  const [comparisonProperties, setComparisonProperties] = useState<Property[]>([]);

  // Onboarding handlers
  const handleSplashComplete = () => {
    setOnboardingStep('signup');
  };

  const handleSignUpContinue = (phone: string) => {
    setPhoneNumber(phone);
    setOnboardingStep('otp');
  };

  const handleOTPVerify = () => {
    setOnboardingStep('preferences');
  };

  const handlePreferencesComplete = (preferences: string[]) => {
    setUserPreferences(preferences);
    setOnboardingComplete(true);
  };

  const handlePreferencesSkip = () => {
    setOnboardingComplete(true);
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
      const isFavorited = favourites.some(p => p.id === selectedProperty.id);
      if (isFavorited) {
        setFavourites(favourites.filter(p => p.id !== selectedProperty.id));
      } else {
        setFavourites([...favourites, selectedProperty]);
      }
    }
  };

  const handleRemoveFavourite = (propertyId: string) => {
    setFavourites(favourites.filter(p => p.id !== propertyId));
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
    setMainScreen('area-results');
  };

  // Show onboarding
  if (!onboardingComplete) {
    return (
      <div className="size-full">
        {onboardingStep === 'splash' && <SplashScreen onComplete={handleSplashComplete} />}
        {onboardingStep === 'signup' && <SignUpScreen onContinue={handleSignUpContinue} />}
        {onboardingStep === 'otp' && (
          <OTPScreen
            phoneNumber={phoneNumber}
            onVerify={handleOTPVerify}
            onBack={() => setOnboardingStep('signup')}
          />
        )}
        {onboardingStep === 'preferences' && (
          <PreferencesScreen
            onComplete={handlePreferencesComplete}
            onSkip={handlePreferencesSkip}
          />
        )}
      </div>
    );
  }

  // Show main app
  return (
    <div className="size-full flex flex-col">
      <div className="flex-1 overflow-hidden pb-16">
        {mainScreen === 'home' && (
          <HomeScreen
            userPreferences={userPreferences}
            onAreaSelect={handleAreaSelect}
            onSearch={(query) => console.log('Search:', query)}
          />
        )}

        {mainScreen === 'area-results' && selectedArea && (
          <AreaResultsScreen
            area={selectedArea}
            onBack={handleBackToHome}
            onPropertySelect={handlePropertySelect}
          />
        )}

        {mainScreen === 'property-detail' && selectedProperty && (
          <PropertyDetailScreen
            property={selectedProperty}
            onBack={handleBackToAreaResults}
            onFavorite={handleFavorite}
            onCompare={handleCompare}
            isFavorited={favourites.some(p => p.id === selectedProperty.id)}
          />
        )}

        {mainScreen === 'comparison' && (
          <ComparisonScreen
            properties={comparisonProperties}
            onBack={() => setMainScreen('home')}
            onPropertySelect={handlePropertySelect}
          />
        )}

        {mainScreen === 'favourites' && (
          <FavouritesScreen
            favourites={favourites}
            onPropertySelect={handlePropertySelect}
            onRemoveFavourite={handleRemoveFavourite}
          />
        )}

        {mainScreen === 'profile' && (
          <div className="flex flex-col h-full bg-white">
            <div className="bg-[#1a2332] px-6 py-8">
              <h1 className="text-2xl font-bold text-white">Profile</h1>
            </div>
            <div className="flex-1 flex items-center justify-center px-6">
              <p className="text-gray-600 text-center">Profile screen coming soon</p>
            </div>
          </div>
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}