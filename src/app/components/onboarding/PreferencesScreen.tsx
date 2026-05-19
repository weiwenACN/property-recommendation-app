import { useState } from 'react';
import { Check } from 'lucide-react';
import { StarHomesLogo } from '../common/StarHomesLogo';
import { preferenceOptions } from '../../data/preferences';

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
  subheading = 'Select your lifestyle priorities to get personalized recommendations',
  onComplete,
  onSkip,
}: PreferencesScreenProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected);

  const togglePreference = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    onComplete(selected);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white px-6 pt-safe pb-safe overflow-y-auto">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full py-8">
        <div className="mb-8">
          <StarHomesLogo variant="dark" className="mb-6" />
          <h1 className="text-3xl font-semibold text-[#0F0C2E] mb-3">{heading}</h1>
          <p className="text-gray-600">{subheading}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {preferenceOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selected.includes(option.id);

            return (
              <button
                key={option.id}
                onClick={() => togglePreference(option.id)}
                className={`relative p-4 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'border-[#3C3489] bg-[#EEEDFE]'
                    : 'border-[#e5e7eb] bg-white hover:border-[#7F77DD]'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-[#3C3489] rounded-full p-1">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
                <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-[#3C3489]' : 'text-[#0F0C2E]'}`} />
                <div className={`text-sm font-medium ${isSelected ? 'text-[#3C3489]' : 'text-[#0F0C2E]'}`}>
                  {option.label}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-auto space-y-3">
          <button
            onClick={handleContinue}
            disabled={selected.length === 0}
            className="w-full bg-[#3C3489] text-white py-4 rounded-xl hover:bg-[#2d2766] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium shadow-lg shadow-[#3C3489]/20"
          >
            Continue {selected.length > 0 && `(${selected.length})`}
          </button>
          <button
            onClick={onSkip}
            className="w-full text-gray-600 py-4 hover:text-[#0F0C2E] transition-colors font-medium"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
