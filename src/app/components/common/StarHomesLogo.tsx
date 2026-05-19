import { Home } from 'lucide-react';

interface StarHomesLogoProps {
  /**
   * "light" — white text, for placement on dark (#0F0C2E) backgrounds.
   * "dark"  — navy text, for placement on white/light backgrounds.
   */
  variant?: 'light' | 'dark';
  /** "sm" for compact headers; "md" for prominent placements. */
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Reusable Star Homes brand lockup — purple icon box + wordmark.
 * Matches the SplashScreen design language at a smaller scale.
 */
export function StarHomesLogo({
  variant = 'light',
  size = 'md',
  className = '',
}: StarHomesLogoProps) {
  const iconClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const padClass   = size === 'sm' ? 'p-1'         : 'p-1.5';
  const radClass   = size === 'sm' ? 'rounded-md'  : 'rounded-lg';
  const textClass  = size === 'sm' ? 'text-sm'     : 'text-base';
  const colorClass = variant === 'light' ? 'text-white' : 'text-[#0F0C2E]';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`bg-[#3C3489] ${radClass} ${padClass} flex-shrink-0`}>
        <Home className={`${iconClass} text-white`} strokeWidth={2} />
      </div>
      <span
        className={`font-semibold ${textClass} ${colorClass} tracking-tight leading-none`}
      >
        Star Homes
      </span>
    </div>
  );
}
