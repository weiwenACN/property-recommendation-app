import { Heart, Bed, MapPin } from 'lucide-react';
import { Property } from '../areas/AreaResultsScreen';

interface FavouritesScreenProps {
  favourites: Property[];
  onPropertySelect: (property: Property) => void;
  onRemoveFavourite: (propertyId: string) => void;
}

const mockFavourites: Property[] = [
  {
    id: '1',
    title: 'Modern 2-Bed Apartment',
    address: '15 High Street, Shoreditch',
    price: '£2,100/mo',
    bedrooms: 2,
    bathrooms: 2,
    propertyType: 'Apartment',
    distanceToTube: '5 min walk to Old Street',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    type: 'rent',
  },
  {
    id: '2',
    title: 'Spacious Studio',
    address: '23 Brick Lane, Shoreditch',
    price: '£1,800/mo',
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'Studio',
    distanceToTube: '3 min walk to Shoreditch High Street',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    type: 'rent',
  },
  {
    id: '3',
    title: 'Luxury Penthouse',
    address: '42 Curtain Road, Shoreditch',
    price: '£3,200/mo',
    bedrooms: 3,
    bathrooms: 2,
    propertyType: 'Penthouse',
    distanceToTube: '7 min walk to Liverpool Street',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    type: 'rent',
  },
  {
    id: '4',
    title: 'Charming 1-Bed Flat',
    address: '8 Market Street, Brixton',
    price: '£1,650/mo',
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'Apartment',
    distanceToTube: '4 min walk to Brixton',
    imageUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
    type: 'rent',
  },
];

export function FavouritesScreen({ favourites, onPropertySelect, onRemoveFavourite }: FavouritesScreenProps) {
  const displayFavourites = favourites.length > 0 ? favourites : mockFavourites;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-[#1a2332] px-6 py-8">
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
            {displayFavourites.map((property) => (
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
                    {property.address.split(',')[1] || property.address}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[#ff6b35] text-sm">{property.price}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Bed className="w-3 h-3" />
                      <span>{property.bedrooms}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
