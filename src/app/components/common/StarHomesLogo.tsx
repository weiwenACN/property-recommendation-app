import { Star } from 'lucide-react';

interface StarHomesLogoProps {
  /**
   * "light" — for placement on dark (#0F0C2E) backgrounds.
   *           Icon box is white/salmon; wordmark is white.
   * "dark"  — for placement on white/light backgrounds.
   *           Icon box is purple; wordmark is navy.
   */
  variant?: 'light' | 'dark';
  /** "sm" for compact headers; "md" for standard placements. */
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Star Homes brand lockup.
 *
 * Light variant (dark backgrounds):
 *   White icon box with filled star — maximum contrast against #0F0C2E.
 *   "Star" in salmon (#E5917A), "Homes" in white — two-tone wordmark.
 *
 * Dark variant (light backgrounds):
 *   Purple gradient box with white filled star.
 *   Wordmark fully in navy (#0F0C2E).
 */
export function StarHomesLogo({
  variant = 'light',
  size = 'md',
  className = '',
}: StarHomesLogoProps) {
  const isLight = variant === 'light';
  const isSm = size === 'sm';

  // Icon sizing
  const boxSize  = isSm ? '30px' : '36px';
  const iconSize = isSm ? '14px' : '18px';
  const radius   = isSm ? '8px'  : '10px';
  const gap      = isSm ? '8px'  : '10px';

  // Typography
  const fontSize   = isSm ? '14px' : '17px';
  const starColor  = isLight ? '#E5917A' : '#3C3489';
  const homesColor = isLight ? '#FFFFFF' : '#0F0C2E';

  // Icon box style
  const boxStyle: React.CSSProperties = isLight
    ? {
        // High-contrast white box on dark background
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(8px)',
        border: '1.5px solid rgba(255,255,255,0.35)',
        color: '#E5917A',
      }
    : {
        // Purple gradient on light background
        background: 'linear-gradient(135deg, #7F77DD 0%, #3C3489 100%)',
        border: 'none',
        color: '#FFFFFF',
      };

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap,
        flexShrink: 0,
      }}
    >
      {/* Icon box */}
      <div
        style={{
          width: boxSize,
          height: boxSize,
          borderRadius: radius,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          ...boxStyle,
        }}
      >
        <Star
          style={{
            width: iconSize,
            height: iconSize,
            color: isLight ? '#E5917A' : '#FFFFFF',
            fill: 'currentColor',
          }}
          strokeWidth={0}
        />
      </div>

      {/* Two-tone wordmark */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
        <span
          style={{
            fontSize,
            fontWeight: 800,
            color: starColor,
            letterSpacing: '-0.4px',
            lineHeight: 1,
          }}
        >
          Star
        </span>
        <span
          style={{
            fontSize,
            fontWeight: 700,
            color: homesColor,
            letterSpacing: '-0.3px',
            lineHeight: 1,
          }}
        >
          Homes
        </span>
      </div>
    </div>
  );
}
