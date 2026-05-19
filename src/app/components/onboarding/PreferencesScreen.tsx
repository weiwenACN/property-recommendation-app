import { useState } from 'react';
import { Check } from 'lucide-react';
import { preferenceOptions } from '../../data/preferences';
import { OnboardingLayout } from './OnboardingLayout';

interface PreferencesScreenProps {
  initialSelected?: string[];
  heading?: string;
  subheading?: string;
  onComplete: (preferences: string[]) => void;
  onSkip: () => void;
}

export function PreferencesScreen({
  initialSelected = [],
  heading = 'What matters to you?',
  subheading = 'Pick your lifestyle priorities and we\'ll match the perfect areas',
  onComplete,
  onSkip,
}: PreferencesScreenProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected);

  const togglePreference = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleContinue = () => onComplete(selected);

  const isReady = selected.length > 0;

  return (
    <OnboardingLayout step={3} totalSteps={3} tagline="Almost there — one last step">
      {/* Heading row with inline Skip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '20px',
          gap: '12px',
        }}
      >
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#0F0C2E',
              letterSpacing: '-0.3px',
              marginBottom: '6px',
              lineHeight: 1.2,
            }}
          >
            {heading}
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.5 }}>
            {subheading}
          </p>
        </div>
        <button
          onClick={onSkip}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            color: '#9CA3AF',
            padding: '2px 0',
            flexShrink: 0,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#6B7280')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
        >
          Skip
        </button>
      </div>

      {/* Preference tiles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '24px',
        }}
      >
        {preferenceOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selected.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => togglePreference(option.id)}
              style={{
                position: 'relative',
                padding: '16px',
                borderRadius: '18px',
                border: `2px solid ${isSelected ? '#3C3489' : '#E5E7EB'}`,
                background: isSelected
                  ? 'linear-gradient(135deg, #EEEDFE 0%, #F5F4FF 100%)'
                  : '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
                boxShadow: isSelected ? '0 4px 16px rgba(60,52,137,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = '#C4C1F0';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = '#E5E7EB';
              }}
            >
              {/* Check badge */}
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#3C3489',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check style={{ width: '11px', height: '11px', color: '#fff', strokeWidth: 3 }} />
                </div>
              )}

              {/* Icon in a coloured box */}
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isSelected ? '#3C3489' : '#F7F6FB',
                  transition: 'background 0.15s',
                }}
              >
                <Icon
                  style={{
                    width: '20px',
                    height: '20px',
                    color: isSelected ? '#FFFFFF' : '#3C3489',
                    transition: 'color 0.15s',
                  }}
                />
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: isSelected ? '#3C3489' : '#0F0C2E',
                  lineHeight: 1.3,
                  display: 'block',
                  transition: 'color 0.15s',
                }}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Continue CTA */}
      <button
        onClick={handleContinue}
        disabled={!isReady}
        style={{
          width: '100%',
          height: '54px',
          borderRadius: '14px',
          border: 'none',
          cursor: isReady ? 'pointer' : 'not-allowed',
          fontSize: '16px',
          fontWeight: 600,
          color: isReady ? '#FFFFFF' : '#9CA3AF',
          background: isReady
            ? 'linear-gradient(135deg, #4F47A8 0%, #3C3489 100%)'
            : '#F3F4F6',
          boxShadow: isReady ? '0 8px 24px rgba(60,52,137,0.30)' : 'none',
          transition: 'opacity 0.15s, box-shadow 0.15s',
        }}
      >
        {isReady ? `Continue · ${selected.length} selected` : 'Select at least one priority'}
      </button>
    </OnboardingLayout>
  );
}
