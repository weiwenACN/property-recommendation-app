import { lazy, Suspense, useMemo, useState } from 'react';
import {
  ArrowLeft,
  LayoutList,
  Map as MapIcon,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Loader2,
  Check,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Maximize2,
  Calendar,
} from 'lucide-react';
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

const SORT_OPTIONS: {
  value: SortKey;
  label: string;
  shortLabel: string;
  description: string;
  Icon: React.ComponentType<{ style?: React.CSSProperties }>;
}[] = [
  { value: 'recommended', label: 'Recommended',      shortLabel: 'Best match',  description: 'Best match for you',      Icon: Sparkles    },
  { value: 'price-asc',   label: 'Price: low–high',  shortLabel: 'Price ↑',     description: 'Cheapest first',           Icon: TrendingUp  },
  { value: 'price-desc',  label: 'Price: high–low',  shortLabel: 'Price ↓',     description: 'Most expensive first',     Icon: TrendingDown},
  { value: 'newest',      label: 'Newest first',     shortLabel: 'Newest',      description: 'Most recently built',      Icon: Calendar    },
  { value: 'largest',     label: 'Largest first',    shortLabel: 'Largest',     description: 'Most floor area',          Icon: Maximize2   },
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

/** Count the number of active filter categories */
function countActiveFilters(filters: PropertyFilters): number {
  let count = 0;
  if (filters.minPrice != null || filters.maxPrice != null) count++;
  if (filters.minBeds != null) count++;
  if (filters.maxCommute != null) count++;
  if (filters.propertyTypes && filters.propertyTypes.length > 0) count++;
  return count;
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
  const filterCount = countActiveFilters(filters);
  const activeSortOption = SORT_OPTIONS.find((o) => o.value === sort)!;

  return (
    <div className="flex flex-col h-full bg-[#F7F6FB]">

      {/* ── Dark hero header ── */}
      <div className="bg-[#0F0C2E] px-5 pb-6 header-pt rounded-b-[28px] shadow-lg shadow-[#0F0C2E]/20 relative overflow-hidden flex-shrink-0">
        {/* Blob */}
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#3C3489]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors mb-4 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-white tracking-tight leading-tight truncate">
                {area.name}
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">{area.borough}</p>
            </div>
            {/* Count badge */}
            <div className="flex-shrink-0 bg-white/10 border border-white/15 rounded-full px-3 py-1">
              <span className="text-white text-xs font-semibold">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'home' : 'homes'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Control strip ── */}
      <div className="flex-shrink-0 px-4 py-3">
        <div className="flex items-center gap-2">

          {/* Segmented List / Map toggle — compact pill */}
          <div
            className="flex items-center p-1 rounded-2xl flex-shrink-0"
            style={{
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}
          >
            <button
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-[#0F0C2E] text-white shadow-sm'
                  : 'text-gray-500 hover:text-[#0F0C2E]'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              aria-pressed={viewMode === 'map'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                viewMode === 'map'
                  ? 'bg-[#0F0C2E] text-white shadow-sm'
                  : 'text-gray-500 hover:text-[#0F0C2E]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Map
            </button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sort pill */}
          <button
            onClick={() => setSortSheetOpen(true)}
            aria-haspopup="dialog"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all active:scale-95 ${
              hasActiveSort
                ? 'bg-[#0F0C2E] text-white shadow-md shadow-[#0F0C2E]/20'
                : 'bg-white text-[#0F0C2E] border border-[#e5e7eb] hover:border-[#3C3489]/40'
            }`}
            style={!hasActiveSort ? { boxShadow: '0 1px 3px rgba(0,0,0,0.07)' } : undefined}
          >
            <ArrowUpDown className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="max-w-[80px] truncate">
              {hasActiveSort ? activeSortOption.shortLabel : 'Sort'}
            </span>
            <ChevronDown className="w-3 h-3 flex-shrink-0 opacity-60" />
          </button>

          {/* Filter pill */}
          <button
            onClick={() => setFilterSheetOpen(true)}
            aria-haspopup="dialog"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all active:scale-95 ${
              hasActiveFilters
                ? 'bg-[#E5917A] text-white shadow-md shadow-[#E5917A]/25'
                : 'bg-white text-[#0F0C2E] border border-[#e5e7eb] hover:border-[#E5917A]/40'
            }`}
            style={!hasActiveFilters ? { boxShadow: '0 1px 3px rgba(0,0,0,0.07)' } : undefined}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {hasActiveFilters ? `Filters${filterCount > 0 ? ` (${filterCount})` : ''}` : 'Filter'}
            </span>
            <ChevronDown className="w-3 h-3 flex-shrink-0 opacity-60" />
          </button>

        </div>
      </div>

      {/* ── Sheets ── */}
      <FilterSheet
        open={filterSheetOpen}
        initialFilters={filters}
        candidateProperties={propertiesInArea}
        searchMode={searchMode}
        onApply={(next) => { setFilters(next); setFilterSheetOpen(false); }}
        onClear={() => setFilters(DEFAULT_FILTERS)}
        onClose={() => setFilterSheetOpen(false)}
      />

      <SortSheet
        open={sortSheetOpen}
        activeSort={sort}
        onApply={(next) => { setSort(next); setSortSheetOpen(false); }}
        onClear={() => setSort(DEFAULT_SORT)}
        onClose={() => setSortSheetOpen(false)}
      />

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'list' && (
          <>
            {displayProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#e5e7eb] flex items-center justify-center mb-4 shadow-sm">
                  <SlidersHorizontal className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-[#0F0C2E] font-bold text-base mb-1">
                  {hasActiveFilters ? 'No homes match these filters' : `No homes to ${searchMode} here`}
                </p>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed max-w-xs">
                  {hasActiveFilters
                    ? 'Try loosening the filters or pick a different area.'
                    : 'Try switching mode or pick a different area.'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="text-[#3C3489] font-semibold text-sm hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="px-4 pt-2 pb-6 space-y-3">
                {displayProperties.map((property, idx) => (
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
                ))}
              </div>
            )}
          </>
        )}

        {viewMode === 'map' && (
          <div className="relative h-full">
            <Suspense
              fallback={
                <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-gray-500">
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

// ── Sort bottom sheet ──────────────────────────────────────────────────────────

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
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] shadow-2xl animate-in slide-in-from-bottom"
      >
        {/* Handle + header */}
        <div className="px-5 pt-4 pb-3">
          <div className="mx-auto h-1 w-10 bg-[#e5e7eb] rounded-full mb-5" />
          <div className="flex items-center justify-between">
            <div>
              <h2 id="sort-sheet-title" className="text-lg font-bold text-[#0F0C2E] tracking-tight">
                Sort properties
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Choose how to order results</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-full bg-[#F7F6FB] flex items-center justify-center text-gray-500 hover:text-[#0F0C2E] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="px-5 pb-3 space-y-2">
          {SORT_OPTIONS.map((opt) => {
            const isActive = activeSort === opt.value;
            const Icon = opt.Icon;
            return (
              <button
                key={opt.value}
                onClick={() => onApply(opt.value)}
                aria-pressed={isActive}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all active:scale-[0.98] ${
                  isActive
                    ? 'bg-[#0F0C2E] text-white shadow-md shadow-[#0F0C2E]/15'
                    : 'bg-[#F7F6FB] text-[#0F0C2E] hover:bg-[#EEEDFE] border border-transparent hover:border-[#3C3489]/10'
                }`}
              >
                {/* Icon box */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isActive ? 'bg-white/15' : 'bg-white border border-[#e5e7eb]'
                  }`}
                >
                  <Icon
                    style={{
                      width: '16px',
                      height: '16px',
                      color: isActive ? '#FFFFFF' : '#3C3489',
                    }}
                  />
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-snug ${isActive ? 'text-white' : 'text-[#0F0C2E]'}`}>
                    {opt.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${isActive ? 'text-white/60' : 'text-gray-500'}`}>
                    {opt.description}
                  </p>
                </div>

                {/* Check */}
                {isActive && (
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 pt-2 pb-[max(env(safe-area-inset-bottom),1.25rem)] border-t border-[#f1f3f5]">
          <button
            onClick={() => { onClear(); onClose(); }}
            className="w-full min-h-[48px] bg-[#F7F6FB] text-[#0F0C2E] rounded-2xl font-semibold text-sm hover:bg-[#EEEDFE] transition-colors border border-[#e5e7eb]"
          >
            Reset to default
          </button>
        </div>
      </div>
    </div>
  );
}
