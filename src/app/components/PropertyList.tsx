import { ArrowLeft, Bed, Bath, Maximize, Heart, MapPin } from 'lucide-react';
import { Area } from './Recommendations';
import { useState } from 'react';

interface PropertyListProps {
  area: Area;
  onBack: () => void;
  onSelectProperty: (property: Property) => void;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  images: string[];
  description: string;
  features: string[];
  type: string;
}

const getMockProperties = (areaName: string): Property[] => {
  return [
    {
      id: '1',
      title: 'Modern 2-Bed Apartment',
      address: `15 High Street, ${areaName}`,
      price: '£625,000',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 850,
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      ],
      description: 'Stunning modern apartment with open-plan living and high-end finishes',
      features: ['Balcony', 'Parking', 'Concierge', 'Gym'],
      type: 'Apartment',
    },
    {
      id: '2',
      title: 'Spacious Family Home',
      address: `42 Park Avenue, ${areaName}`,
      price: '£795,000',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1200,
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
      ],
      description: 'Beautiful Victorian house with original features and modern kitchen',
      features: ['Garden', 'Parking', 'Period Features', 'Close to Schools'],
      type: 'House',
    },
    {
      id: '3',
      title: 'Luxury Penthouse',
      address: `The Heights, ${areaName}`,
      price: '£950,000',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1100,
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
        'https://images.unsplash.com/photo-1502672260066-6bc2614030a5?w=800',
      ],
      description: 'Exceptional penthouse with panoramic views and roof terrace',
      features: ['Roof Terrace', 'Concierge', 'Parking', 'City Views'],
      type: 'Penthouse',
    },
    {
      id: '4',
      title: 'Charming 1-Bed Flat',
      address: `8 Market Street, ${areaName}`,
      price: '£485,000',
      bedrooms: 1,
      bathrooms: 1,
      sqft: 550,
      images: [
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
      ],
      description: 'Bright and airy apartment perfect for first-time buyers',
      features: ['Modern Kitchen', 'Wood Floors', 'Storage'],
      type: 'Apartment',
    },
  ];
};

export function PropertyList({ area, onBack, onSelectProperty }: PropertyListProps) {
  const properties = getMockProperties(area.name);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

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
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 mb-2 hover:text-blue-700"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl text-gray-900">{area.name}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {properties.length} properties available
          </p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {properties.map((property) => (
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
