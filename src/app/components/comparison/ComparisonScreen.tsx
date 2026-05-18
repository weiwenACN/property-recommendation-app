import { ArrowLeft, Bed, Bath, Maximize, Train, TrendingUp } from 'lucide-react';
import type { Property } from '../../data/properties';
import { properties as allProperties } from '../../data/properties';
import { priceFor, type SearchMode } from '../../data/pricing';

interface ComparisonScreenProps {
  properties: Property[];
  searchMode: SearchMode;
  onBack: () => void;
  onPropertySelect: (property: Property) => void;
}

function lowerWins(a: number, b: number): 0 | 1 | -1 {
  if (a < b) return 0;
  if (b < a) return 1;
  return -1;
}

function higherWins(a: number, b: number): 0 | 1 | -1 {
  if (a > b) return 0;
  if (b > a) return 1;
  return -1;
}

function tubeMinutes(distanceToTube: string): number {
  const match = distanceToTube.match(/(\d+)/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

export function ComparisonScreen({
  properties,
  searchMode,
  onBack,
  onPropertySelect,
}: ComparisonScreenProps) {
  const property1 = properties[0] ?? allProperties[0];
  const property2 = properties[1] ?? allProperties[1];

  const priceA = searchMode === 'rent' ? property1.rentPrice : property1.salePrice;
  const priceB = searchMode === 'rent' ? property2.rentPrice : property2.salePrice;

  const rows = [
    {
      label: searchMode === 'rent' ? 'Monthly rent' : 'Sale price',
      icon: TrendingUp,
      values: [priceFor(searchMode, property1), priceFor(searchMode, property2)],
      betterIndex: lowerWins(priceA, priceB),
    },
    {
      label: 'Bedrooms',
      icon: Bed,
      values: [`${property1.bedrooms}`, `${property2.bedrooms}`],
      betterIndex: higherWins(property1.bedrooms, property2.bedrooms),
    },
    {
      label: 'Bathrooms',
      icon: Bath,
      values: [`${property1.bathrooms}`, `${property2.bathrooms}`],
      betterIndex: higherWins(property1.bathrooms, property2.bathrooms),
    },
    {
      label: 'Property type',
      icon: Maximize,
      values: [property1.propertyType, property2.propertyType],
      betterIndex: -1 as const,
    },
    {
      label: 'Nearest tube',
      icon: Train,
      values: [property1.distanceToTube, property2.distanceToTube],
      betterIndex: lowerWins(tubeMinutes(property1.distanceToTube), tubeMinutes(property2.distanceToTube)),
    },
  ];

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
        <h1 className="text-2xl font-bold text-white">Compare Properties</h1>
      </div>

      {/* Property Headers */}
      <div className="grid grid-cols-2 gap-4 px-6 py-4 border-b border-[#e5e7eb]">
        <div onClick={() => onPropertySelect(property1)} className="text-left cursor-pointer">
          <div className="relative h-32 rounded-xl overflow-hidden mb-2">
            <img src={property1.imageUrl} alt={property1.title} className="w-full h-full object-cover" />
          </div>
          <h3 className="font-bold text-[#1a2332] text-sm mb-1">{property1.title}</h3>
          <p className="text-xs text-gray-600 truncate">{property1.address}</p>
        </div>

        <div onClick={() => onPropertySelect(property2)} className="text-left cursor-pointer">
          <div className="relative h-32 rounded-xl overflow-hidden mb-2">
            <img src={property2.imageUrl} alt={property2.title} className="w-full h-full object-cover" />
          </div>
          <h3 className="font-bold text-[#1a2332] text-sm mb-1">{property2.title}</h3>
          <p className="text-xs text-gray-600 truncate">{property2.address}</p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4">
          {rows.map((row, index) => {
            const Icon = row.icon;
            return (
              <div key={index} className="grid grid-cols-2 gap-4 py-4 border-b border-[#e5e7eb]">
                {[0, 1].map((col) => {
                  const isBetter = row.betterIndex === col;
                  return (
                    <div
                      key={col}
                      className={`p-4 rounded-xl transition-all ${
                        isBetter
                          ? 'bg-[#fff5f2] border-2 border-[#ff6b35]'
                          : 'bg-[#f9fafb] border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-4 h-4 ${isBetter ? 'text-[#ff6b35]' : 'text-gray-600'}`} />
                        <p className={`text-xs font-medium ${isBetter ? 'text-[#ff6b35]' : 'text-gray-600'}`}>
                          {row.label}
                        </p>
                      </div>
                      <p className={`font-bold ${isBetter ? 'text-[#ff6b35]' : 'text-[#1a2332]'}`}>
                        {row.values[col]}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
