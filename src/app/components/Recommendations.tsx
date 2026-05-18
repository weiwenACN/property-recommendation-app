import { MapPin, TrendingUp, Train, Coffee, GraduationCap, Star } from 'lucide-react';
import { UserPreferences } from './Questionnaire';

interface RecommendationsProps {
  preferences: UserPreferences;
  onSelectArea: (area: Area) => void;
  onBack: () => void;
}

export interface Area {
  id: string;
  name: string;
  borough: string;
  description: string;
  matchScore: number;
  averagePrice: string;
  commuteTime: string;
  highlights: string[];
  imageUrl: string;
  propertyCount: number;
}

const getRecommendedAreas = (preferences: UserPreferences): Area[] => {
  const allAreas: Area[] = [
    {
      id: '1',
      name: 'Shoreditch',
      borough: 'Hackney',
      description: 'Vibrant, creative hub with excellent nightlife and trendy cafes',
      matchScore: 95,
      averagePrice: '£650,000',
      commuteTime: '15 min to City',
      highlights: ['Nightlife', 'Art Scene', 'Restaurants', 'Tech Hub'],
      imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
      propertyCount: 24,
    },
    {
      id: '2',
      name: 'Clapham',
      borough: 'Lambeth',
      description: 'Perfect for young professionals with great parks and social scene',
      matchScore: 92,
      averagePrice: '£580,000',
      commuteTime: '20 min to West End',
      highlights: ['Clapham Common', 'Nightlife', 'Restaurants', 'Community'],
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
      propertyCount: 31,
    },
    {
      id: '3',
      name: 'Richmond',
      borough: 'Richmond upon Thames',
      description: 'Peaceful riverside area with excellent schools and green spaces',
      matchScore: 88,
      averagePrice: '£720,000',
      commuteTime: '30 min to City',
      highlights: ['Richmond Park', 'Top Schools', 'River Thames', 'Family Friendly'],
      imageUrl: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=800',
      propertyCount: 18,
    },
    {
      id: '4',
      name: 'Canary Wharf',
      borough: 'Tower Hamlets',
      description: 'Modern financial district with excellent transport links',
      matchScore: 85,
      averagePrice: '£600,000',
      commuteTime: '5 min to Canary Wharf',
      highlights: ['Modern Living', 'Shopping', 'Restaurants', 'Waterside'],
      imageUrl: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800',
      propertyCount: 27,
    },
    {
      id: '5',
      name: 'Notting Hill',
      borough: 'Kensington and Chelsea',
      description: 'Charming area with colorful houses, markets, and great cafes',
      matchScore: 83,
      averagePrice: '£850,000',
      commuteTime: '25 min to City',
      highlights: ['Portobello Market', 'Cafes', 'Culture', 'Architecture'],
      imageUrl: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800',
      propertyCount: 15,
    },
    {
      id: '6',
      name: 'Dulwich',
      borough: 'Southwark',
      description: 'Village feel with outstanding schools and green spaces',
      matchScore: 80,
      averagePrice: '£690,000',
      commuteTime: '25 min to West End',
      highlights: ['Top Schools', 'Dulwich Park', 'Village Feel', 'Art Gallery'],
      imageUrl: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800',
      propertyCount: 12,
    },
  ];

  return allAreas.slice(0, 4);
};

export function Recommendations({ preferences, onSelectArea, onBack }: RecommendationsProps) {
  const recommendedAreas = getRecommendedAreas(preferences);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="px-4 py-4">
          <button
            onClick={onBack}
            className="text-blue-600 mb-2 hover:text-blue-700"
          >
            ← Back to questions
          </button>
          <h1 className="text-2xl text-gray-900">Your Recommended Areas</h1>
          <p className="text-sm text-gray-600 mt-1">
            Based on your preferences, we found {recommendedAreas.length} perfect matches
          </p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {recommendedAreas.map((area) => (
          <div
            key={area.id}
            onClick={() => onSelectArea(area)}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="relative h-48">
              <img
                src={area.imageUrl}
                alt={area.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm">{area.matchScore}% match</span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl text-gray-900">{area.name}</h3>
                  <p className="text-sm text-gray-600">{area.borough}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-900">{area.averagePrice}</p>
                  <p className="text-xs text-gray-600">avg. price</p>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-3">{area.description}</p>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Train className="w-4 h-4" />
                  <span>{area.commuteTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{area.propertyCount} properties</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {area.highlights.slice(0, 3).map((highlight) => (
                  <span
                    key={highlight}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                  >
                    {highlight}
                  </span>
                ))}
                {area.highlights.length > 3 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{area.highlights.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <p className="text-xs text-center text-gray-600 mb-3">
          Tap on any area to view available properties
        </p>
      </div>
    </div>
  );
}
