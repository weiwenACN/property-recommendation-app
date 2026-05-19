import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { OnboardingLayout } from './OnboardingLayout';

interface OTPScreenProps {
  phoneNumber: string;
  countryCode?: string;
  onVerify: () => void;
  onBack: () => void;
}

export function OTPScreen({ phoneNumber, countryCode = '+44', onVerify, onBack }: OTPScreenProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const filledCount = otp.filter(Boolean).length;

  const handleChange = (index: number, value: string) => {
    // Support paste of full code
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const next = [...otp];
      digits.forEach((d, i) => { if (i < 6) next[i] = d; });
      setOtp(next);
      const focusIdx = Math.min(digits.length, 5);
      inputRefs.current[focusIdx]?.focus();
      if (next.every(Boolean)) setTimeout(() => onVerify(), 500);
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every(Boolean)) setTimeout(() => onVerify(), 500);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <OnboardingLayout
      step={2}
      totalSteps={3}
      tagline="We keep your account secure"
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
      {/* Icon + heading */}
      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: '#EEEDFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <MessageSquare style={{ width: '24px', height: '24px', color: '#3C3489' }} />
        </div>

        <h1
          style={{
            fontSize: '26px',
            fontWeight: 700,
            color: '#0F0C2E',
            letterSpacing: '-0.4px',
            marginBottom: '8px',
          }}
        >
          Check your messages
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5 }}>
          We sent a 6-digit code to{' '}
          <span style={{ fontWeight: 600, color: '#0F0C2E', whiteSpace: 'nowrap' }}>
            {countryCode} {phoneNumber}
          </span>
        </p>
      </div>

      {/* OTP boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '8px' }}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            aria-label={`Digit ${index + 1} of 6`}
            style={{
              aspectRatio: '1',
              width: '100%',
              textAlign: 'center',
              fontSize: '22px',
              fontWeight: 700,
              color: '#0F0C2E',
              background: digit ? '#EEEDFE' : '#F7F6FB',
              border: `2px solid ${digit ? '#7F77DD' : '#E5E7EB'}`,
              borderRadius: '14px',
              outline: 'none',
              transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
              caretColor: '#3C3489',
            }}
            onFocus={(e) => {
              if (!digit) {
                e.target.style.borderColor = '#7F77DD';
                e.target.style.boxShadow = '0 0 0 3px rgba(127,119,221,0.18)';
              }
            }}
            onBlur={(e) => {
              if (!digit) {
                e.target.style.borderColor = '#E5E7EB';
                e.target.style.boxShadow = 'none';
              }
            }}
          />
        ))}
      </div>

      {/* Progress hint */}
      <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '28px' }}>
        {filledCount === 6 ? 'Verifying…' : `${filledCount} of 6 digits entered`}
      </p>

      {/* Resend */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>
          Didn't receive a code?{' '}
          <button
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '14px',
              fontWeight: 600,
              color: '#3C3489',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            Resend
          </button>
        </p>
      </div>
    </OnboardingLayout>
  );
}
