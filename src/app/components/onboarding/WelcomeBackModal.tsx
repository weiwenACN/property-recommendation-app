import { Check } from 'lucide-react';
import { preferenceOptionById } from '../../data/preferences';

interface WelcomeBackModalProps {
  open: boolean;
  preferences: string[];
  onKeepThese: () => void;
  onStartFresh: () => void;
}

export function WelcomeBackModal({
  open,
  preferences,
  onKeepThese,
  onStartFresh,
}: WelcomeBackModalProps) {
  if (!open) return null;

  const items = preferences
    .map((id) => preferenceOptionById(id))
    .filter((opt): opt is NonNullable<typeof opt> => Boolean(opt));

  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/40 animate-in fade-in" />
      <div
        role="dialog"
        aria-labelledby="welcome-back-title"
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom max-h-[85vh] flex flex-col"
      >
        <div className="px-6 pt-4 pb-6 overflow-y-auto">
          <div className="mx-auto h-1.5 w-12 bg-[#e5e7eb] rounded-full mb-4" />

          <h2 id="welcome-back-title" className="text-2xl font-bold text-[#1a2332] mb-1">
            Welcome back!
          </h2>
          <p className="text-sm text-gray-600 mb-5">Your last preferences were:</p>

          {items.length === 0 ? (
            <div className="rounded-2xl bg-[#f9fafb] px-4 py-6 text-center text-sm text-gray-600 mb-6">
              No specific priorities saved &mdash; tap <span className="font-medium text-[#1a2332]">Start Fresh</span> to set some.
            </div>
          ) : (
            <ul className="space-y-2 mb-6">
              {items.map((opt) => {
                const Icon = opt.icon;
                return (
                  <li
                    key={opt.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#fff5f2] border border-[#ff6b35]/30"
                  >
                    <div className="bg-[#ff6b35] rounded-full p-1.5">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                    <Icon className="w-4 h-4 text-[#ff6b35]" />
                    <span className="text-sm font-medium text-[#1a2332]">{opt.label}</span>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="space-y-3">
            <button
              onClick={onKeepThese}
              className="w-full bg-[#ff6b35] text-white py-4 rounded-xl hover:bg-[#ff5722] transition-colors font-medium shadow-lg shadow-[#ff6b35]/20"
            >
              Keep These
            </button>
            <button
              onClick={onStartFresh}
              className="w-full bg-white border-2 border-[#e5e7eb] text-[#1a2332] py-4 rounded-xl hover:bg-[#f9fafb] transition-colors font-medium"
            >
              Start Fresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
