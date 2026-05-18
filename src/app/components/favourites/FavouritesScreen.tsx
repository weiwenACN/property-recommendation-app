import { Heart, Bed } from 'lucide-react';
import type { Property } from '../../data/properties';
import { properties as allProperties } from '../../data/properties';
import { priceFor, type SearchMode } from '../../data/pricing';
import { categoryIconFor } from '../../data/categories';

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
            {displayFavourites.map((property) => {
              const CategoryIcon = categoryIconFor(property.propertyType);
              return (
              <div
                key={property.id}
                className="relative bg-white rounded-2xl overflow-hidden border border-[#e5e7eb] hover:shadow-lg transition-all cursor-pointer"
                onClick={() => onPropertySelect(property)}
              >
                <div className="relative h-40">
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-full text-[10px] font-medium text-[#1a2332] flex items-center gap-1 shadow-sm">
                    <CategoryIcon className="w-3 h-3" />
                    {property.propertyType}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavourite(property.id);
                    }}
                    className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-[#ff6b35] fill-current" />
                  </button>
                </div>
                <div className="p-3">
                  <p className="font-bold text-[#1a2332] text-sm mb-1 truncate">
                    {property.title}
                  </p>
                  <p className="text-xs text-gray-600 truncate mb-2">
                    {property.address.split(',')[1]?.trim() || property.address}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[#ff6b35] text-sm">{priceFor(searchMode, property)}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Bed className="w-3 h-3" />
                      <span>{property.bedrooms}</span>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
