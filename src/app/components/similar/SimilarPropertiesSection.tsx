import { useEffect, useState } from 'react';
import { ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { properties as allProperties, type Property } from '../../data/properties';
import { type SearchMode } from '../../data/pricing';
import type { ViewedEntry } from '../../data/viewedStore';
import { fetchSimilar } from '../../data/similarity';
import { PropertyCard } from '../property/PropertyCard';

interface SimilarPropertiesSectionProps {
  target: Property;
  searchMode: SearchMode;
  bookmarkIds: string[];
  viewedEntries: ViewedEntry[];
  onBookmarkToggle: (property: Property) => void;
  onPropertySelect: (property: Property) => void;
  onViewAll: () => void;
}

const SECTION_LIMIT = 6;

export function SimilarPropertiesSection({
  target,
  searchMode,
  bookmarkIds,
  viewedEntries,
  onBookmarkToggle,
  onPropertySelect,
  onViewAll,
}: SimilarPropertiesSectionProps) {
  const [items, setItems] = useState<Property[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    fetchSimilar(target, allProperties, searchMode, {
      viewedEntries,
      maxResults: SECTION_LIMIT,
    }).then((result) => {
      if (!cancelled) setItems(result);
    });
    return () => {
      cancelled = true;
    };
  }, [target, searchMode, viewedEntries]);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#3C3489]" />
          <h2 className="text-lg font-semibold text-[#0F0C2E]">You might also like</h2>
        </div>
        {items && items.length > 0 && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-sm font-medium text-[#3C3489] hover:underline min-h-[44px]"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {items === null ? (
        <div className="flex items-center justify-center py-8 gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Looking for similar properties…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e5e7eb] bg-[#F7F6FB] px-4 py-6 text-center text-sm text-gray-600">
          We couldn't find anything similar right now.
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
          {items.map((property, idx) => (
            <div key={property.id} className="flex-shrink-0 w-44">
              <PropertyCard
                property={property}
                searchMode={searchMode}
                variant="compact"
                onSelect={onPropertySelect}
                eager={idx === 0}
                isBookmarked={bookmarkIds.includes(property.id)}
                onBookmarkToggle={onBookmarkToggle}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
