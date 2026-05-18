import { useState } from 'react';
import { Search, MapPin, TrendingUp } from 'lucide-react';

interface HomeScreenProps {
  userPreferences: string[];
  onAreaSelect: (area: RecommendedArea) => void;
  onSearch: (query: string) => void;
}

export interface RecommendedArea {
  id: string;
  name: string;
  borough: string;
  avgPrice: string;
  tag: string;
  imageUrl: string;
  matchReason: string;
}

const recommendedAreas: RecommendedArea[] = [
  {
    id: '1',
    name: 'Shoreditch',
    borough: 'Hackney',
    avgPrice: '£2,100/mo',
    tag: 'Great for nightlife',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
    matchReason: 'Vibrant area with excellent transport links',
  },
  {
    id: '2',
    name: 'Clapham',
    borough: 'Lambeth',
    avgPrice: '£1,850/mo',
    tag: 'Great for families',
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
    matchReason: 'Parks nearby and good schools',
  },
  {
    id: '3',
    name: 'Canary Wharf',
    borough: 'Tower Hamlets',
    avgPrice: '£2,400/mo',
    tag: 'Close to CBD',
    imageUrl: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800',
    matchReason: 'Modern living in financial district',
  },
  {
    id: '4',
    name: 'Brixton',
    borough: 'Lambeth',
    avgPrice: '£1,750/mo',
    tag: 'Vibrant culture',
    imageUrl: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800',
    matchReason: 'Diverse area with great food scene',
  },
  {
    id: '5',
    name: 'Hackney',
    borough: 'Hackney',
    avgPrice: '£1,950/mo',
    tag: 'Trendy & artistic',
    imageUrl: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=800',
    matchReason: 'Creative hub with parks',
  },
];

export function HomeScreen({ userPreferences, onAreaSelect, onSearch }: HomeScreenProps) {
  const [searchMode, setSearchMode] = useState<'rent' | 'buy'>('rent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  const autocompleteResults = [
    'Shoreditch, E1',
    'Clapham, SW4',
    'Canary Wharf, E14',
    'Brixton, SW2',
    'Hackney, E8',
  ];

  const handleSearchFocus = () => {
    setShowAutocomplete(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowAutocomplete(false), 200);
  };

  const handleAutocompleteSelect = (result: string) => {
    setSearchQuery(result);
    onSearch(result);
    setShowAutocomplete(false);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-[#1a2332] px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-white mb-6">Find your home</h1>

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              placeholder="Enter an area, postcode or borough"
              className="w-full pl-12 pr-4 py-4 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6b35] text-[#1a2332]"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showAutocomplete && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-[#e5e7eb] overflow-hidden z-50">
              {autocompleteResults
                .filter(result => result.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleAutocompleteSelect(result)}
                    className="w-full px-4 py-3 text-left hover:bg-[#f9fafb] transition-colors flex items-center gap-3 border-b border-[#e5e7eb] last:border-0"
                  >
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-[#1a2332]">{result}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Rent/Buy Toggle */}
        <div className="flex gap-2 bg-white/10 p-1 rounded-xl">
          <button
            onClick={() => setSearchMode('rent')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              searchMode === 'rent'
                ? 'bg-white text-[#1a2332]'
                : 'text-white hover:bg-white/5'
            }`}
          >
            Rent
          </button>
          <button
            onClick={() => setSearchMode('buy')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              searchMode === 'buy'
                ? 'bg-white text-[#1a2332]'
                : 'text-white hover:bg-white/5'
            }`}
          >
            Buy
          </button>
        </div>
      </div>

      {/* Recommended Areas */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#ff6b35]" />
            <h2 className="text-xl font-bold text-[#1a2332]">Recommended for you</h2>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
            {recommendedAreas.map((area) => (
              <div
                key={area.id}
                onClick={() => onAreaSelect(area)}
                className="flex-shrink-0 w-72 bg-white rounded-2xl overflow-hidden border border-[#e5e7eb] hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="relative h-40">
                  <img
                    src={area.imageUrl}
                    alt={area.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-[#ff6b35] text-white px-3 py-1 rounded-full text-xs font-medium">
                    {area.tag}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-left">
                      <h3 className="font-bold text-[#1a2332] text-lg">{area.name}</h3>
                      <p className="text-sm text-gray-600">{area.borough}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1a2332]">{area.avgPrice}</p>
                      <p className="text-xs text-gray-600">avg {searchMode === 'rent' ? 'rent' : 'price'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{area.matchReason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
