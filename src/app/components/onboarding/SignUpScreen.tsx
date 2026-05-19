import { useCallback, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { OnboardingLayout } from './OnboardingLayout';

interface SignUpScreenProps {
  onContinue: (phoneNumber: string) => void;
  onSignUp: () => void;
  onGuestAccess?: () => void;
}

const MAX_DIGITS = 11;

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length <= MAX_DIGITS ? digits : digits.slice(0, MAX_DIGITS);
}

export function SignUpScreen({ onContinue, onSignUp, onGuestAccess }: SignUpScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const ready = phoneNumber.length >= 10;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (ready) onContinue(phoneNumber);
    },
    [onContinue, phoneNumber, ready],
  );

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value));
  }, []);

  return (
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
            htmlFor="phone"
            style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}
          >
            Mobile Number
          </label>
          <div style={{ display: 'flex' }}>
            {/* Country pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 14px',
                height: '54px',
                background: '#F7F6FB',
                border: '1.5px solid #E5E7EB',
                borderRight: 'none',
                borderRadius: '14px 0 0 14px',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '20px', lineHeight: 1 }}>🇬🇧</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F0C2E' }}>+44</span>
            </div>
            {/* Number field */}
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="7XXX XXXXXX"
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
                textDecoration: 'none',
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
  );
}
