import { lazy, Suspense, useMemo, useState } from 'react';
import { ArrowLeft, List, Map as MapIcon, SlidersHorizontal, Loader2 } from 'lucide-react';
import {
  propertiesByArea,
  type Property,
  type RecommendedArea,
} from '../../data/properties';
import { type SearchMode } from '../../data/pricing';
import {
  DEFAULT_FILTERS,
  applyFilters,
  isFilterActive,
  type PropertyFilters,
} from '../../data/propertyFilters';
import { PropertyCard } from '../property/PropertyCard';
import { FilterSheet } from './FilterSheet';

const PropertyMap = lazy(() => import('./PropertyMap'));

export type { Property };

interface AreaResultsScreenProps {
  area: RecommendedArea;
  searchMode: SearchMode;
  bookmarkIds: string[];
  onBookmarkToggle: (property: Property) => void;
  comparisonIds: string[];
  onComparisonToggle: (property: Property) => void;
  onBack: () => void;
  onPropertySelect: (property: Property) => void;
}

export function AreaResultsScreen({
  area,
  searchMode,
  bookmarkIds,
  onBookmarkToggle,
  comparisonIds,
  onComparisonToggle,
  onBack,
  onPropertySelect,
}: AreaResultsScreenProps) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [filters, setFilters] = useState<PropertyFilters>(DEFAULT_FILTERS);

  const propertiesInArea = useMemo(() => propertiesByArea(area.id), [area.id]);
  const filteredProperties = useMemo(
    () => applyFilters(propertiesInArea, filters, searchMode),
    [propertiesInArea, filters, searchMode],
  );
  const hasActiveFilters = isFilterActive(filters);

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
            onClick={() => setFilterSheetOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={filterSheetOpen}
            className="relative flex items-center gap-2 px-4 py-2 bg-[#f9fafb] text-[#1a2332] rounded-lg hover:bg-[#f5f5f7] transition-colors min-h-[40px]"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
            {hasActiveFilters && (
              <span
                aria-label="Filters active"
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#ff3b30] ring-2 ring-white"
              />
            )}
          </button>
        </div>
      </div>

      <FilterSheet
        open={filterSheetOpen}
        initialFilters={filters}
        candidateProperties={propertiesInArea}
        searchMode={searchMode}
        onApply={(next) => {
          setFilters(next);
          setFilterSheetOpen(false);
        }}
        onClear={() => setFilters(DEFAULT_FILTERS)}
        onClose={() => setFilterSheetOpen(false)}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'list' && (
          <div className="px-6 py-4 space-y-4">
            {filteredProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-[#1a2332] font-medium mb-1">
                  {hasActiveFilters ? 'No properties match these filters' : `No properties to ${searchMode} here`}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  {hasActiveFilters
                    ? 'Try loosening the filters or pick a different area.'
                    : 'Try switching mode or pick a different area.'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="text-[#ff6b35] font-medium text-sm hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              filteredProperties.map((property, idx) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  searchMode={searchMode}
                  onSelect={onPropertySelect}
                  eager={idx === 0}
                  isBookmarked={bookmarkIds.includes(property.id)}
                  onBookmarkToggle={onBookmarkToggle}
                  showSelectionToggle
                  isSelected={comparisonIds.includes(property.id)}
                  onSelectionToggle={onComparisonToggle}
                />
              ))
            )}
          </div>
        )}

        {viewMode === 'map' && (
          <div className="relative h-full">
            <Suspense
              fallback={
                <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading map…
                </div>
              }
            >
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
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
