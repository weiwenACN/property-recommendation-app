import { useEffect, useState } from 'react';
import { Search, MapPin, TrendingUp, Bell, Check, X, Map as MapIcon } from 'lucide-react';
import {
  recommendedAreas,
  type RecommendedArea,
} from '../../data/properties';
import { formatFromPrice, type SearchMode } from '../../data/pricing';
import { MapAreaSearchModal } from './MapAreaSearchModal';

export type { RecommendedArea };

interface HomeScreenProps {
  userPreferences: string[];
  searchMode: SearchMode;
  unreadCount: number;
  pendingToast: string | null;
  onDismissToast: () => void;
  onOpenNotifications: () => void;
  onSearchModeChange: (mode: SearchMode) => void;
  onAreaSelect: (area: RecommendedArea) => void;
  onSearch: (query: string) => void;
}

export function HomeScreen({
  userPreferences,
  searchMode,
  unreadCount,
  pendingToast,
  onDismissToast,
  onOpenNotifications,
  onSearchModeChange,
  onAreaSelect,
  onSearch,
}: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

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

  const handleMapAreaSelect = (area: RecommendedArea) => {
    setSearchQuery(`${area.name}, ${area.borough}`);
    setShowMapModal(false);
    onAreaSelect(area);
  };

  useEffect(() => {
    if (!pendingToast) return;
    const t = setTimeout(onDismissToast, 5000);
    return () => clearTimeout(t);
  }, [pendingToast, onDismissToast]);

  return (
    <div className="relative flex flex-col h-full bg-white">
      {/* Toast banner */}
      {pendingToast && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-[#1a2332] text-white rounded-xl shadow-2xl px-4 py-3 flex items-start gap-3 animate-in slide-in-from-top">
          <div className="bg-[#ff6b35] rounded-full p-1 mt-0.5">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
          <p className="flex-1 text-sm">{pendingToast}</p>
          <button onClick={onDismissToast} aria-label="Dismiss" className="text-white/70 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#1a2332] px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Find your home</h1>
          <button
            onClick={onOpenNotifications}
            aria-label={`Open notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            className="relative p-2 -mr-2 text-white hover:text-[#ff6b35] transition-colors"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ff3b30] text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

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
              className="w-full pl-12 pr-14 py-4 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6b35] text-[#1a2332]"
            />
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              aria-label="Search by map"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[#f9fafb] hover:bg-[#fff5f2] text-[#1a2332] hover:text-[#ff6b35] transition-colors"
            >
              <MapIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {showAutocomplete && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-[#e5e7eb] overflow-hidden z-50">
              {autocompleteResults
                .filter((result) => result.toLowerCase().includes(searchQuery.toLowerCase()))
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
            onClick={() => onSearchModeChange('rent')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              searchMode === 'rent'
                ? 'bg-white text-[#1a2332]'
                : 'text-white hover:bg-white/5'
            }`}
          >
            Rent
          </button>
          <button
            onClick={() => onSearchModeChange('buy')}
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

      <MapAreaSearchModal
        open={showMapModal}
        initialQuery={searchQuery}
        onClose={() => setShowMapModal(false)}
        onSelectArea={handleMapAreaSelect}
      />

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
                      <p className="font-bold text-[#1a2332]">{formatFromPrice(searchMode, area)}</p>
                      <p className="text-xs text-gray-600">
                        {searchMode === 'rent' ? 'Avg rent' : 'Avg sale price'}
                      </p>
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
