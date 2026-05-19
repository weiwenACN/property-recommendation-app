import { useEffect } from 'react';

interface ToastProps {
  message: string;
  durationMs?: number;
  onDismiss: () => void;
}

export function Toast({ message, durationMs = 3000, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(t);
  }, [durationMs, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 -translate-x-1/2 z-[8500] bg-[#0F0C2E] text-white px-4 py-2.5 rounded-xl shadow-2xl text-sm font-medium animate-in slide-in-from-top max-w-[90vw] text-center"
      style={{ top: 'max(env(safe-area-inset-top), 1rem)' }}
    >
      {message}
    </div>
  );
}
