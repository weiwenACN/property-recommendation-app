import { Heart, Bed, Bath, Maximize, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Property } from './PropertyList';

interface PropertyListViewProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

const mockPropertiesWithLocations: Property[] = [
  {
    id: '1',
    title: 'Modern 2-Bed Apartment',
    address: '15 High Street, Shoreditch',
    price: '£625,000',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 850,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    description: 'Stunning modern apartment with open-plan living',
    features: ['Balcony', 'Parking', 'Concierge'],
    type: 'Apartment',
  },
  {
    id: '2',
    title: 'Spacious Family Home',
    address: '42 Park Avenue, Clapham',
    price: '£795,000',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1200,
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
    description: 'Beautiful Victorian house with garden',
    features: ['Garden', 'Parking', 'Period Features'],
    type: 'House',
  },
  {
    id: '3',
    title: 'Luxury Penthouse',
    address: 'The Heights, Canary Wharf',
    price: '£950,000',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1100,
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
    description: 'Exceptional penthouse with panoramic views',
    features: ['Roof Terrace', 'Concierge', 'Parking'],
    type: 'Penthouse',
  },
  {
    id: '4',
    title: 'Charming 1-Bed Flat',
    address: '8 Market Street, Notting Hill',
    price: '£485,000',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 550,
    images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800'],
    description: 'Bright and airy apartment in vibrant area',
    features: ['Modern Kitchen', 'Wood Floors'],
    type: 'Apartment',
  },
  {
    id: '5',
    title: 'Contemporary Apartment',
    address: '23 River Walk, Richmond',
    price: '£720,000',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 900,
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
    description: 'Riverside living with park views',
    features: ['River Views', 'Balcony', 'Parking'],
    type: 'Apartment',
  },
  {
    id: '6',
    title: 'Georgian Townhouse',
    address: '12 Dulwich Village, Dulwich',
    price: '£890,000',
    bedrooms: 4,
    bathrooms: 3,
    sqft: 1800,
    images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'],
    description: 'Period property with modern amenities',
    features: ['Garden', 'Parking', 'Original Features'],
    type: 'House',
  },
];

export function PropertyListView({ properties, onSelectProperty }: PropertyListViewProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const displayProperties = mockPropertiesWithLocations;

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="px-4 py-4 space-y-4">
        {displayProperties.map((property) => (
          <div
            key={property.id}
            onClick={() => onSelectProperty(property)}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="relative h-56">
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={(e) => toggleFavorite(property.id, e)}
                className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-50"
              >
                <Heart
                  className={`w-5 h-5 ${
                    favorites.has(property.id)
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-600'
                  }`}
                />
              </button>
              <div className="absolute bottom-3 left-3 bg-white px-3 py-1 rounded-full">
                <span className="text-sm">{property.type}</span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-lg text-gray-900 mb-1">{property.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{property.address}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl text-gray-900">{property.price}</p>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-3">{property.description}</p>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  <span>{property.bedrooms} bed</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4" />
                  <span>{property.bathrooms} bath</span>
                </div>
                <div className="flex items-center gap-1">
                  <Maximize className="w-4 h-4" />
                  <span>{property.sqft} sqft</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {property.features.slice(0, 3).map((feature) => (
                  <span
                    key={feature}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
