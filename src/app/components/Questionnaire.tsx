import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface QuestionnaireProps {
  onComplete: (preferences: UserPreferences) => void;
  onBack: () => void;
}

export interface UserPreferences {
  budget: string;
  bedrooms: string;
  lifestyle: string[];
  commute: string;
  amenities: string[];
}

const questions = [
  {
    id: 'budget',
    title: 'What is your budget range?',
    type: 'single',
    options: [
      { value: 'under-500k', label: 'Under £500,000' },
      { value: '500k-750k', label: '£500,000 - £750,000' },
      { value: '750k-1m', label: '£750,000 - £1,000,000' },
      { value: 'over-1m', label: 'Over £1,000,000' },
    ],
  },
  {
    id: 'bedrooms',
    title: 'How many bedrooms do you need?',
    type: 'single',
    options: [
      { value: '1', label: '1 Bedroom' },
      { value: '2', label: '2 Bedrooms' },
      { value: '3', label: '3 Bedrooms' },
      { value: '4+', label: '4+ Bedrooms' },
    ],
  },
  {
    id: 'lifestyle',
    title: 'What describes your lifestyle?',
    subtitle: 'Select all that apply',
    type: 'multiple',
    options: [
      { value: 'young-professional', label: 'Young Professional' },
      { value: 'family', label: 'Family with Children' },
      { value: 'nightlife', label: 'Love Nightlife' },
      { value: 'quiet', label: 'Prefer Quiet Areas' },
      { value: 'creative', label: 'Creative/Artistic' },
    ],
  },
  {
    id: 'commute',
    title: 'Where do you commute to?',
    type: 'single',
    options: [
      { value: 'city', label: 'City of London' },
      { value: 'west-end', label: 'West End' },
      { value: 'canary-wharf', label: 'Canary Wharf' },
      { value: 'mixed', label: 'Multiple Locations' },
      { value: 'remote', label: 'Work from Home' },
    ],
  },
  {
    id: 'amenities',
    title: 'What amenities are important?',
    subtitle: 'Select all that apply',
    type: 'multiple',
    options: [
      { value: 'parks', label: 'Parks & Green Spaces' },
      { value: 'restaurants', label: 'Restaurants & Cafes' },
      { value: 'schools', label: 'Good Schools' },
      { value: 'transport', label: 'Public Transport' },
      { value: 'shopping', label: 'Shopping' },
      { value: 'gyms', label: 'Gyms & Fitness' },
    ],
  },
];

export function Questionnaire({ onComplete, onBack }: QuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({
    lifestyle: [],
    amenities: [],
  });

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    const question = questions[currentStep];

    if (question.type === 'single') {
      setAnswers({ ...answers, [question.id]: value });
    } else {
      const current = (answers[question.id] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      setAnswers({ ...answers, [question.id]: updated });
    }
  };

  const isAnswered = () => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === 'multiple') {
      return Array.isArray(answer) && answer.length > 0;
    }
    return !!answer;
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(answers as UserPreferences);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <button onClick={handlePrev} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <span className="text-sm text-gray-600">
              {currentStep + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-8">
        <h2 className="text-2xl mb-2 text-gray-900">{currentQuestion.title}</h2>
        {currentQuestion.subtitle && (
          <p className="text-sm text-gray-600 mb-6">{currentQuestion.subtitle}</p>
        )}

        <div className="space-y-3 mt-8">
          {currentQuestion.options.map((option) => {
            const isSelected = currentQuestion.type === 'single'
              ? answers[currentQuestion.id] === option.value
              : (answers[currentQuestion.id] as string[] || []).includes(option.value);

            return (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={isSelected ? 'text-blue-900' : 'text-gray-900'}>
                    {option.label}
                  </span>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <button
          onClick={handleNext}
          disabled={!isAnswered()}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {currentStep < questions.length - 1 ? 'Next' : 'See Recommendations'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
