import { ArrowLeft, Bed, Bath, Maximize, Train, TrendingUp } from 'lucide-react';
import { Property } from '../areas/AreaResultsScreen';

interface ComparisonScreenProps {
  properties: Property[];
  onBack: () => void;
  onPropertySelect: (property: Property) => void;
}

const comparisonData = [
  {
    label: 'Price',
    icon: TrendingUp,
    values: ['£2,100/mo', '£1,800/mo'],
    betterIndex: 1,
  },
  {
    label: 'Bedrooms',
    icon: Bed,
    values: ['2', '1'],
    betterIndex: 0,
  },
  {
    label: 'Bathrooms',
    icon: Bath,
    values: ['2', '1'],
    betterIndex: 0,
  },
  {
    label: 'Size',
    icon: Maximize,
    values: ['850 sqft', '550 sqft'],
    betterIndex: 0,
  },
  {
    label: 'Nearest tube',
    icon: Train,
    values: ['5 min walk', '3 min walk'],
    betterIndex: 1,
  },
];

export function ComparisonScreen({ properties, onBack, onPropertySelect }: ComparisonScreenProps) {
  const property1 = properties[0] || {
    id: '1',
    title: 'Modern 2-Bed Apartment',
    address: '15 High Street, Shoreditch',
    price: '£2,100/mo',
    bedrooms: 2,
    bathrooms: 2,
    propertyType: 'Apartment',
    distanceToTube: '5 min walk to Old Street',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    type: 'rent' as const,
  };

  const property2 = properties[1] || {
    id: '2',
    title: 'Spacious Studio',
    address: '23 Brick Lane, Shoreditch',
    price: '£1,800/mo',
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'Studio',
    distanceToTube: '3 min walk to Shoreditch High Street',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    type: 'rent' as const,
  };

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
        <h1 className="text-2xl font-bold text-white">Compare Properties</h1>
      </div>

      {/* Property Headers */}
      <div className="grid grid-cols-2 gap-4 px-6 py-4 border-b border-[#e5e7eb]">
        <div
          onClick={() => onPropertySelect(property1)}
          className="text-left cursor-pointer"
        >
          <div className="relative h-32 rounded-xl overflow-hidden mb-2">
            <img
              src={property1.imageUrl}
              alt={property1.title}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-bold text-[#1a2332] text-sm mb-1">{property1.title}</h3>
          <p className="text-xs text-gray-600 truncate">{property1.address}</p>
        </div>

        <div
          onClick={() => onPropertySelect(property2)}
          className="text-left cursor-pointer"
        >
          <div className="relative h-32 rounded-xl overflow-hidden mb-2">
            <img
              src={property2.imageUrl}
              alt={property2.title}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-bold text-[#1a2332] text-sm mb-1">{property2.title}</h3>
          <p className="text-xs text-gray-600 truncate">{property2.address}</p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4">
          {comparisonData.map((row, index) => {
            const Icon = row.icon;
            return (
              <div
                key={index}
                className="grid grid-cols-2 gap-4 py-4 border-b border-[#e5e7eb]"
              >
                <div
                  className={`p-4 rounded-xl transition-all ${
                    row.betterIndex === 0
                      ? 'bg-[#fff5f2] border-2 border-[#ff6b35]'
                      : 'bg-[#f9fafb] border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${row.betterIndex === 0 ? 'text-[#ff6b35]' : 'text-gray-600'}`} />
                    <p className={`text-xs font-medium ${row.betterIndex === 0 ? 'text-[#ff6b35]' : 'text-gray-600'}`}>
                      {row.label}
                    </p>
                  </div>
                  <p className={`font-bold ${row.betterIndex === 0 ? 'text-[#ff6b35]' : 'text-[#1a2332]'}`}>
                    {row.values[0]}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-xl transition-all ${
                    row.betterIndex === 1
                      ? 'bg-[#fff5f2] border-2 border-[#ff6b35]'
                      : 'bg-[#f9fafb] border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${row.betterIndex === 1 ? 'text-[#ff6b35]' : 'text-gray-600'}`} />
                    <p className={`text-xs font-medium ${row.betterIndex === 1 ? 'text-[#ff6b35]' : 'text-gray-600'}`}>
                      {row.label}
                    </p>
                  </div>
                  <p className={`font-bold ${row.betterIndex === 1 ? 'text-[#ff6b35]' : 'text-[#1a2332]'}`}>
                    {row.values[1]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
