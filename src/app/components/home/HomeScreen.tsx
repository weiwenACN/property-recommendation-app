import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Search, MapPin, TrendingUp, Bell, Check, X, Map as MapIcon } from 'lucide-react';
import { StarHomesLogo } from '../common/StarHomesLogo';
import {
  recommendedAreas,
  type Property,
  type RecommendedArea,
} from '../../data/properties';
import { formatFromPrice, type SearchMode } from '../../data/pricing';
import type { ViewedEntry } from '../../data/viewedStore';
import { RecentlyViewedSection } from '../history/RecentlyViewedSection';

const MapAreaSearchModal = lazy(() => import('./MapAreaSearchModal'));

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
  viewedEntries: ViewedEntry[];
  bookmarkIds: string[];
  onBookmarkToggle: (property: Property) => void;
  onPropertySelect: (property: Property) => void;
  onViewAllHistory: () => void;
  isGuest?: boolean;
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
  viewedEntries,
  bookmarkIds,
  onBookmarkToggle,
  onPropertySelect,
  onViewAllHistory,
  isGuest,
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

  const filteredAreas = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return recommendedAreas;
    return recommendedAreas.filter(
      (area) =>
        area.name.toLowerCase().includes(q) ||
        area.borough.toLowerCase().includes(q) ||
        area.tag.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  useEffect(() => {
    if (!pendingToast) return;
    const t = setTimeout(onDismissToast, 5000);
    return () => clearTimeout(t);
  }, [pendingToast, onDismissToast]);

  return (
    <div className="relative flex flex-col h-full bg-white">
      {/* Toast banner */}
      {pendingToast && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-[#0F0C2E] text-white rounded-xl shadow-2xl px-4 py-3 flex items-start gap-3 animate-in slide-in-from-top">
          <div className="bg-[#3C3489] rounded-full p-1 mt-0.5">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
          <p className="flex-1 text-sm">{pendingToast}</p>
          <button onClick={onDismissToast} aria-label="Dismiss" className="text-white/70 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#0F0C2E] px-6 header-pt pb-6">
        <div className="flex items-center justify-between mb-6">
          <StarHomesLogo variant="light" />
          <button
            onClick={onOpenNotifications}
            aria-label={`Open notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            className="relative p-2 -mr-2 text-white hover:text-white/70 transition-colors"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E5917A] text-[10px] font-semibold text-white flex items-center justify-center">
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
              className="w-full pl-12 pr-14 py-4 bg-white rounded-xl focus:outline-none focus:ring-[1.5px] focus:ring-[#7F77DD] text-[#0F0C2E]"
            />
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              aria-label="Search by map"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[#F7F6FB] hover:bg-[#EEEDFE] text-[#0F0C2E] hover:text-[#3C3489] transition-colors"
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
                    className="w-full px-4 py-3 text-left hover:bg-[#F7F6FB] transition-colors flex items-center gap-3 border-b border-[#e5e7eb] last:border-0"
                  >
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-[#0F0C2E]">{result}</span>
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
                ? 'bg-white text-[#0F0C2E]'
                : 'text-white hover:bg-white/5'
            }`}
          >
            Rent
          </button>
          <button
            onClick={() => onSearchModeChange('buy')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              searchMode === 'buy'
                ? 'bg-white text-[#0F0C2E]'
                : 'text-white hover:bg-white/5'
            }`}
          >
            Buy
          </button>
        </div>
      </div>

      {showMapModal && (
        <Suspense fallback={null}>
          <MapAreaSearchModal
            open={showMapModal}
            initialQuery={searchQuery}
            onClose={() => setShowMapModal(false)}
            onSelectArea={handleMapAreaSelect}
          />
        </Suspense>
      )}

      {/* Body: Recently viewed (when present) + Recommended Areas */}
      <div className="flex-1 overflow-y-auto">
        {isGuest && (
          <div className="mx-4 mt-3 px-4 py-3 bg-[#EEEDFE] border border-[#3C3489]/20 rounded-xl flex items-start gap-3">
            <span className="text-[#3C3489] text-base mt-0.5">👤</span>
            <p className="text-xs text-[#0F0C2E] leading-relaxed">
              <span className="font-semibold">Browsing as guest</span> — sign up to save properties and contact agents.
            </p>
          </div>
        )}
        <div className="py-6">
          <RecentlyViewedSection
            entries={viewedEntries}
            searchMode={searchMode}
            bookmarkIds={bookmarkIds}
            onBookmarkToggle={onBookmarkToggle}
            onPropertySelect={onPropertySelect}
            onViewAll={onViewAllHistory}
          />
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#3C3489]" />
              <h2 className="text-xl font-semibold text-[#0F0C2E]">
                {searchQuery.trim() ? 'Matching areas' : 'Recommended for you'}
              </h2>
            </div>
            {searchQuery.trim() && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-sm text-[#3C3489] font-medium hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          {filteredAreas.length === 0 ? (
            <div className="rounded-2xl border border-[#e5e7eb] bg-[#F7F6FB] px-6 py-10 text-center">
              <p className="text-[#0F0C2E] font-medium mb-1">No areas match "{searchQuery}"</p>
              <p className="text-sm text-gray-600">
                Try a different name or borough, or{' '}
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[#3C3489] font-medium hover:underline"
                >
                  clear the search
                </button>
                .
              </p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
              {filteredAreas.map((area) => (
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
                    <div className="absolute top-3 left-3 bg-[#3C3489] text-white px-3 py-1 rounded-full text-xs font-medium">
                      {area.tag}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-left">
                        <h3 className="font-semibold text-[#0F0C2E] text-lg">{area.name}</h3>
                        <p className="text-sm text-gray-600">{area.borough}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#0F0C2E]">{formatFromPrice(searchMode, area)}</p>
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
          )}
        </div>
      </div>
    </div>
  );
}
