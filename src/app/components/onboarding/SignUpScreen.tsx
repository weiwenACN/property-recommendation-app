import { useCallback, useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, Check, X } from 'lucide-react';
import { OnboardingLayout } from './OnboardingLayout';
import { COUNTRIES, DEFAULT_COUNTRY_KEY, countryByKey, flagUrl, type Country } from '../../data/countries';

// ── FlagImg ───────────────────────────────────────────────────────────────────
// Renders a real flag PNG from flagcdn.com with fixed dimensions — no emoji
// rendering quirks, pixel-perfect alignment on every OS.

interface FlagImgProps {
  code: string;
  /** Rendered width in px. Height is computed at the 4:3 flag aspect ratio. */
  width?: number;
}

function FlagImg({ code, width = 20 }: FlagImgProps) {
  const h = Math.round(width * 0.75);
  return (
    <img
      src={flagUrl(code, 40)}
      width={width}
      height={h}
      alt=""
      aria-hidden="true"
      style={{
        display: 'block',
        width: `${width}px`,
        height: `${h}px`,
        objectFit: 'cover',
        borderRadius: '2px',
        flexShrink: 0,
      }}
    />
  );
}

interface SignUpScreenProps {
  onContinue: (phoneNumber: string, countryCode: string) => void;
  onSignUp: () => void;
  onGuestAccess?: () => void;
}

// ── Country picker bottom sheet ───────────────────────────────────────────────

interface CountrySheetProps {
  selected: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}

