import { useState } from 'react';
import { ArrowLeft, List, Map as MapIcon, SlidersHorizontal, Bed, Bath, Home, MapPin, Train } from 'lucide-react';
import { RecommendedArea } from '../home/HomeScreen';

interface AreaResultsScreenProps {
  area: RecommendedArea;
  onBack: () => void;
  onPropertySelect: (property: Property) => void;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  distanceToTube: string;
  imageUrl: string;
  type: 'rent' | 'buy';
}

const mockProperties: Property[] = [
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
];

export function AreaResultsScreen({ area, onBack, onPropertySelect }: AreaResultsScreenProps) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-[#1a2332] px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white hover:text-[#ff6b35] transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold text-white">{area.name}</h1>
        <p className="text-gray-300">{area.borough}</p>
      </div>

      {/* Toggle and Filters */}
      <div className="bg-white border-b border-[#e5e7eb] px-6 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#1a2332] text-white'
                  : 'bg-[#f9fafb] text-[#1a2332] hover:bg-[#f5f5f7]'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="text-sm font-medium">List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'map'
                  ? 'bg-[#1a2332] text-white'
                  : 'bg-[#f9fafb] text-[#1a2332] hover:bg-[#f5f5f7]'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Map</span>
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-[#f9fafb] text-[#1a2332] rounded-lg hover:bg-[#f5f5f7] transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
          </button>
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button className="px-4 py-2 bg-[#f9fafb] text-[#1a2332] rounded-full text-sm whitespace-nowrap hover:bg-[#f5f5f7] transition-colors">
              Price range
            </button>
            <button className="px-4 py-2 bg-[#f9fafb] text-[#1a2332] rounded-full text-sm whitespace-nowrap hover:bg-[#f5f5f7] transition-colors">
              Bedrooms
            </button>
            <button className="px-4 py-2 bg-[#f9fafb] text-[#1a2332] rounded-full text-sm whitespace-nowrap hover:bg-[#f5f5f7] transition-colors">
              Property type
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'list' && (
          <div className="px-6 py-4 space-y-4">
            {mockProperties.map((property) => (
              <div
                key={property.id}
                onClick={() => onPropertySelect(property)}
                className="w-full bg-white rounded-2xl overflow-hidden border border-[#e5e7eb] hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="relative h-48">
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-medium text-[#1a2332]">
                    {property.propertyType}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-left flex-1">
                      <h3 className="font-bold text-[#1a2332] text-lg">{property.title}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{property.address}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-[#1a2332] text-xl">{property.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      <span>{property.bedrooms} bed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      <span>{property.bathrooms} bath</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Train className="w-4 h-4" />
                    <span>{property.distanceToTube}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'map' && (
          <div className="relative h-full bg-gray-100">
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              Map view (placeholder)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
