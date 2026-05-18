import { useMemo, useState } from 'react';
import { ArrowLeft, List, Map as MapIcon, SlidersHorizontal, Bed, Bath, MapPin, Train } from 'lucide-react';
import {
  propertiesByArea,
  type Property,
  type RecommendedArea,
} from '../../data/properties';
import { priceFor, type SearchMode } from '../../data/pricing';
import { categoryIconFor } from '../../data/categories';
import { PropertyMap } from './PropertyMap';

export type { Property };

interface AreaResultsScreenProps {
  area: RecommendedArea;
  searchMode: SearchMode;
  onBack: () => void;
  onPropertySelect: (property: Property) => void;
}

export function AreaResultsScreen({ area, searchMode, onBack, onPropertySelect }: AreaResultsScreenProps) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProperties = useMemo(() => propertiesByArea(area.id), [area.id]);

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
        <p className="text-gray-300">
          {area.borough} &middot; {filteredProperties.length}{' '}
          {filteredProperties.length === 1 ? 'property' : 'properties'} to {searchMode}
        </p>
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
            {filteredProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-[#1a2332] font-medium mb-1">No properties to {searchMode} here</p>
                <p className="text-sm text-gray-600">Try switching mode or pick a different area.</p>
              </div>
            ) : (
              filteredProperties.map((property) => {
                const CategoryIcon = categoryIconFor(property.propertyType);
                return (
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
                    <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-medium text-[#1a2332] flex items-center gap-1.5 shadow-sm">
                      <CategoryIcon className="w-3.5 h-3.5" />
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
                        <p className="font-bold text-[#1a2332] text-xl">{priceFor(searchMode, property)}</p>
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
                );
              })
            )}
          </div>
        )}

        {viewMode === 'map' && (
          <div className="relative h-full">
            <PropertyMap
              properties={filteredProperties}
              searchMode={searchMode}
              areaCenter={
                area.lat !== undefined && area.lng !== undefined
                  ? { lat: area.lat, lng: area.lng }
                  : undefined
              }
              areaName={area.name}
              onPropertySelect={onPropertySelect}
            />
          </div>
        )}
      </div>
    </div>
  );
}
