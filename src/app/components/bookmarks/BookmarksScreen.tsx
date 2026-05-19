import { Bookmark, Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { StarHomesLogo } from '../common/StarHomesLogo';
import type { Property } from '../../data/properties';
import { type SearchMode } from '../../data/pricing';
import { PropertyCard } from '../property/PropertyCard';

type SortMode = 'saved' | 'price-asc' | 'price-desc';

interface BookmarksScreenProps {
  bookmarks: Property[];
  searchMode: SearchMode;
  onPropertySelect: (property: Property) => void;
  onRemoveBookmark: (property: Property) => void;
  onStartBrowsing: () => void;
}

export function BookmarksScreen({
  bookmarks,
  searchMode,
  onPropertySelect,
  onRemoveBookmark,
  onStartBrowsing,
}: BookmarksScreenProps) {
  const [sortMode, setSortMode] = useState<SortMode>('saved');

  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    if (sortMode === 'price-asc') {
      const aPrice = searchMode === 'rent' ? a.rentPrice : a.salePrice;
      const bPrice = searchMode === 'rent' ? b.rentPrice : b.salePrice;
      return aPrice - bPrice;
    }
    if (sortMode === 'price-desc') {
      const aPrice = searchMode === 'rent' ? a.rentPrice : a.salePrice;
      const bPrice = searchMode === 'rent' ? b.rentPrice : b.salePrice;
      return bPrice - aPrice;
    }
    return 0; // 'saved' = insertion order
  });

  const SORT_OPTIONS: { id: SortMode; label: string }[] = [
    { id: 'saved',      label: 'Recently saved' },
    { id: 'price-asc',  label: 'Price: low–high' },
    { id: 'price-desc', label: 'Price: high–low' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F7F6FB]">
      {/* Header */}
      <div className="bg-[#0F0C2E] px-6 pb-8 header-pt-lg rounded-b-[32px] shadow-lg shadow-[#0F0C2E]/20 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#3C3489]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#E5917A]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          <StarHomesLogo variant="light" size="sm" className="mb-4" />
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Saved</h1>
              <p className="text-gray-300 mt-1 text-sm">
                {bookmarks.length === 0
                  ? 'Properties you want to revisit'
                  : `${bookmarks.length} saved ${bookmarks.length === 1 ? 'property' : 'properties'}`}
              </p>
            </div>
            {bookmarks.length > 0 && (
              <div className="bg-[#3C3489] px-3 py-1.5 rounded-full mb-1">
                <span className="text-white text-sm font-bold">{bookmarks.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {bookmarks.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
            <div className="relative mb-6">
              {/* Gradient blob behind icon */}
              <div className="absolute inset-0 scale-150 bg-gradient-radial from-[#EEEDFE] to-transparent rounded-full blur-xl" />
              <div
                className="relative w-24 h-24 rounded-3xl flex items-center justify-center border-2 border-dashed border-[#3C3489]/30"
                style={{ background: 'linear-gradient(135deg, #EEEDFE 0%, #F7F6FB 100%)' }}
              >
                <Bookmark className="w-10 h-10 text-[#3C3489]" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-[#0F0C2E] mb-2">No saved properties yet</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-xs leading-relaxed">
              Tap the heart on any property to save it here so you can compare and revisit later.
            </p>
            <button
              onClick={onStartBrowsing}
              className="inline-flex items-center gap-2 bg-[#0F0C2E] text-white px-6 py-3.5 rounded-2xl hover:bg-[#1a1650] transition-colors font-semibold shadow-lg shadow-[#0F0C2E]/20 min-h-[52px]"
            >
              <Search className="w-4 h-4" />
              Browse properties
            </button>
          </div>
        ) : (
          <>
            {/* Sort / filter bar */}
            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSortMode(opt.id)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      sortMode === opt.id
                        ? 'bg-[#0F0C2E] text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-[#e5e7eb] hover:border-[#3C3489]/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Property list */}
            <div className="px-4 py-2 pb-6 space-y-3">
              {sortedBookmarks.map((property, idx) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  searchMode={searchMode}
                  onSelect={onPropertySelect}
                  eager={idx === 0}
                  isBookmarked
                  onBookmarkToggle={(p) => onRemoveBookmark(p)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