function CountrySheet({ selected, onSelect, onClose }: CountrySheetProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.flag.includes(q),
    );
  }, [query]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9900 }}>
      {/* Scrim */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#FFFFFF',
          borderRadius: '24px 24px 0 0',
          maxHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 -4px 32px rgba(0,0,0,0.15)',
        }}
      >
        {/* Handle + header */}
        <div style={{ padding: '12px 20px 0', flexShrink: 0 }}>
          <div
            style={{
              width: '40px',
              height: '4px',
              background: '#E5E7EB',
              borderRadius: '2px',
              margin: '0 auto 16px',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F0C2E', margin: 0, letterSpacing: '-0.3px' }}>
              Select country
            </h3>
            <button
              onClick={onClose}
              style={{
                background: '#F7F6FB',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#6B7280',
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search country or code…"
            autoFocus
            style={{
              width: '100%',
              height: '42px',
              padding: '0 14px',
              background: '#F7F6FB',
              border: '1.5px solid #E5E7EB',
              borderRadius: '12px',
              fontSize: '14px',
              color: '#0F0C2E',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '8px',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#7F77DD'; }}
            onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
          />
        </div>

        {/* Country list */}
        <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '14px', padding: '32px 20px' }}>
              No countries match "{query}"
            </p>
          ) : (
            filtered.map((country: Country) => {
              const isSelected = country.key === selected;
              return (
                <button
                  key={country.key}
                  onClick={() => { onSelect(country.key); onClose(); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '13px 20px',
                    background: isSelected ? '#EEEDFE' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #F9FAFB',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {/* Flag */}
                  <FlagImg code={country.code} width={26} />

                  {/* Name */}
                  <span
                    style={{
                      flex: 1,
                      fontSize: '14px',
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? '#3C3489' : '#0F0C2E',
                    }}
                  >
                    {country.name}
                  </span>

                  {/* Dial code */}
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: isSelected ? '#3C3489' : '#9CA3AF',
                      flexShrink: 0,
                    }}
                  >
                    {country.dialCode}
                  </span>

                  {/* Selected tick */}
                  {isSelected && (
                    <Check
                      style={{ width: '16px', height: '16px', color: '#3C3489', flexShrink: 0 }}
                      strokeWidth={2.5}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ── SignUpScreen ──────────────────────────────────────────────────────────────

export function SignUpScreen({ onContinue, onSignUp, onGuestAccess }: SignUpScreenProps) {
  const [selectedKey, setSelectedKey] = useState(DEFAULT_COUNTRY_KEY);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const country = useMemo(() => countryByKey(selectedKey), [selectedKey]);
  const minDigits = Math.max(7, country.maxDigits - 2);
  const ready = phoneNumber.length >= minDigits;

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, '').slice(0, country.maxDigits);
      setPhoneNumber(digits);
    },
    [country.maxDigits],
  );

  const handleCountrySelect = (key: string) => {
    setSelectedKey(key);
    setPhoneNumber('');
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (ready) onContinue(phoneNumber, country.dialCode);
    },
    [onContinue, phoneNumber, ready, country.dialCode],
  );

  return (
    <>
      <OnboardingLayout step={1} totalSteps={3} tagline="Your next home is just a search away">
        {/* Heading */}
        <div style={{ marginBottom: '28px' }}>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: '#0F0C2E',
              letterSpacing: '-0.4px',
              marginBottom: '6px',
            }}
          >
            Welcome back 👋
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>
            Enter your mobile number to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Phone input */}
          <div>
            <label
              htmlFor="phone-login"
              style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}
            >
              Mobile Number
            </label>

            <div style={{ display: 'flex', borderRadius: '14px', overflow: 'hidden', border: '1.5px solid #E5E7EB' }}>
              {/* Country picker trigger */}
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                aria-label={`Country: ${country.name} (${country.dialCode}). Tap to change.`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '0 10px 0 14px',
                  height: '54px',
                  background: '#F7F6FB',
                  border: 'none',
                  borderRight: '1.5px solid #E5E7EB',
                  cursor: 'pointer',
                  flexShrink: 0,
                  minWidth: '96px',
                }}
              >
                {/* Flag image — exact pixel dimensions, no emoji rendering quirks */}
                <FlagImg code={country.code} width={22} />
                {/* Dial code */}
                <span style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#0F0C2E',
                  letterSpacing: '-0.2px',
                  flexShrink: 0,
                  lineHeight: 1,
                }}>
                  {country.dialCode}
                </span>
                {/* Chevron */}
                <ChevronDown style={{ width: '13px', height: '13px', color: '#9CA3AF', flexShrink: 0 }} />
              </button>

              {/* Number input */}
              <input
                id="phone-login"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder={country.placeholder}
                style={{
                  flex: 1,
                  height: '54px',
                  padding: '0 16px',
                  background: '#F7F6FB',
                  border: 'none',
                  fontSize: '16px',
                  color: '#0F0C2E',
                  outline: 'none',
                  minWidth: 0,
                }}
              />
            </div>

            {/* Country hint */}
            <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px' }}>
              {country.name} · format {country.placeholder}
            </p>
          </div>

          {/* Continue CTA */}
          <button
            type="submit"
            disabled={!ready}
            style={{
              width: '100%',
              height: '54px',
              borderRadius: '14px',
              border: 'none',
              cursor: ready ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '16px',
              fontWeight: 600,
              color: ready ? '#FFFFFF' : '#9CA3AF',
              background: ready
                ? 'linear-gradient(135deg, #4F47A8 0%, #3C3489 100%)'
                : '#F3F4F6',
              boxShadow: ready ? '0 8px 24px rgba(60,52,137,0.32)' : 'none',
              transition: 'opacity 0.15s, box-shadow 0.15s',
            }}
          >
            Continue
            <ArrowRight style={{ width: '18px', height: '18px' }} />
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
            <span style={{ fontSize: '11px', color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              or
            </span>
            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
          </div>

          {/* Create account */}
          <button
            type="button"
            onClick={onSignUp}
            style={{
              width: '100%',
              height: '54px',
              borderRadius: '14px',
              border: 'none',
              cursor: 'pointer',
              background: '#EEEDFE',
              color: '#3C3489',
              fontSize: '15px',
              fontWeight: 600,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#E4E1FD')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#EEEDFE')}
          >
            Create an account
          </button>

          {/* Guest access */}
          {onGuestAccess && (
            <div style={{ textAlign: 'center', paddingTop: '4px' }}>
              <button
                type="button"
                onClick={onGuestAccess}
                style={{
                  fontSize: '13px',
                  color: '#9CA3AF',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#6B7280')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
              >
                Continue as guest
              </button>
            </div>
          )}
        </form>

        {/* Legal */}
        <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', marginTop: '24px', lineHeight: 1.6 }}>
          By continuing you agree to our{' '}
          <span style={{ color: '#3C3489', fontWeight: 500 }}>Terms of Service</span>
          {' '}and{' '}
          <span style={{ color: '#3C3489', fontWeight: 500 }}>Privacy Policy</span>
        </p>
      </OnboardingLayout>

      {/* Country picker sheet — rendered outside layout so it can be fixed-position */}
      {pickerOpen && (
        <CountrySheet
          selected={selectedKey}
          onSelect={handleCountrySelect}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}
