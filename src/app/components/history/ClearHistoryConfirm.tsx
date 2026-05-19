import { useEffect } from 'react';

interface ClearHistoryConfirmProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ClearHistoryConfirm({ open, onConfirm, onCancel }: ClearHistoryConfirmProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9100]">
      <button
        type="button"
        onClick={onCancel}
        aria-label="Close"
        className="absolute inset-0 bg-black/50 animate-in fade-in cursor-default"
        tabIndex={-1}
      />
      <div
        role="dialog"
        aria-labelledby="clear-history-title"
        aria-describedby="clear-history-body"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl px-6 py-5 animate-in zoom-in"
      >
        <h2 id="clear-history-title" className="text-lg font-semibold text-[#0F0C2E] mb-2">
          Clear viewing history?
        </h2>
        <p id="clear-history-body" className="text-sm text-gray-600 mb-5">
          This permanently removes every property you've recently viewed. You can't undo this.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 min-h-[48px] bg-[#EEEDFE] text-[#3C3489] py-3 rounded-xl hover:bg-[#EEEDFE]/80 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 min-h-[48px] bg-[#ff3b30] text-white py-3 rounded-xl hover:bg-[#e6342a] transition-colors font-medium"
          >
            Yes, Clear
          </button>
        </div>
      </div>
    </div>
  );
}
