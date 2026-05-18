import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { properties as allProperties, type Property } from '../../data/properties';
import { type SearchMode } from '../../data/pricing';
import type { ViewedEntry } from '../../data/viewedStore';
import { fetchSimilar } from '../../data/similarity';
import { PropertyCard } from '../property/PropertyCard';

interface SimilarPropertiesScreenProps {
  target: Property;
  searchMode: SearchMode;
  bookmarkIds: string[];
  viewedEntries: ViewedEntry[];
  onBookmarkToggle: (property: Property) => void;
  onPropertySelect: (property: Property) => void;
  onBack: () => void;
}

type SortKey = 'relevance' | 'price-asc' | 'price-desc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'relevance', label: 'Most relevant' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

function priceOf(property: Property, mode: SearchMode): number {
  return mode === 'rent' ? property.rentPrice : property.salePrice;
}

export function SimilarPropertiesScreen({
  target,
  searchMode,
  bookmarkIds,
  viewedEntries,
  onBookmarkToggle,
  onPropertySelect,
  onBack,
}: SimilarPropertiesScreenProps) {
  const [items, setItems] = useState<Property[] | null>(null);
  const [sort, setSort] = useState<SortKey>('relevance');

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    fetchSimilar(target, allProperties, searchMode, {
      viewedEntries,
      maxResults: 10,
    }).then((result) => {
      if (!cancelled) setItems(result);
    });
    return () => {
      cancelled = true;
    };
  }, [target, searchMode, viewedEntries]);

  const sorted = useMemo(() => {
    if (!items) return null;
    if (sort === 'price-asc') {
      return [...items].sort((a, b) => priceOf(a, searchMode) - priceOf(b, searchMode));
    }
    if (sort === 'price-desc') {
      return [...items].sort((a, b) => priceOf(b, searchMode) - priceOf(a, searchMode));
    }
    return items;
  }, [items, sort, searchMode]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-[#1a2332] px-6 pb-4 header-pt">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white hover:text-[#ff6b35] transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#ff6b35]" />
          <h1 className="text-2xl font-bold text-white">Similar properties</h1>
        </div>
        <p className="text-gray-300 text-sm truncate">
          Like {target.title} &middot; {target.address}
        </p>
      </div>

      {/* Sort bar */}
      <div className="border-b border-[#e5e7eb] px-6 py-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2">
          {SORT_OPTIONS.map((option) => {
            const isActive = sort === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setSort(option.value)}
                aria-pressed={isActive}
                className={`px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                  isActive
                    ? 'bg-[#1a2332] text-white'
                    : 'bg-[#f9fafb] text-[#1a2332] hover:bg-[#f1f3f5]'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {sorted === null ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mb-2" />
            <p className="text-sm">Loading similar properties…</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
            <p className="text-[#1a2332] font-medium mb-1">No similar listings yet</p>
            <p className="text-sm text-gray-600">
              We'll surface new matches as fresh properties go live.
            </p>
          </div>
        ) : (
          <div className="px-6 py-4 space-y-4">
            {sorted.map((property, idx) => (
              <PropertyCard
                key={property.id}
                property={property}
                searchMode={searchMode}
                onSelect={onPropertySelect}
                eager={idx === 0}
                isBookmarked={bookmarkIds.includes(property.id)}
                onBookmarkToggle={onBookmarkToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
