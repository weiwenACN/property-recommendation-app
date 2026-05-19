import { X } from 'lucide-react';

interface GuestPromptSheetProps {
  open: boolean;
  onSignUp: () => void;
  onDismiss: () => void;
  /**
   * Optional feature name shown in the body copy.
   * Pass a short verb phrase, e.g. "message agents" or "save properties".
   * Falls back to a generic description when omitted.
   */
  feature?: string;
}

export function GuestPromptSheet({ open, onSignUp, onDismiss, feature }: GuestPromptSheetProps) {
  if (!open) return null;

  const body = feature
    ? `Create a free Star Homes account to ${feature}.`
    : 'Sign up to save properties, compare listings, and contact agents.';

  return (
    <div className="fixed inset-0 z-[9500]">
      {/* Scrim */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute inset-0 bg-black/40 animate-in fade-in cursor-default"
        tabIndex={-1}
      />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom px-6 pt-4 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        <div className="mx-auto h-1.5 w-12 bg-[#e5e7eb] rounded-full mb-5" />

        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EEEDFE] flex items-center justify-center text-2xl">
            🔒
          </div>
          <button
            onClick={onDismiss}
            aria-label="Close"
            className="p-2 text-gray-400 hover:text-[#0F0C2E] min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h2 className="text-xl font-semibold text-[#0F0C2E] mb-2">Create a free account</h2>
        <p className="text-sm text-gray-600 mb-6">{body}</p>

        <button
          onClick={onSignUp}
          className="w-full min-h-[52px] bg-[#0F0C2E] text-white rounded-xl font-semibold hover:bg-[#1a1650] transition-colors mb-3 text-base"
        >
          Sign up — it's free
        </button>
        <button
          onClick={onDismiss}
          className="w-full text-sm text-gray-500 hover:text-[#0F0C2E] transition-colors py-2 min-h-[44px]"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
