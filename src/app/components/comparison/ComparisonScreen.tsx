import { ArrowLeft, Bed, Bath, Maximize, Train, TrendingUp, Calendar, Home as HomeIcon, X, Plus, ZapOff } from 'lucide-react';
import type { Property } from '../../data/properties';
import { priceFor, type SearchMode } from '../../data/pricing';
import { featuresFor } from '../../data/propertyFeatures';

interface ComparisonScreenProps {
  properties: Property[];
  searchMode: SearchMode;
  onBack: () => void;
  onPropertySelect: (property: Property) => void;
  onRemoveFromComparison: (property: Property) => void;
}

interface ComparisonRow {
  label: string;
  icon: typeof Bed;
  values: string[];
  /** Index of the "best" value to highlight, or -1 for "no winner". */
  bestIndex: number;
}

function tubeMinutes(distanceToTube: string): number {
  const match = distanceToTube.match(/(\d+)/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

function indexOfMin(values: number[]): number {
  if (values.length === 0) return -1;
  let bestIdx = 0;
  let bestVal = values[0];
  let tied = false;
  for (let i = 1; i < values.length; i++) {
    if (values[i] < bestVal) {
      bestVal = values[i];
      bestIdx = i;
      tied = false;
    } else if (values[i] === bestVal) {
      tied = true;
    }
  }
  return tied ? -1 : bestIdx;
}

function indexOfMax(values: number[]): number {
  if (values.length === 0) return -1;
  let bestIdx = 0;
  let bestVal = values[0];
  let tied = false;
  for (let i = 1; i < values.length; i++) {
    if (values[i] > bestVal) {
      bestVal = values[i];
      bestIdx = i;
      tied = false;
    } else if (values[i] === bestVal) {
      tied = true;
    }
  }
  return tied ? -1 : bestIdx;
}

function buildRows(properties: Property[], mode: SearchMode): ComparisonRow[] {
  return [
    {
      label: mode === 'rent' ? 'Monthly rent' : 'Sale price',
      icon: TrendingUp,
      values: properties.map((p) => priceFor(mode, p)),
      bestIndex: indexOfMin(properties.map((p) => (mode === 'rent' ? p.rentPrice : p.salePrice))),
    },
    {
      label: 'Bedrooms',
      icon: Bed,
      values: properties.map((p) => `${p.bedrooms}`),
      bestIndex: indexOfMax(properties.map((p) => p.bedrooms)),
    },
    {
      label: 'Bathrooms',
      icon: Bath,
      values: properties.map((p) => `${p.bathrooms}`),
      bestIndex: indexOfMax(properties.map((p) => p.bathrooms)),
    },
    {
      label: 'Floor area',
      icon: Maximize,
      values: properties.map((p) => `${p.floorAreaSqft} ft²`),
      bestIndex: indexOfMax(properties.map((p) => p.floorAreaSqft)),
    },
    {
      label: 'Property type',
      icon: HomeIcon,
      values: properties.map((p) => p.propertyType),
      bestIndex: -1,
    },
    {
      label: 'Year built',
      icon: Calendar,
      values: properties.map((p) => `${p.yearBuilt}`),
      bestIndex: indexOfMax(properties.map((p) => p.yearBuilt)),
    },
    {
      label: 'Parking',
      icon: HomeIcon,
      values: properties.map((p) => featuresFor(p.propertyType).parking),
      bestIndex: -1,
    },
    {
      label: 'Nearest tube',
      icon: Train,
      values: properties.map((p) => p.distanceToTube),
      bestIndex: indexOfMin(properties.map((p) => tubeMinutes(p.distanceToTube))),
    },
  ];
}

export function ComparisonScreen({
  properties,
  searchMode,
  onBack,
  onPropertySelect,
  onRemoveFromComparison,
}: ComparisonScreenProps) {
  if (properties.length === 0) {
    return <EmptyState onBack={onBack} />;
  }

  const rows = buildRows(properties, searchMode);
  const count = properties.length;

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
        <h1 className="text-2xl font-bold text-white">Compare</h1>
        <p className="text-gray-300 text-sm">
          {count} {count === 1 ? 'property' : 'properties'} selected
        </p>
      </div>

      {/* Property thumbnails strip */}
      <div className="border-b border-[#e5e7eb] px-6 py-3 overflow-x-auto scrollbar-hide">
        <div className={`grid gap-3 ${count === 1 ? 'grid-cols-1' : count === 2 ? 'grid-cols-2' : 'grid-cols-3'} ${count >= 3 ? 'min-w-[440px]' : ''}`}>
          {properties.map((property) => (
            <PropertyThumb
              key={property.id}
              property={property}
              searchMode={searchMode}
              onOpen={() => onPropertySelect(property)}
              onRemove={() => onRemoveFromComparison(property)}
            />
          ))}
        </div>
        {count < 3 && (
          <p className="text-[11px] text-gray-500 mt-2 text-center">
            Add up to {3 - count} more from the search results to compare side-by-side.
          </p>
        )}
      </div>

      {/* Comparison rows */}
      {count < 2 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="bg-[#f9fafb] rounded-full p-4 mb-3">
            <ZapOff className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-[#1a2332] font-medium mb-1">Add another property to compare</p>
          <p className="text-sm text-gray-600">
            Tick a second property on the search results to start side-by-side comparison.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className={`px-6 py-4 ${count === 3 ? 'overflow-x-auto' : ''}`}>
            <div className={count === 3 ? 'min-w-[440px]' : ''}>
              {rows.map((row) => (
                <ComparisonRowItem key={row.label} row={row} count={count} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PropertyThumb({
  property,
  searchMode,
  onOpen,
  onRemove,
}: {
  property: Property;
  searchMode: SearchMode;
  onOpen: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${property.title} from comparison`}
        className="absolute -top-1 -right-1 z-10 w-7 h-7 rounded-full bg-white text-[#1a2332] shadow-md flex items-center justify-center hover:bg-gray-50"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="relative h-24 rounded-xl overflow-hidden mb-1.5 bg-[#f1f3f5]">
          <img
            src={property.imageUrl}
            alt={property.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <p className="text-xs font-bold text-[#1a2332] truncate leading-tight">{property.title}</p>
        <p className="text-[11px] text-gray-500 truncate">{property.address.split(',')[1]?.trim() || property.address}</p>
        <p className="text-xs font-bold text-[#ff6b35] mt-0.5">{priceFor(searchMode, property)}</p>
      </button>
    </div>
  );
}

function ComparisonRowItem({ row, count }: { row: ComparisonRow; count: number }) {
  const Icon = row.icon;
  return (
    <div className="py-3 border-b border-[#f1f3f5] last:border-0">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-gray-500" />
        <p className="text-[11px] uppercase tracking-wider font-medium text-gray-500">{row.label}</p>
      </div>
      <div className={`grid gap-2 ${count === 1 ? 'grid-cols-1' : count === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {row.values.map((value, i) => {
          const isBest = row.bestIndex === i;
          return (
            <div
              key={i}
              className={`p-3 rounded-xl transition-colors ${
                isBest
                  ? 'bg-[#fff5f2] border-2 border-[#ff6b35]'
                  : 'bg-[#f9fafb] border-2 border-transparent'
              }`}
            >
              <p
                className={`text-sm leading-tight ${
                  isBest ? 'font-bold text-[#ff6b35]' : 'font-medium text-[#1a2332]'
                }`}
              >
                {value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="bg-[#1a2332] px-6 pb-4 header-pt">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white hover:text-[#ff6b35] transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold text-white">Compare</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="bg-[#f9fafb] rounded-full p-6 mb-4">
          <Plus className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-[#1a2332] mb-2">Nothing to compare yet</h2>
        <p className="text-gray-600 mb-6 max-w-xs">
          Open the search results and tick up to three properties to see them side-by-side.
        </p>
        <button
          onClick={onBack}
          className="bg-[#ff6b35] text-white px-5 py-3 rounded-xl hover:bg-[#ff5722] transition-colors font-medium shadow-lg shadow-[#ff6b35]/20 min-h-[48px]"
        >
          Back to search
        </button>
      </div>
    </div>
  );
}
