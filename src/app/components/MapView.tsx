import { useEffect, useRef, useState } from 'react';
import { MapPin, Home, Coffee, GraduationCap, ShoppingBag, Train, Dumbbell, X } from 'lucide-react';
import { Property } from './PropertyList';

interface MapViewProps {
  properties: Property[];
  amenities: Amenity[];
  onPropertySelect: (property: Property) => void;
  showAmenities: string[];
}

export interface Amenity {
  id: string;
  type: 'parks' | 'restaurants' | 'schools' | 'transport' | 'shopping' | 'gyms';
  name: string;
  lat: number;
  lng: number;
}

const mockProperties: Array<Property & { lat: number; lng: number }> = [
  {
    id: '1',
    title: 'Modern 2-Bed Apartment',
    address: '15 High Street, Shoreditch',
    price: '£625,000',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 850,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    description: 'Stunning modern apartment',
    features: ['Balcony', 'Parking'],
    type: 'Apartment',
    lat: 51.527,
    lng: -0.083,
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
    description: 'Beautiful Victorian house',
    features: ['Garden', 'Parking'],
    type: 'House',
    lat: 51.461,
    lng: -0.138,
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
    description: 'Exceptional penthouse',
    features: ['Roof Terrace', 'Concierge'],
    type: 'Penthouse',
    lat: 51.505,
    lng: -0.020,
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
    description: 'Bright and airy apartment',
    features: ['Modern Kitchen', 'Wood Floors'],
    type: 'Apartment',
    lat: 51.515,
    lng: -0.195,
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
    description: 'Riverside living at its finest',
    features: ['River Views', 'Balcony'],
    type: 'Apartment',
    lat: 51.461,
    lng: -0.303,
  },
];

const mockAmenities: Amenity[] = [
  { id: 'a1', type: 'parks', name: 'Hyde Park', lat: 51.507, lng: -0.165 },
  { id: 'a2', type: 'parks', name: 'Regent\'s Park', lat: 51.531, lng: -0.156 },
  { id: 'a3', type: 'restaurants', name: 'Shoreditch Dining', lat: 51.525, lng: -0.081 },
  { id: 'a4', type: 'restaurants', name: 'Soho Restaurants', lat: 51.514, lng: -0.132 },
  { id: 'a5', type: 'schools', name: 'Westminster School', lat: 51.495, lng: -0.130 },
  { id: 'a6', type: 'schools', name: 'City of London School', lat: 51.512, lng: -0.097 },
  { id: 'a7', type: 'transport', name: 'King\'s Cross Station', lat: 51.530, lng: -0.124 },
  { id: 'a8', type: 'transport', name: 'Liverpool Street', lat: 51.518, lng: -0.082 },
  { id: 'a9', type: 'shopping', name: 'Oxford Street', lat: 51.515, lng: -0.144 },
  { id: 'a10', type: 'gyms', name: 'Fitness First', lat: 51.516, lng: -0.140 },
];

const amenityIcons = {
  parks: MapPin,
  restaurants: Coffee,
  schools: GraduationCap,
  transport: Train,
  shopping: ShoppingBag,
  gyms: Dumbbell,
};

const amenityColors = {
  parks: 'bg-green-500',
  restaurants: 'bg-orange-500',
  schools: 'bg-purple-500',
  transport: 'bg-blue-500',
  shopping: 'bg-pink-500',
  gyms: 'bg-red-500',
};

