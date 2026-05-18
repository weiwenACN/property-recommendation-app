import { X, ArrowLeftRight } from 'lucide-react';

interface FloatingCompareCTAProps {
  count: number;
  /** Visually offset above the bottom nav (which is hidden on full-bleed screens). */
  liftAboveBottomNav?: boolean;
  onCompare: () => void;
  onClear: () => void;
}

export function FloatingCompareCTA({
  count,
  liftAboveBottomNav = true,
  onCompare,
  onClear,
}: FloatingCompareCTAProps) {
  if (count < 2) return null;

  const bottomOffset = liftAboveBottomNav
    ? 'max(calc(env(safe-area-inset-bottom) + 5.5rem), 5.5rem)'
    : 'max(env(safe-area-inset-bottom), 1rem)';

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[8000] flex items-center gap-3 bg-[#1a2332] text-white rounded-full shadow-2xl pl-4 pr-1.5 py-1.5 animate-in slide-in-from-bottom"
      style={{ bottom: bottomOffset }}
    >
      <span className="text-sm font-medium">{count} selected</span>
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear selection"
        className="text-white/70 hover:text-white min-w-[36px] min-h-[36px] flex items-center justify-center"
      >
        <X className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onCompare}
        className="flex items-center gap-1.5 bg-[#ff6b35] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#ff5722] transition-colors min-h-[40px]"
      >
        <ArrowLeftRight className="w-4 h-4" />
        Compare ({count})
      </button>
    </div>
  );
}
