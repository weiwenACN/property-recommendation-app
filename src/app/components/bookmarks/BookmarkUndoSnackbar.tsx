import { useEffect } from 'react';
import { BookmarkX } from 'lucide-react';

interface BookmarkUndoSnackbarProps {
  propertyTitle: string;
  onUndo: () => void;
  onDismiss: () => void;
  /** Auto-dismiss after this many ms. */
  durationMs?: number;
}

export function BookmarkUndoSnackbar({
  propertyTitle,
  onUndo,
  onDismiss,
  durationMs = 5000,
}: BookmarkUndoSnackbarProps) {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(t);
  }, [onDismiss, durationMs]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 -translate-x-1/2 z-[9000] flex items-center gap-3 px-4 py-3 bg-[#0F0C2E] text-white rounded-xl shadow-2xl animate-in slide-in-from-bottom"
      style={{ bottom: 'max(calc(env(safe-area-inset-bottom) + 5.5rem), 5.5rem)' }}
    >
      <BookmarkX className="w-4 h-4 flex-shrink-0 text-[#E5917A]" />
      <p className="text-sm flex-1 max-w-[200px] truncate">
        Removed <span className="font-medium">{propertyTitle}</span>
      </p>
      <button
        onClick={onUndo}
        className="text-[#E5917A] font-semibold text-sm uppercase tracking-wider hover:text-[#d4856e]"
      >
        Undo
      </button>
    </div>
  );
}