export function MapView({ properties, amenities, onPropertySelect, showAmenities }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedProperty, setSelectedProperty] = useState<(Property & { lat: number; lng: number }) | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 51.5074, lng: -0.1278 });
  const [zoom, setZoom] = useState(12);

  // Use mock data
  const displayProperties = mockProperties;
  const displayAmenities = mockAmenities.filter(a => showAmenities.includes(a.type));

  const latToY = (lat: number) => {
    const mapHeight = mapRef.current?.clientHeight || 600;
    const minLat = 51.38;
    const maxLat = 51.65;
    return ((maxLat - lat) / (maxLat - minLat)) * mapHeight;
  };

  const lngToX = (lng: number) => {
    const mapWidth = mapRef.current?.clientWidth || 400;
    const minLng = -0.5;
    const maxLng = 0.3;
    return ((lng - minLng) / (maxLng - minLng)) * mapWidth;
  };

  return (
    <div className="relative h-full bg-gray-100">
      {/* Satellite-style Map Background */}
      <div
        ref={mapRef}
        className="w-full h-full relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #d4e4d8 0%, #c9ddc4 25%, #b8d4bc 50%, #a8c9b0 75%, #9ec4a8 100%)',
        }}
      >
        {/* Street/Area texture overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#4a5568" strokeWidth="0.3"/>
            </pattern>
            <pattern id="blocks" width="80" height="80" patternUnits="userSpaceOnUse">
              <rect x="1" y="1" width="35" height="35" fill="#8a9a85" opacity="0.3"/>
              <rect x="44" y="1" width="35" height="35" fill="#95a590" opacity="0.3"/>
              <rect x="1" y="44" width="35" height="35" fill="#8f9f8a" opacity="0.3"/>
              <rect x="44" y="44" width="35" height="35" fill="#9aaa95" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blocks)" />
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Park areas (green spaces) */}
        <div className="absolute top-[15%] left-[25%] w-32 h-24 bg-green-600 opacity-20 rounded-3xl"></div>
        <div className="absolute top-[10%] left-[45%] w-28 h-28 bg-green-600 opacity-20 rounded-full"></div>
        <div className="absolute bottom-[25%] right-[15%] w-36 h-32 bg-green-600 opacity-20 rounded-3xl"></div>

        {/* Thames River */}
        <div className="absolute inset-0">
          <svg className="w-full h-full">
            <defs>
              <linearGradient id="riverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#5a8ab5" stopOpacity="0.4"/>
                <stop offset="50%" stopColor="#6b9ac9" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#5a8ab5" stopOpacity="0.4"/>
              </linearGradient>
            </defs>
            <path
              d="M 0 380 Q 100 360 200 370 Q 300 375 400 365 Q 500 355 600 360 Q 700 370 800 365"
              fill="none"
              stroke="url(#riverGradient)"
              strokeWidth="45"
            />
          </svg>
        </div>

        {/* Major roads/connections */}
        <svg className="absolute inset-0 w-full h-full opacity-15">
          <line x1="0" y1="200" x2="400" y2="180" stroke="#666" strokeWidth="3"/>
          <line x1="200" y1="0" x2="250" y2="600" stroke="#666" strokeWidth="3"/>
          <line x1="400" y1="100" x2="400" y2="500" stroke="#666" strokeWidth="3"/>
        </svg>

        {/* Neighborhood areas with labels */}
        <div className="absolute top-[8%] left-[18%]">
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs font-semibold text-gray-900">Camden</div>
            <div className="text-[10px] text-gray-600">NW1</div>
          </div>
        </div>

        <div className="absolute top-[12%] left-[48%]">
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs font-semibold text-gray-900">Islington</div>
            <div className="text-[10px] text-gray-600">N1</div>
          </div>
        </div>

        <div className="absolute top-[22%] right-[18%]">
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs font-semibold text-gray-900">Shoreditch</div>
            <div className="text-[10px] text-gray-600">E1</div>
          </div>
        </div>

        <div className="absolute top-[35%] left-[15%]">
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs font-semibold text-gray-900">Notting Hill</div>
            <div className="text-[10px] text-gray-600">W11</div>
          </div>
        </div>

        <div className="absolute top-[38%] left-[45%]">
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs font-semibold text-gray-900">Westminster</div>
            <div className="text-[10px] text-gray-600">SW1</div>
          </div>
        </div>

        <div className="absolute top-[32%] right-[8%]">
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs font-semibold text-gray-900">Canary Wharf</div>
            <div className="text-[10px] text-gray-600">E14</div>
          </div>
        </div>

        <div className="absolute bottom-[28%] left-[28%]">
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs font-semibold text-gray-900">Clapham</div>
            <div className="text-[10px] text-gray-600">SW4</div>
          </div>
        </div>

        <div className="absolute bottom-[20%] left-[5%]">
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs font-semibold text-gray-900">Richmond</div>
            <div className="text-[10px] text-gray-600">TW9</div>
          </div>
        </div>

        <div className="absolute bottom-[15%] right-[28%]">
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs font-semibold text-gray-900">Dulwich</div>
            <div className="text-[10px] text-gray-600">SE21</div>
          </div>
        </div>

        {/* Amenity markers */}
        {displayAmenities.map((amenity) => {
          const Icon = amenityIcons[amenity.type];
          return (
            <div
              key={amenity.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{
                left: `${lngToX(amenity.lng)}px`,
                top: `${latToY(amenity.lat)}px`,
              }}
            >
              <div className={`${amenityColors[amenity.type]} p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {amenity.name}
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
              </div>
            </div>
          );
        })}

        {/* Property markers */}
        {displayProperties.map((property) => (
          <div
            key={property.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{
              left: `${lngToX(property.lng)}px`,
              top: `${latToY(property.lat)}px`,
            }}
            onClick={() => setSelectedProperty(property)}
          >
            <div className="relative">
              <div className="bg-blue-600 text-white px-3 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors text-xs whitespace-nowrap">
                {property.price}
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-blue-600"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="bg-white p-2.5 rounded-lg shadow-md hover:bg-gray-50 transition-colors">
          <span className="text-lg">+</span>
        </button>
        <button className="bg-white p-2.5 rounded-lg shadow-md hover:bg-gray-50 transition-colors">
          <span className="text-lg">−</span>
        </button>
      </div>

      {/* Legend */}
      {showAmenities.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 max-w-xs">
          <div className="text-xs text-gray-900 mb-2.5 font-semibold">Amenities on Map</div>
          <div className="grid grid-cols-2 gap-2.5">
            {showAmenities.map((type) => {
              const Icon = amenityIcons[type as keyof typeof amenityIcons];
              const count = displayAmenities.filter(a => a.type === type).length;
              return (
                <div key={type} className="flex items-center gap-2">
                  <div className={`${amenityColors[type as keyof typeof amenityColors]} p-1.5 rounded-full shadow-sm`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-900 capitalize font-medium">{type}</span>
                    <span className="text-[10px] text-gray-600">{count} nearby</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected property card */}
      {selectedProperty && (
        <div className="absolute bottom-4 right-4 left-4 bg-white rounded-2xl shadow-xl overflow-hidden max-w-sm mx-auto">
          <div className="relative h-40">
            <img
              src={selectedProperty.images[0]}
              alt={selectedProperty.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setSelectedProperty(null)}
              className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-gray-900 mb-1">{selectedProperty.title}</h3>
                <p className="text-xs text-gray-600">{selectedProperty.address}</p>
              </div>
              <p className="text-lg text-gray-900">{selectedProperty.price}</p>
            </div>
            <p className="text-sm text-gray-700 mb-3">{selectedProperty.description}</p>
            <button
              onClick={() => onPropertySelect(selectedProperty)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
