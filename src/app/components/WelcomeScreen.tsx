import { Home, MapPin, Search } from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md">
        <div className="bg-blue-600 rounded-full p-6 mb-6">
          <Home className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-3xl mb-4 text-gray-900">Welcome to Star Homes</h1>
        <p className="text-lg text-gray-600 mb-8">
          London's leading estate agent with over 30 branches across the city
        </p>

        <div className="space-y-6 w-full mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="mb-1 text-gray-900">Discover Your Perfect Area</h3>
              <p className="text-sm text-gray-600">
                Answer a few questions to get personalized neighborhood recommendations
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="mb-1 text-gray-900">Browse Properties</h3>
              <p className="text-sm text-gray-600">
                Explore available homes in areas that match your lifestyle
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onGetStarted}
        className="w-full max-w-md bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 transition-colors"
      >
        Get Started
      </button>
    </div>
  );
}
