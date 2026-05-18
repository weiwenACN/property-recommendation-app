import { useState } from 'react';
import { ArrowLeft, Clock, Trash2, Search } from 'lucide-react';
import { properties as allProperties, type Property } from '../../data/properties';
import { type SearchMode } from '../../data/pricing';
import { formatFullDate } from '../../data/relativeTime';
import type { ViewedEntry } from '../../data/viewedStore';
import { PropertyCard } from '../property/PropertyCard';
import { ClearHistoryConfirm } from './ClearHistoryConfirm';

interface RecentlyViewedScreenProps {
  entries: ViewedEntry[];
  searchMode: SearchMode;
  bookmarkIds: string[];
  onBookmarkToggle: (property: Property) => void;
  onPropertySelect: (property: Property) => void;
  onClearHistory: () => void;
  onBack: () => void;
  onStartBrowsing: () => void;
}

export function RecentlyViewedScreen({
  entries,
  searchMode,
  bookmarkIds,
  onBookmarkToggle,
  onPropertySelect,
  onClearHistory,
  onBack,
  onStartBrowsing,
}: RecentlyViewedScreenProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const items = entries
    .map((entry) => ({ entry, property: allProperties.find((p) => p.id === entry.propertyId) }))
    .filter((x): x is { entry: ViewedEntry; property: Property } => Boolean(x.property));

  const isEmpty = items.length === 0;

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Recently viewed</h1>
            <p className="text-gray-300 text-sm mt-0.5">
              {items.length} {items.length === 1 ? 'property' : 'properties'}
            </p>
          </div>
          {!isEmpty && (
            <button
              onClick={() => setConfirmOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/15 transition-colors text-sm font-medium min-h-[44px]"
            >
              <Trash2 className="w-4 h-4" />
              Clear history
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
            <div className="bg-[#f9fafb] rounded-full p-6 mb-4">
              <Clock className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-[#1a2332] mb-2">Nothing here yet</h2>
            <p className="text-gray-600 mb-6 max-w-xs">
              Properties you open will show up here so you can come back to them later.
            </p>
            <button
              onClick={onStartBrowsing}
              className="inline-flex items-center gap-2 bg-[#ff6b35] text-white px-5 py-3 rounded-xl hover:bg-[#ff5722] transition-colors font-medium shadow-lg shadow-[#ff6b35]/20 min-h-[48px]"
            >
              <Search className="w-4 h-4" />
              Browse properties
            </button>
          </div>
        ) : (
          <div className="px-6 py-4 space-y-4">
            {items.map(({ entry, property }, idx) => (
              <div key={`${entry.propertyId}-${entry.timestamp}`}>
                <p className="text-[11px] text-gray-500 mb-1.5 px-1">
                  Viewed {formatFullDate(entry.timestamp)}
                </p>
                <PropertyCard
                  property={property}
                  searchMode={searchMode}
                  onSelect={onPropertySelect}
                  eager={idx === 0}
                  isBookmarked={bookmarkIds.includes(property.id)}
                  onBookmarkToggle={onBookmarkToggle}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <ClearHistoryConfirm
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onClearHistory();
        }}
      />
    </div>
  );
}
