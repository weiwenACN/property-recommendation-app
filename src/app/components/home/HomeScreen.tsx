import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Search, MapPin, TrendingUp, Bell, Check, X, Map as MapIcon, ChevronRight, UserPlus } from 'lucide-react';
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
  /** Called when the guest taps "Sign up" in the banner. */
  onGuestSignUp?: () => void;
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
  onGuestSignUp,
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

  const handleSearchFocus = () => setShowAutocomplete(true);
  const handleSearchBlur = () => setTimeout(() => setShowAutocomplete(false), 200);

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
    <div className="relative flex flex-col h-full bg-[#F7F6FB]">
      {/* Toast banner */}
      {pendingToast && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-[#0F0C2E] text-white rounded-2xl shadow-2xl px-4 py-3 flex items-start gap-3 animate-in slide-in-from-top">
          <div className="bg-[#3C3489] rounded-full p-1 mt-0.5 flex-shrink-0">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
          <p className="flex-1 text-sm">{pendingToast}</p>
          <button onClick={onDismissToast} aria-label="Dismiss" className="text-white/70 hover:text-white flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header — dark hero with curved bottom edge */}
      <div className="bg-[#0F0C2E] px-6 header-pt pb-8 rounded-b-[32px] shadow-lg shadow-[#0F0C2E]/20 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#3C3489]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-4 -left-4 w-28 h-28 bg-[#7F77DD]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-center justify-between mb-6">
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
              className="w-full pl-12 pr-14 py-4 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7F77DD] text-[#0F0C2E] shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              aria-label="Search by map"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[#F7F6FB] hover:bg-[#EEEDFE] text-[#0F0C2E] hover:text-[#3C3489] transition-colors"
            >
              <MapIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {showAutocomplete && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#e5e7eb] overflow-hidden z-50">
              {autocompleteResults
                .filter((r) => r.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleAutocompleteSelect(result)}
                    className="w-full px-4 py-3 text-left hover:bg-[#F7F6FB] transition-colors flex items-center gap-3 border-b border-[#f1f3f5] last:border-0"
                  >
                    <MapPin className="w-4 h-4 text-[#3C3489]" />
                    <span className="text-[#0F0C2E]">{result}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Rent / Buy Toggle */}
        <div className="flex gap-2 bg-white/10 p-1 rounded-2xl">
          <button
            onClick={() => onSearchModeChange('rent')}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
              searchMode === 'rent'
                ? 'bg-white text-[#0F0C2E] shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            Rent
          </button>
          <button
            onClick={() => onSearchModeChange('buy')}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
              searchMode === 'buy'
                ? 'bg-white text-[#0F0C2E] shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/5'
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

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {/* Guest banner */}
        {isGuest && (
          <div className="mx-4 mt-4 px-4 py-3.5 bg-white border border-[#3C3489]/15 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#EEEDFE] flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-4 h-4 text-[#3C3489]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#0F0C2E]">Browsing as guest</p>
              <p className="text-[11px] text-gray-500 leading-snug">Sign up to save properties and contact agents</p>
            </div>
            {onGuestSignUp && (
              <button
                onClick={onGuestSignUp}
                className="flex-shrink-0 text-xs font-semibold text-white bg-[#3C3489] px-3 py-1.5 rounded-lg hover:bg-[#2d2766] transition-colors"
              >
                Sign up
              </button>
            )}
          </div>
        )}

        {/* Recently Viewed */}
        <div className="py-4">
          <RecentlyViewedSection
            entries={viewedEntries}
            searchMode={searchMode}
            bookmarkIds={bookmarkIds}
            onBookmarkToggle={onBookmarkToggle}
            onPropertySelect={onPropertySelect}
            onViewAll={onViewAllHistory}
          />
        </div>

        {/* Recommended areas */}
        <div className="px-4 pb-6">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#EEEDFE] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#3C3489]" />
              </div>
              <h2 className="text-base font-semibold text-[#0F0C2E]">
                {searchQuery.trim() ? 'Matching areas' : 'Recommended for you'}
              </h2>
            </div>
            {searchQuery.trim() ? (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#3C3489] font-semibold hover:underline"
              >
                Clear
              </button>
            ) : (
              <button className="flex items-center gap-0.5 text-xs text-[#3C3489] font-semibold">
                See all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {filteredAreas.length === 0 ? (
            <div className="rounded-2xl border border-[#e5e7eb] bg-white px-6 py-10 text-center shadow-sm">
              <p className="text-[#0F0C2E] font-medium mb-1">No areas match "{searchQuery}"</p>
              <p className="text-sm text-gray-500">
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
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {filteredAreas.map((area) => (
                <div
                  key={area.id}
                  onClick={() => onAreaSelect(area)}
                  className="flex-shrink-0 w-68 bg-white rounded-2xl overflow-hidden shadow-md shadow-[#0F0C2E]/08 hover:shadow-lg hover:shadow-[#0F0C2E]/12 transition-all cursor-pointer"
                  style={{ width: '272px' }}
                >
                  {/* Photo with gradient overlay */}
                  <div className="relative h-40">
                    <img
                      src={area.imageUrl}
                      alt={area.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Bottom gradient for depth */}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
                    {/* Tag pill */}
                    <div className="absolute top-3 left-3 bg-[#3C3489] text-white px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide shadow-sm">
                      {area.tag}
                    </div>
                    {/* Price overlay at bottom */}
                    <div className="absolute bottom-3 right-3 text-right">
                      <p className="text-white font-semibold text-sm drop-shadow">{formatFromPrice(searchMode, area)}</p>
                      <p className="text-white/75 text-[10px]">
                        {searchMode === 'rent' ? 'avg rent' : 'avg price'}
                      </p>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    <h3 className="font-semibold text-[#0F0C2E] text-base leading-tight">{area.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{area.borough}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{area.matchReason}</p>
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
