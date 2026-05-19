import { Home } from 'lucide-react';
import { type ReactNode } from 'react';

interface OnboardingLayoutProps {
  /** Which step we're on (1-based). Shows progress dots when provided. */
  step?: number;
  /** Total number of steps. Defaults to 3. */
  totalSteps?: number;
  /** Tagline shown below the wordmark. */
  tagline?: string;
  /** Extra content rendered inside the hero above the logo (e.g. a back button). */
  topSlot?: ReactNode;
  children: ReactNode;
}

/**
 * Shared split-hero shell for all onboarding screens.
 *
 * Layout:
 *   ┌─────────────────────────────────────┐
 *   │  [topSlot]        dark navy hero    │
 *   │                                     │
 *   │       [★]  Star Homes               │
 *   │       tagline text                  │
 *   │       ● ○ ○  step dots              │
 *   ╰╮───────────────────────────────────╯│
 *   │         white card (scrollable)     │
 *   │         form content goes here      │
 *   └─────────────────────────────────────┘
 */
export function OnboardingLayout({
  step,
  totalSteps = 3,
  tagline = 'Find your perfect home in London',
  topSlot,
  children,
}: OnboardingLayoutProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        background: '#0F0C2E',
      }}
    >
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflow: 'hidden',
          minHeight: 'clamp(230px, 42vh, 300px)',
          paddingTop: 'max(env(safe-area-inset-top), 44px)',
          paddingBottom: '48px',
        }}
      >
        {/* Decorative colour blobs */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 375 300"
          fill="none"
          aria-hidden="true"
        >
          {/* Primary purple — top right */}
          <circle cx="355" cy="10"  r="150" fill="#3C3489" fillOpacity="0.55" />
          {/* Mid purple — bottom left */}
          <circle cx="-20" cy="270" r="120" fill="#7F77DD" fillOpacity="0.28" />
          {/* Salmon — bottom centre, very subtle warmth */}
          <circle cx="190" cy="330" r="170" fill="#E5917A" fillOpacity="0.08" />
          {/* Teal — top left, barely visible */}
          <circle cx="55"  cy="-15" r="90"  fill="#1D9E75" fillOpacity="0.10" />
          {/* Sparkle dots */}
          <circle cx="295" cy="215" r="3.5" fill="white"   fillOpacity="0.13" />
          <circle cx="52"  cy="125" r="2.5" fill="white"   fillOpacity="0.10" />
          <circle cx="345" cy="148" r="2"   fill="#E5917A" fillOpacity="0.55" />
          <circle cx="24"  cy="178" r="1.5" fill="#7F77DD" fillOpacity="0.65" />
          <circle cx="200" cy="48"  r="2"   fill="white"   fillOpacity="0.08" />
          <circle cx="160" cy="250" r="1.5" fill="#7F77DD" fillOpacity="0.30" />
        </svg>

        {/* Back button / other top controls */}
        {topSlot && (
          <div style={{ position: 'relative', zIndex: 10, padding: '0 20px', marginBottom: '8px' }}>
            {topSlot}
          </div>
        )}

        {/* Logo + tagline */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 24px',
            textAlign: 'center',
          }}
        >
          {/* Icon box */}
          <div
            style={{
              background: 'linear-gradient(135deg, #4F47A8 0%, #3C3489 100%)',
              borderRadius: '22px',
              padding: '18px',
              marginBottom: '16px',
              flexShrink: 0,
              boxShadow: '0 16px 40px rgba(60,52,137,0.6), inset 0 1px 0 rgba(255,255,255,0.18)',
            }}
          >
            <Home style={{ width: '40px', height: '40px', color: '#fff', strokeWidth: 1.75 }} />
          </div>

          {/* Wordmark */}
          <p
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.4px',
              lineHeight: 1,
              margin: 0,
            }}
          >
            Star Homes
          </p>

          {/* Tagline */}
          <p
            style={{
              fontSize: '13px',
              color: '#9895B5',
              marginTop: '8px',
              maxWidth: '220px',
              lineHeight: 1.4,
            }}
          >
            {tagline}
          </p>
        </div>

        {/* Step progress dots */}
        {step != null && totalSteps > 1 && (
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                style={{
                  height: '6px',
                  width: i === step - 1 ? '22px' : '6px',
                  borderRadius: '999px',
                  background: i === step - 1 ? '#7F77DD' : 'rgba(255,255,255,0.22)',
                  transition: 'width 0.3s ease, background 0.3s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── White card ───────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          flex: 1,
          background: '#FFFFFF',
          borderRadius: '28px 28px 0 0',
          marginTop: '-28px',
          overflowY: 'auto',
          boxShadow: '0 -6px 32px rgba(0,0,0,0.14)',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '4px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '999px', background: '#E5E7EB' }} />
        </div>

        {/* Form content */}
        <div
          style={{
            padding: '20px 24px max(32px, env(safe-area-inset-bottom))',
            maxWidth: '480px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
