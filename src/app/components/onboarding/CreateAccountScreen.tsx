import { useCallback, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { OnboardingLayout } from './OnboardingLayout';

interface CreateAccountScreenProps {
  onBack: () => void;
  onRegister: (countryCode: string, phoneNumber: string) => void;
}

interface Country {
  code: string;
  label: string;
  name: string;
  placeholder: string;
  maxDigits: number;
}

const COUNTRIES: Country[] = [
  { code: '+44',  label: '🇬🇧 +44',  name: 'United Kingdom',      placeholder: '7XXX XXXXXX',    maxDigits: 11 },
  { code: '+1',   label: '🇺🇸 +1',   name: 'United States',       placeholder: '(XXX) XXX-XXXX', maxDigits: 10 },
  { code: '+1c',  label: '🇨🇦 +1',   name: 'Canada',              placeholder: '(XXX) XXX-XXXX', maxDigits: 10 },
  { code: '+61',  label: '🇦🇺 +61',  name: 'Australia',           placeholder: '4XX XXX XXX',    maxDigits: 9  },
  { code: '+91',  label: '🇮🇳 +91',  name: 'India',               placeholder: 'XXXXX XXXXX',    maxDigits: 10 },
  { code: '+49',  label: '🇩🇪 +49',  name: 'Germany',             placeholder: '1XX XXXXXXX',    maxDigits: 11 },
  { code: '+33',  label: '🇫🇷 +33',  name: 'France',              placeholder: '6 XX XX XX XX',  maxDigits: 9  },
  { code: '+65',  label: '🇸🇬 +65',  name: 'Singapore',           placeholder: 'XXXX XXXX',      maxDigits: 8  },
  { code: '+971', label: '🇦🇪 +971', name: 'United Arab Emirates', placeholder: '5X XXX XXXX',   maxDigits: 9  },
  { code: '+64',  label: '🇳🇿 +64',  name: 'New Zealand',         placeholder: '2X XXX XXXX',    maxDigits: 9  },
];

const COUNTRY_OPTIONS = COUNTRIES.map((c) => (
  <option key={c.code} value={c.code}>{c.label}</option>
));

const COUNTRIES_BY_KEY = new Map(COUNTRIES.map((c) => [c.code, c]));

export function CreateAccountScreen({ onBack, onRegister }: CreateAccountScreenProps) {
  const [selectedKey, setSelectedKey] = useState<string>('+44');
  const [phoneNumber, setPhoneNumber] = useState('');

  const derived = useMemo(() => {
    const country = COUNTRIES_BY_KEY.get(selectedKey) ?? COUNTRIES[0];
    return {
      country,
      dialingCode: country.code.replace(/c$/, ''),
      minDigits: Math.max(7, country.maxDigits - 2),
    };
  }, [selectedKey]);

  const isValid = phoneNumber.length >= derived.minDigits;

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, '').slice(0, derived.country.maxDigits);
      setPhoneNumber(digits);
    },
    [derived.country.maxDigits],
  );

  const handleCountryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedKey(e.target.value);
    setPhoneNumber('');
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isValid) onRegister(derived.dialingCode, phoneNumber);
    },
    [isValid, onRegister, derived.dialingCode, phoneNumber],
  );

  return (
    <OnboardingLayout
      step={1}
      totalSteps={3}
      tagline="Join thousands of London home seekers"
      topSlot={
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.65)',
            fontSize: '14px',
            fontWeight: 500,
            padding: 0,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
        >
          <ArrowLeft style={{ width: '18px', height: '18px' }} />
          Back
        </button>
      }
    >
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
          Create your account
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>
          Enter your mobile number to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Phone + country */}
        <div>
          <label
            htmlFor="phone"
            style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}
          >
            Mobile Number
          </label>

          <div style={{ display: 'flex' }}>
            {/* Country selector */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <select
                aria-label="Country code"
                value={selectedKey}
                onChange={handleCountryChange}
                style={{
                  height: '54px',
                  paddingLeft: '12px',
                  paddingRight: '34px',
                  background: '#F7F6FB',
                  border: '1.5px solid #E5E7EB',
                  borderRight: 'none',
                  borderRadius: '14px 0 0 14px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#0F0C2E',
                  appearance: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {COUNTRY_OPTIONS}
              </select>
              <ChevronDown
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '14px',
                  height: '14px',
                  color: '#6B7280',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* Phone input */}
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder={derived.country.placeholder}
              style={{
                flex: 1,
                height: '54px',
                padding: '0 16px',
                background: '#F7F6FB',
                border: '1.5px solid #E5E7EB',
                borderLeft: 'none',
                borderRadius: '0 14px 14px 0',
                fontSize: '16px',
                color: '#0F0C2E',
                outline: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7F77DD';
                e.target.style.boxShadow = '0 0 0 3px rgba(127,119,221,0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E5E7EB';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Country hint */}
          <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px' }}>
            {derived.country.name} · format {derived.country.placeholder}
          </p>
        </div>

        {/* Register CTA */}
        <button
          type="submit"
          disabled={!isValid}
          style={{
            width: '100%',
            height: '54px',
            borderRadius: '14px',
            border: 'none',
            cursor: isValid ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '16px',
            fontWeight: 600,
            color: isValid ? '#FFFFFF' : '#9CA3AF',
            background: isValid
              ? 'linear-gradient(135deg, #4F47A8 0%, #3C3489 100%)'
              : '#F3F4F6',
            boxShadow: isValid ? '0 8px 24px rgba(60,52,137,0.32)' : 'none',
            transition: 'opacity 0.15s, box-shadow 0.15s',
          }}
        >
          Create Account
          <ArrowRight style={{ width: '18px', height: '18px' }} />
        </button>
      </form>

      <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', marginTop: '24px', lineHeight: 1.6 }}>
        By registering you agree to our{' '}
        <span style={{ color: '#3C3489', fontWeight: 500 }}>Terms of Service</span>
        {' '}and{' '}
        <span style={{ color: '#3C3489', fontWeight: 500 }}>Privacy Policy</span>
      </p>
    </OnboardingLayout>
  );
}
