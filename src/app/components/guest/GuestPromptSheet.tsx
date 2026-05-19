import { X } from 'lucide-react';

interface GuestPromptSheetProps {
  open: boolean;
  onSignUp: () => void;
  onDismiss: () => void;
}

export function GuestPromptSheet({ open, onSignUp, onDismiss }: GuestPromptSheetProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9500]">
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute inset-0 bg-black/40 animate-in fade-in cursor-default"
        tabIndex={-1}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom px-6 pt-4 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        <div className="mx-auto h-1.5 w-12 bg-[#e5e7eb] rounded-full mb-5" />
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#fff5f2] flex items-center justify-center text-2xl">
            🔒
          </div>
          <button
            onClick={onDismiss}
            aria-label="Close"
            className="p-2 text-gray-400 hover:text-[#1a2332] min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <h2 className="text-xl font-bold text-[#1a2332] mb-2">Create a free account</h2>
        <p className="text-sm text-gray-600 mb-6">
          Sign up to save properties, compare listings, and contact agents.
        </p>
        <button
          onClick={onSignUp}
          className="w-full min-h-[48px] bg-[#1a2332] text-white rounded-xl font-medium hover:bg-[#0f1620] transition-colors mb-3"
        >
          Sign up
        </button>
        <button
          onClick={onDismiss}
          className="w-full text-sm text-gray-500 hover:text-[#1a2332] transition-colors py-2 min-h-[44px]"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
