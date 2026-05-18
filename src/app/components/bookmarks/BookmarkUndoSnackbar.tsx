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
      className="fixed left-1/2 -translate-x-1/2 z-[9000] flex items-center gap-3 px-4 py-3 bg-[#1a2332] text-white rounded-xl shadow-2xl animate-in slide-in-from-bottom"
      style={{ bottom: 'max(calc(env(safe-area-inset-bottom) + 5.5rem), 5.5rem)' }}
    >
      <BookmarkX className="w-4 h-4 flex-shrink-0 text-[#ff6b35]" />
      <p className="text-sm flex-1 max-w-[200px] truncate">
        Removed <span className="font-medium">{propertyTitle}</span>
      </p>
      <button
        onClick={onUndo}
        className="text-[#ff6b35] font-bold text-sm uppercase tracking-wider hover:text-[#ff5722]"
      >
        Undo
      </button>
    </div>
  );
}
