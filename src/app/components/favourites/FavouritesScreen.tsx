import { Heart } from 'lucide-react';
import type { Property } from '../../data/properties';
import { properties as allProperties } from '../../data/properties';
import { type SearchMode } from '../../data/pricing';
import { PropertyCard } from '../property/PropertyCard';

interface FavouritesScreenProps {
  favourites: Property[];
  searchMode: SearchMode;
  onPropertySelect: (property: Property) => void;
  onRemoveFavourite: (propertyId: string) => void;
}

// Show a few sample favourites only when the user truly has none, just for empty-demo UX.
const sampleFavourites = allProperties.slice(0, 4);

export function FavouritesScreen({
  favourites,
  searchMode,
  onPropertySelect,
  onRemoveFavourite,
}: FavouritesScreenProps) {
  const displayFavourites = favourites.length > 0 ? favourites : sampleFavourites;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-[#1a2332] px-6 pb-8 header-pt-lg">
        <h1 className="text-2xl font-bold text-white">Favourites</h1>
        <p className="text-gray-300 mt-1">{displayFavourites.length} saved properties</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {displayFavourites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="bg-[#f9fafb] rounded-full p-6 mb-4">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-[#1a2332] mb-2">No favourites yet</h2>
            <p className="text-gray-600">
              Start saving properties to create your shortlist
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {displayFavourites.map((property, idx) => (
              <PropertyCard
                key={property.id}
                property={property}
                searchMode={searchMode}
                variant="compact"
                eager={idx < 2}
                isBookmarked
                onBookmarkToggle={(p) => onRemoveFavourite(p.id)}
                onSelect={onPropertySelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
