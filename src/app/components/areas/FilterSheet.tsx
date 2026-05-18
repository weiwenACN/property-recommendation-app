import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import {
  DEFAULT_FILTERS,
  applyFilters,
  type BedroomsFilter,
  type PropertyFilters,
  type PropertyTypeFilter,
} from '../../data/propertyFilters';
import type { Property } from '../../data/properties';
import type { SearchMode } from '../../data/pricing';

interface FilterSheetProps {
  open: boolean;
  initialFilters: PropertyFilters;
  candidateProperties: Property[];
  searchMode: SearchMode;
  onApply: (filters: PropertyFilters) => void;
  onClear: () => void;
  onClose: () => void;
}

const BEDROOM_OPTIONS: { value: BedroomsFilter; label: string }[] = [
  { value: 'any', label: 'Any' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4+', label: '4+' },
];

const PROPERTY_TYPE_OPTIONS: { value: PropertyTypeFilter; label: string }[] = [
  { value: 'any', label: 'Any' },
  { value: 'flat', label: 'Flat' },
  { value: 'house', label: 'House' },
];

export function FilterSheet({
  open,
  initialFilters,
  candidateProperties,
  searchMode,
  onApply,
  onClear,
  onClose,
}: FilterSheetProps) {
  const [draft, setDraft] = useState<PropertyFilters>(initialFilters);

  // Sync draft when sheet (re)opens.
  useEffect(() => {
    if (open) setDraft(initialFilters);
  }, [open, initialFilters]);

  // Escape to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const matchCount = useMemo(
    () => applyFilters(candidateProperties, draft, searchMode).length,
    [candidateProperties, draft, searchMode],
  );

  if (!open) return null;

  const setBedrooms = (value: BedroomsFilter) => setDraft((d) => ({ ...d, bedrooms: value }));
  const setPropertyType = (value: PropertyTypeFilter) =>
    setDraft((d) => ({ ...d, propertyType: value }));

  const handlePriceChange = (key: 'minPrice' | 'maxPrice', raw: string) => {
    const digits = raw.replace(/[^\d]/g, '');
    setDraft((d) => ({ ...d, [key]: digits === '' ? null : Number(digits) }));
  };

  const handleClearAll = () => {
    setDraft(DEFAULT_FILTERS);
    onClear();
  };

  const priceUnit = searchMode === 'rent' ? '£ per month' : '£ total';

  return (
    <div className="fixed inset-0 z-[9000]">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close filters"
        className="absolute inset-0 bg-black/40 animate-in fade-in cursor-default"
        tabIndex={-1}
      />

      <div
        role="dialog"
        aria-labelledby="filter-sheet-title"
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom max-h-[85dvh] flex flex-col"
      >
        <div className="px-6 pt-4 pb-2 flex-shrink-0">
          <div className="mx-auto h-1.5 w-12 bg-[#e5e7eb] rounded-full mb-4" />
          <div className="flex items-start justify-between">
            <h2 id="filter-sheet-title" className="text-xl font-bold text-[#1a2332]">
              Filters
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 -mr-2 text-gray-500 hover:text-[#1a2332] min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-4 overflow-y-auto flex-1 space-y-6">
          <section>
            <h3 className="text-sm font-bold text-[#1a2332] mb-2">Bedrooms</h3>
            <div className="flex flex-wrap gap-2">
              {BEDROOM_OPTIONS.map((opt) => {
                const isActive = draft.bedrooms === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setBedrooms(opt.value)}
                    aria-pressed={isActive}
                    className={`min-w-[48px] min-h-[44px] px-4 rounded-full text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#1a2332] text-white'
                        : 'bg-[#f9fafb] text-[#1a2332] hover:bg-[#f1f3f5]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-[#1a2332] mb-2">Price range</h3>
            <p className="text-xs text-gray-500 mb-2">{priceUnit}</p>
            <div className="flex items-center gap-3">
              <label className="flex-1">
                <span className="sr-only">Minimum price</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    £
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={draft.minPrice ?? ''}
                    onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                    placeholder="Min"
                    className="w-full h-12 pl-7 pr-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-sm text-[#1a2332] focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                  />
                </div>
              </label>
              <span className="text-gray-400 text-sm">to</span>
              <label className="flex-1">
                <span className="sr-only">Maximum price</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    £
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={draft.maxPrice ?? ''}
                    onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                    placeholder="Max"
                    className="w-full h-12 pl-7 pr-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-sm text-[#1a2332] focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                  />
                </div>
              </label>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-[#1a2332] mb-2">Property type</h3>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPE_OPTIONS.map((opt) => {
                const isActive = draft.propertyType === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setPropertyType(opt.value)}
                    aria-pressed={isActive}
                    className={`min-w-[80px] min-h-[44px] px-4 rounded-full text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#1a2332] text-white'
                        : 'bg-[#f9fafb] text-[#1a2332] hover:bg-[#f1f3f5]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="px-6 pt-3 pb-[max(env(safe-area-inset-bottom),1rem)] flex-shrink-0 border-t border-[#f1f3f5] flex gap-3">
          <button
            onClick={handleClearAll}
            className="flex-1 min-h-[48px] bg-white border-2 border-[#e5e7eb] text-[#1a2332] py-3 rounded-xl hover:bg-[#f9fafb] transition-colors font-medium"
          >
            Clear all
          </button>
          <button
            onClick={() => onApply(draft)}
            className="flex-[1.4] min-h-[48px] bg-[#1a2332] text-white py-3 rounded-xl hover:bg-[#0f1620] transition-colors font-medium"
          >
            Show {matchCount} {matchCount === 1 ? 'result' : 'results'}
          </button>
        </div>
      </div>
    </div>
  );
}
