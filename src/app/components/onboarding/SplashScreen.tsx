import { Star } from 'lucide-react';
import { useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-0 bg-[#0F0C2E] px-6 relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#3C3489]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-[#7F77DD]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#E5917A]/08 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center relative z-10">
        {/* Icon mark */}
        <div
          className="rounded-[28px] p-5 mb-7 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #7F77DD 0%, #3C3489 100%)',
            boxShadow: '0 16px 48px rgba(60,52,137,0.55), 0 4px 16px rgba(0,0,0,0.3)',
          }}
        >
          <Star
            className="w-16 h-16"
            style={{ color: '#E5917A', fill: '#E5917A' }}
            strokeWidth={0}
          />
        </div>

        {/* Wordmark */}
        <div className="flex items-baseline gap-1.5 mb-3">
          <span
            className="text-4xl font-black tracking-tight"
            style={{ color: '#E5917A', letterSpacing: '-1px' }}
          >
            Star
          </span>
          <span
            className="text-4xl font-bold tracking-tight text-white"
            style={{ letterSpacing: '-0.5px' }}
          >
            Homes
          </span>
        </div>

        <p className="text-base text-gray-400 text-center max-w-xs leading-relaxed">
          Find your perfect home in London
        </p>
      </div>
    </div>
  );
}
