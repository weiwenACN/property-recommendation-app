import { Bookmark, Search } from 'lucide-react';
import { StarHomesLogo } from '../common/StarHomesLogo';
import type { Property } from '../../data/properties';
import { type SearchMode } from '../../data/pricing';
import { PropertyCard } from '../property/PropertyCard';

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
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-[#0F0C2E] px-6 pb-8 header-pt-lg">
        <StarHomesLogo variant="light" size="sm" className="mb-4" />
        <h1 className="text-2xl font-semibold text-white">Bookmarks</h1>
        <p className="text-gray-300 mt-1">
          {bookmarks.length === 0
            ? 'Save properties you want to revisit'
            : `${bookmarks.length} saved ${bookmarks.length === 1 ? 'property' : 'properties'}`}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
            <div className="bg-[#F7F6FB] rounded-full p-6 mb-4">
              <Bookmark className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-[#0F0C2E] mb-2">No bookmarks yet</h2>
            <p className="text-gray-600 mb-6 max-w-xs">
              Tap the heart on any property to save it here for later.
            </p>
            <button
              onClick={onStartBrowsing}
              className="inline-flex items-center gap-2 bg-[#3C3489] text-white px-5 py-3 rounded-xl hover:bg-[#2d2766] transition-colors font-medium shadow-lg shadow-[#3C3489]/20 min-h-[48px]"
            >
              <Search className="w-4 h-4" />
              Browse properties
            </button>
          </div>
        ) : (
          <div className="px-6 py-4 space-y-4">
            {bookmarks.map((property, idx) => (
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
        )}
      </div>
    </div>
  );
}
