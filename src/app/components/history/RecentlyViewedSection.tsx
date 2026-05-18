import { Clock, ChevronRight } from 'lucide-react';
import { properties as allProperties, type Property } from '../../data/properties';
import { type SearchMode } from '../../data/pricing';
import { viewedAtLabel } from '../../data/relativeTime';
import type { ViewedEntry } from '../../data/viewedStore';
import { PropertyCard } from '../property/PropertyCard';

interface RecentlyViewedSectionProps {
  entries: ViewedEntry[];
  searchMode: SearchMode;
  bookmarkIds: string[];
  onBookmarkToggle: (property: Property) => void;
  onPropertySelect: (property: Property) => void;
  onViewAll: () => void;
}

const MAX_HOME = 5;

export function RecentlyViewedSection({
  entries,
  searchMode,
  bookmarkIds,
  onBookmarkToggle,
  onPropertySelect,
  onViewAll,
}: RecentlyViewedSectionProps) {
  const items = entries
    .slice(0, MAX_HOME)
    .map((entry) => ({ entry, property: allProperties.find((p) => p.id === entry.propertyId) }))
    .filter((x): x is { entry: ViewedEntry; property: Property } => Boolean(x.property));

  if (items.length === 0) return null;

  return (
    <section className="pt-2">
      <div className="px-6 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#ff6b35]" />
          <h2 className="text-xl font-bold text-[#1a2332]">Recently viewed</h2>
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-sm font-medium text-[#ff6b35] hover:underline min-h-[44px]"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 px-6 scrollbar-hide">
        {items.map(({ entry, property }) => (
          <div key={`${entry.propertyId}-${entry.timestamp}`} className="flex-shrink-0 w-48">
            <PropertyCard
              property={property}
              searchMode={searchMode}
              variant="compact"
              onSelect={onPropertySelect}
              isBookmarked={bookmarkIds.includes(property.id)}
              onBookmarkToggle={onBookmarkToggle}
              viewedAtLabel={viewedAtLabel(entry.timestamp)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
