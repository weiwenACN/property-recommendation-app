import { useState } from 'react';
import { Check } from 'lucide-react';
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
    <div className="flex flex-col min-h-screen bg-white px-6">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a2332] mb-3">{heading}</h1>
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
                    ? 'border-[#ff6b35] bg-[#fff5f2]'
                    : 'border-[#e5e7eb] bg-white hover:border-[#ffa07a]'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-[#ff6b35] rounded-full p-1">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
                <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-[#ff6b35]' : 'text-[#1a2332]'}`} />
                <div className={`text-sm font-medium ${isSelected ? 'text-[#ff6b35]' : 'text-[#1a2332]'}`}>
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
            className="w-full bg-[#ff6b35] text-white py-4 rounded-xl hover:bg-[#ff5722] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium shadow-lg shadow-[#ff6b35]/20"
          >
            Continue {selected.length > 0 && `(${selected.length})`}
          </button>
          <button
            onClick={onSkip}
            className="w-full text-gray-600 py-4 hover:text-[#1a2332] transition-colors font-medium"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
