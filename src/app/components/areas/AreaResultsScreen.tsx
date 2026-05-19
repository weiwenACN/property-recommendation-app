import { lazy, Suspense, useMemo, useState } from 'react';
import { ArrowLeft, List, Map as MapIcon, SlidersHorizontal, ArrowUpDown, X, Loader2 } from 'lucide-react';
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

type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'newest' | 'largest';
const DEFAULT_SORT: SortKey = 'recommended';

const SORT_OPTIONS: { value: SortKey; label: string; description: string }[] = [
  { value: 'recommended', label: 'Recommended', description: 'Best match for you' },
  { value: 'price-asc',   label: 'Price: low to high', description: 'Cheapest first' },
  { value: 'price-desc',  label: 'Price: high to low', description: 'Most expensive first' },
  { value: 'newest',      label: 'Newest first', description: 'Most recently built' },
  { value: 'largest',     label: 'Largest first', description: 'Most floor area' },
];

function rawPrice(p: Property, mode: SearchMode): number {
  return mode === 'rent' ? p.rentPrice : p.salePrice;
}

function sortProperties(list: Property[], sort: SortKey, mode: SearchMode): Property[] {
  if (sort === 'recommended') return list;
  return [...list].sort((a, b) => {
    if (sort === 'price-asc')  return rawPrice(a, mode) - rawPrice(b, mode);
    if (sort === 'price-desc') return rawPrice(b, mode) - rawPrice(a, mode);
    if (sort === 'newest')     return b.yearBuilt - a.yearBuilt;
    if (sort === 'largest')    return b.floorAreaSqft - a.floorAreaSqft;
    return 0;
  });
}

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
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [filters, setFilters] = useState<PropertyFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>(DEFAULT_SORT);

  const propertiesInArea = useMemo(() => propertiesByArea(area.id), [area.id]);
  const filteredProperties = useMemo(
    () => applyFilters(propertiesInArea, filters, searchMode),
    [propertiesInArea, filters, searchMode],
  );
  const displayProperties = useMemo(
    () => sortProperties(filteredProperties, sort, searchMode),
    [filteredProperties, sort, searchMode],
  );
  const hasActiveFilters = isFilterActive(filters);
  const hasActiveSort = sort !== DEFAULT_SORT;

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
      <div className="bg-white border-b border-[#e5e7eb] px-4 py-3 space-y-2">
        {/* Row 1: List / Map toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
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
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
              viewMode === 'map'
                ? 'bg-[#1a2332] text-white'
                : 'bg-[#f9fafb] text-[#1a2332] hover:bg-[#f5f5f7]'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Map</span>
          </button>
        </div>

        {/* Row 2: Sort / Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortSheetOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={sortSheetOpen}
            className="relative flex-1 flex items-center justify-center gap-2 py-2 bg-[#f9fafb] text-[#1a2332] rounded-lg hover:bg-[#f5f5f7] transition-colors min-h-[40px]"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span className="text-sm font-medium">Sort{hasActiveSort ? ` · ${SORT_OPTIONS.find(o => o.value === sort)?.label}` : ''}</span>
            {hasActiveSort && (
              <span aria-label="Sort active" className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#ff3b30] ring-2 ring-white" />
            )}
          </button>
          <button
            onClick={() => setFilterSheetOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={filterSheetOpen}
            className="relative flex-1 flex items-center justify-center gap-2 py-2 bg-[#f9fafb] text-[#1a2332] rounded-lg hover:bg-[#f5f5f7] transition-colors min-h-[40px]"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
            {hasActiveFilters && (
              <span aria-label="Filters active" className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#ff3b30] ring-2 ring-white" />
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

      <SortSheet
        open={sortSheetOpen}
        activeSort={sort}
        onApply={(next) => {
          setSort(next);
          setSortSheetOpen(false);
        }}
        onClear={() => setSort(DEFAULT_SORT)}
        onClose={() => setSortSheetOpen(false)}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'list' && (
          <div className="px-6 py-4 space-y-4">
            {displayProperties.length === 0 ? (
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
              displayProperties.map((property, idx) => (
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
                properties={displayProperties}
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

// ── Sort bottom sheet ─────────────────────────────────────────────────────

interface SortSheetProps {
  open: boolean;
  activeSort: SortKey;
  onApply: (sort: SortKey) => void;
  onClear: () => void;
  onClose: () => void;
}

function SortSheet({ open, activeSort, onApply, onClear, onClose }: SortSheetProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9000]">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close sort"
        className="absolute inset-0 bg-black/40 animate-in fade-in cursor-default"
        tabIndex={-1}
      />
      <div
        role="dialog"
        aria-labelledby="sort-sheet-title"
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom flex flex-col"
      >
        <div className="px-6 pt-4 pb-2">
          <div className="mx-auto h-1.5 w-12 bg-[#e5e7eb] rounded-full mb-4" />
          <div className="flex items-center justify-between">
            <h2 id="sort-sheet-title" className="text-xl font-bold text-[#1a2332]">Sort by</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 -mr-2 text-gray-500 hover:text-[#1a2332] min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-4 space-y-2">
          {SORT_OPTIONS.map((opt) => {
            const isActive = activeSort === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onApply(opt.value)}
                aria-pressed={isActive}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition-colors ${
                  isActive
                    ? 'bg-[#1a2332] text-white'
                    : 'bg-[#f9fafb] text-[#1a2332] hover:bg-[#f1f3f5]'
                }`}
              >
                <div>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className={`text-xs mt-0.5 ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
                    {opt.description}
                  </p>
                </div>
                {isActive && (
                  <span className="w-5 h-5 rounded-full bg-[#ff6b35] flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-6 pt-3 pb-[max(env(safe-area-inset-bottom),1rem)] border-t border-[#f1f3f5] flex gap-3">
          <button
            onClick={() => { onClear(); onClose(); }}
            className="flex-1 min-h-[48px] bg-white border-2 border-[#e5e7eb] text-[#1a2332] py-3 rounded-xl hover:bg-[#f9fafb] transition-colors font-medium"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
