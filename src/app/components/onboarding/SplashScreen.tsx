import { Home } from 'lucide-react';
import { useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a2332] px-6">
      <div className="flex flex-col items-center">
        <div className="bg-[#ff6b35] rounded-3xl p-6 mb-6 shadow-2xl">
          <Home className="w-16 h-16 text-white" strokeWidth={2} />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Star Homes</h1>
        <p className="text-lg text-gray-300 text-center max-w-xs">
          Find your perfect home in London
        </p>
      </div>
    </div>
  );
}
