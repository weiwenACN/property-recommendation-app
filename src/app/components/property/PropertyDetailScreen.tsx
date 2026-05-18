import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Heart,
  ArrowLeftRight,
  Phone,
  Bed,
  Bath,
  Maximize,
  Calendar,
  Check,
  X,
  MapPin,
  Loader2,
  Train,
  GraduationCap,
  ShoppingCart,
  Trees,
  Maximize2,
  LayoutGrid,
} from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { Property } from '../../data/properties';
import { priceFor, type SearchMode } from '../../data/pricing';
import { categoryIconFor } from '../../data/categories';
import { preferenceOptionById } from '../../data/preferences';
import { detailRowsFor } from '../../data/propertyDetails';
import { floorPlanFor } from '../../data/floorPlan';
import { galleryFor } from '../../data/gallery';
import type { ViewedEntry } from '../../data/viewedStore';
import { PropertyPhotoCarousel } from './PropertyPhotoCarousel';
import { SimilarPropertiesSection } from '../similar/SimilarPropertiesSection';

const PropertyMap = lazy(() => import('../areas/PropertyMap'));

interface PropertyDetailScreenProps {
  property: Property;
  searchMode: SearchMode;
  onBack: () => void;
  onFavorite: () => void;
  onCompare: () => void;
  onContactAgentSent: (property: Property) => void;
  isFavorited: boolean;
  /** Cross-cutting props feeding the Similar Properties section. */
  bookmarkIds: string[];
  viewedEntries: ViewedEntry[];
  onBookmarkToggle: (property: Property) => void;
  onPropertySelect: (property: Property) => void;
  onViewAllSimilar: (target: Property) => void;
}

type ContactStage = 'idle' | 'sheet' | 'confirmation';
type TabId = 'overview' | 'details' | 'floor-plan' | 'location';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'details', label: 'Details' },
  { id: 'floor-plan', label: 'Floor plan' },
  { id: 'location', label: 'Location' },
];

const AGENT = { name: 'Sarah Chen', branch: 'Canary Wharf Branch' };

const NEARBY = [
  { label: 'Old Street Station', kind: 'Tube', icon: Train, distance: '5 min walk' },
  { label: 'St. Luke\'s Primary School', kind: 'School', icon: GraduationCap, distance: '10 min walk' },
  { label: 'Tesco Express', kind: 'Supermarket', icon: ShoppingCart, distance: '3 min walk' },
  { label: 'Shoreditch Park', kind: 'Park', icon: Trees, distance: '8 min walk' },
];

export function PropertyDetailScreen({
  property,
  searchMode,
  onBack,
  onFavorite,
  onCompare,
  onContactAgentSent,
  isFavorited,
  bookmarkIds,
  viewedEntries,
  onBookmarkToggle,
  onPropertySelect,
  onViewAllSimilar,
}: PropertyDetailScreenProps) {
  const [contactStage, setContactStage] = useState<ContactStage>('idle');
  const [message, setMessage] = useState(
    `Hi, I'm interested in ${property.title} at ${property.address}. Could you share more details?`,
  );
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [floorPlanOpen, setFloorPlanOpen] = useState(false);

  const tabScrolls = useRef<Record<TabId, number>>({
    overview: 0,
    details: 0,
    'floor-plan': 0,
    location: 0,
  });
  const tabRefs = useRef<Record<TabId, HTMLDivElement | null>>({
    overview: null,
    details: null,
    'floor-plan': null,
    location: null,
  });

  const CategoryIcon = categoryIconFor(property.propertyType);
  const detailRows = useMemo(() => detailRowsFor(property), [property]);
  const floorPlanUrl = useMemo(() => floorPlanFor(property.propertyType), [property.propertyType]);
  const images = useMemo(() => galleryFor(property), [property.id]);

  useEffect(() => {
    setContactStage('idle');
    setActiveTab('overview');
    setDescriptionExpanded(false);
    setFloorPlanOpen(false);
    tabScrolls.current = { overview: 0, details: 0, 'floor-plan': 0, location: 0 };
  }, [property.id]);

  // Tab switching: save current pane's scrollTop, switch, then on the next
  // frame restore the new pane's scrollTop. display:none zaps scroll in some
  // browsers - manual restore is the reliable path.
  const handleTabClick = useCallback(
    (next: TabId) => {
      const current = tabRefs.current[activeTab];
      if (current) tabScrolls.current[activeTab] = current.scrollTop;
      setActiveTab(next);
      requestAnimationFrame(() => {
        const target = tabRefs.current[next];
        if (target) target.scrollTop = tabScrolls.current[next] ?? 0;
      });
    },
    [activeTab],
  );

  const handlePaneScroll = useCallback(
    (id: TabId) => (e: React.UIEvent<HTMLDivElement>) => {
      tabScrolls.current[id] = e.currentTarget.scrollTop;
    },
    [],
  );

  const openContactSheet = useCallback(() => setContactStage('sheet'), []);
  const closeContactSheet = useCallback(() => setContactStage('idle'), []);

  const handleSend = useCallback(() => {
    if (!message.trim()) return;
    setContactStage('confirmation');
    onContactAgentSent(property);
  }, [message, onContactAgentSent, property]);

  const handleBackToProperty = useCallback(() => setContactStage('idle'), []);

  return (
    <div className="relative flex h-full flex-col bg-white">
      {/* ── Persistent header: photo carousel + quick stats + tab bar ── */}
      <div className="relative flex-shrink-0">
        <PropertyPhotoCarousel images={images} alt={property.title} />

        <button
          onClick={onBack}
          aria-label="Back"
          className="absolute top-[max(env(safe-area-inset-top),0.5rem)] left-3 bg-white/95 rounded-full shadow-lg hover:bg-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-[#1a2332]" />
        </button>

        <button
          onClick={onFavorite}
          aria-label={isFavorited ? 'Remove from bookmarks' : 'Save to bookmarks'}
          className="absolute top-[max(env(safe-area-inset-top),0.5rem)] right-3 bg-white/95 rounded-full shadow-lg hover:bg-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <Heart
            className={`w-5 h-5 transition-transform ${
              isFavorited ? 'text-[#ff6b35] fill-[#ff6b35] scale-110' : 'text-[#1a2332]'
            }`}
          />
        </button>

        <div className="absolute top-[max(env(safe-area-inset-top),0.5rem)] left-1/2 -translate-x-1/2 bg-white/95 px-3 py-1.5 rounded-full text-xs font-medium text-[#1a2332] flex items-center gap-1.5 shadow-lg">
          <CategoryIcon className="w-3.5 h-3.5" />
          {property.propertyType}
        </div>
      </div>

      <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-[#f1f3f5]">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[#1a2332] leading-snug truncate">
              {property.title}
            </h1>
            <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{property.address}</span>
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-bold text-[#1a2332] whitespace-nowrap">
              {priceFor(searchMode, property)}
            </p>
            <p className="text-[11px] text-gray-600 -mt-0.5">
              {searchMode === 'rent' ? 'per month' : 'for sale'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          <Stat icon={Bed} label="Beds" value={`${property.bedrooms}`} />
          <Stat icon={Bath} label="Baths" value={`${property.bathrooms}`} />
          <Stat icon={Maximize} label="Floor area" value={`${property.floorAreaSqft} ft²`} />
          <Stat icon={Calendar} label="Built" value={`${property.yearBuilt}`} />
        </div>
      </div>

      {/* ── Sticky tab bar ── */}
      <div className="flex-shrink-0 border-b border-[#e5e7eb] bg-white">
        <div role="tablist" className="flex overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabClick(tab.id)}
                className={`flex-1 min-w-[88px] py-3 text-sm transition-colors min-h-[44px] ${
                  isActive
                    ? 'text-[#1a2332] font-bold'
                    : 'text-gray-500 font-medium hover:text-[#1a2332]'
                }`}
              >
                {tab.label}
                <div
                  className={`mt-2 h-0.5 mx-4 rounded-full transition-colors ${
                    isActive ? 'bg-[#ff6b35]' : 'bg-transparent'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content: per-tab scroll containers, only active shown ── */}
      <div className="flex-1 relative">
        <TabPane
          id="overview"
          active={activeTab === 'overview'}
          paneRef={(el) => (tabRefs.current.overview = el)}
          onScroll={handlePaneScroll('overview')}
        >
          <OverviewContent
            property={property}
            searchMode={searchMode}
            descriptionExpanded={descriptionExpanded}
            onToggleDescription={() => setDescriptionExpanded((v) => !v)}
            bookmarkIds={bookmarkIds}
            viewedEntries={viewedEntries}
            onBookmarkToggle={onBookmarkToggle}
            onPropertySelect={onPropertySelect}
            onViewAllSimilar={() => onViewAllSimilar(property)}
          />
        </TabPane>

        <TabPane
          id="details"
          active={activeTab === 'details'}
          paneRef={(el) => (tabRefs.current.details = el)}
          onScroll={handlePaneScroll('details')}
        >
          <DetailsContent rows={detailRows} />
        </TabPane>

        <TabPane
          id="floor-plan"
          active={activeTab === 'floor-plan'}
          paneRef={(el) => (tabRefs.current['floor-plan'] = el)}
          onScroll={handlePaneScroll('floor-plan')}
        >
          <FloorPlanContent
            url={floorPlanUrl}
            propertyTitle={property.title}
            onExpand={() => setFloorPlanOpen(true)}
          />
        </TabPane>

        <TabPane
          id="location"
          active={activeTab === 'location'}
          paneRef={(el) => (tabRefs.current.location = el)}
          onScroll={handlePaneScroll('location')}
        >
          <LocationContent property={property} searchMode={searchMode} />
        </TabPane>
      </div>

      {/* ── Sticky bottom CTA bar ── */}
      <div className="flex-shrink-0 bg-white border-t border-[#e5e7eb] px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2">
          <button
            onClick={onCompare}
            aria-label="Compare property"
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl border-2 border-[#e5e7eb] bg-white text-[#1a2332] hover:border-[#1a2332] transition-colors"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
          <button
            onClick={openContactSheet}
            className="flex-1 min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 bg-[#1a2332] text-white rounded-xl hover:bg-[#0f1620] transition-colors font-medium shadow-lg shadow-[#1a2332]/20"
          >
            <Phone className="w-4 h-4" />
            <span>Contact agent</span>
          </button>
        </div>
      </div>

      {/* ── Floor plan full-screen modal ── */}
      {floorPlanOpen && floorPlanUrl && (
        <FloorPlanModal
          url={floorPlanUrl}
          alt={`Floor plan for ${property.title}`}
          onClose={() => setFloorPlanOpen(false)}
        />
      )}

      {/* ── Contact Agent bottom sheet ── */}
      {contactStage === 'sheet' && (
        <>
          <div
            onClick={closeContactSheet}
            className="absolute inset-0 bg-black/40 z-40 animate-in fade-in"
          />
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom">
            <div className="px-6 pt-4 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
              <div className="mx-auto h-1.5 w-12 bg-[#e5e7eb] rounded-full mb-4" />
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1a2332]">Contact agent</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {AGENT.name} &middot; {AGENT.branch}
                  </p>
                </div>
                <button
                  onClick={closeContactSheet}
                  aria-label="Close"
                  className="p-2 -mr-2 text-gray-500 hover:text-[#1a2332] min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <label htmlFor="agent-message" className="block text-sm font-medium text-[#1a2332] mb-2">
                Message
              </label>
              <textarea
                id="agent-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full p-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-sm text-[#1a2332] focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent resize-none"
                placeholder="Say hello and ask any questions..."
              />

              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="w-full mt-4 bg-[#ff6b35] text-white py-4 rounded-xl hover:bg-[#ff5722] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium shadow-lg shadow-[#ff6b35]/20 min-h-[48px]"
              >
                Send inquiry
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Confirmation overlay ── */}
      {contactStage === 'confirmation' && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center px-6 animate-in fade-in">
          <div className="bg-[#fff5f2] rounded-full p-6 mb-6">
            <Check className="w-12 h-12 text-[#ff6b35]" strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold text-[#1a2332] mb-3 text-center">Inquiry sent</h2>
          <p className="text-center text-gray-600 max-w-xs">
            Agent <span className="font-medium text-[#1a2332]">{AGENT.name}</span> from{' '}
            <span className="font-medium text-[#1a2332]">{AGENT.branch}</span> will be in touch.
          </p>
          <button
            onClick={handleBackToProperty}
            className="mt-8 w-full max-w-xs bg-[#1a2332] text-white py-4 rounded-xl hover:bg-[#0f1620] transition-colors font-medium min-h-[48px]"
          >
            Back to property
          </button>
        </div>
      )}
    </div>
  );
}

// ── helpers ────────────────────────────────────────────────────────────

interface TabPaneProps {
  id: TabId;
  active: boolean;
  paneRef: (el: HTMLDivElement | null) => void;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}

function TabPane({ id, active, paneRef, onScroll, children }: TabPaneProps) {
  return (
    <div
      ref={paneRef}
      onScroll={onScroll}
      data-tab-pane={id}
      role="tabpanel"
      hidden={!active}
      className={`absolute inset-0 overflow-y-auto ${active ? '' : 'pointer-events-none'}`}
    >
      <div className="pb-6">{children}</div>
    </div>
  );
}

function OverviewContent({
  property,
  searchMode,
  descriptionExpanded,
  onToggleDescription,
  bookmarkIds,
  viewedEntries,
  onBookmarkToggle,
  onPropertySelect,
  onViewAllSimilar,
}: {
  property: Property;
  searchMode: SearchMode;
  descriptionExpanded: boolean;
  onToggleDescription: () => void;
  bookmarkIds: string[];
  viewedEntries: ViewedEntry[];
  onBookmarkToggle: (property: Property) => void;
  onPropertySelect: (property: Property) => void;
  onViewAllSimilar: () => void;
}) {
  return (
    <div className="px-5 py-5 space-y-5">
      <section>
        <h2 className="text-lg font-bold text-[#1a2332] mb-3">About this property</h2>
        <p
          className={`text-[15px] text-gray-700 leading-relaxed ${
            descriptionExpanded ? '' : 'line-clamp-4'
          }`}
        >
          {property.description}
        </p>
        {property.description.length > 160 && (
          <button
            onClick={onToggleDescription}
            className="mt-2 text-sm font-medium text-[#ff6b35] hover:underline"
          >
            {descriptionExpanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-[#1a2332] mb-3">Key stats</h2>
        <div className="grid grid-cols-2 gap-2.5">
          <StatTile icon={Bed} label="Bedrooms" value={`${property.bedrooms}`} />
          <StatTile icon={Bath} label="Bathrooms" value={`${property.bathrooms}`} />
          <StatTile icon={Maximize} label="Floor area" value={`${property.floorAreaSqft} sq ft`} />
          <StatTile icon={Calendar} label="Property type" value={property.propertyType} />
        </div>
      </section>

      {property.preferenceTags.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-[#1a2332] mb-3">Matches your priorities</h2>
          <div className="flex flex-wrap gap-2">
            {property.preferenceTags.map((id) => {
              const opt = preferenceOptionById(id);
              if (!opt) return null;
              const Icon = opt.icon;
              return (
                <span
                  key={id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fff5f2] border border-[#ff6b35]/30 text-[#ff6b35] text-xs font-medium"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {opt.label}
                </span>
              );
            })}
          </div>
        </section>
      )}

      <SimilarPropertiesSection
        target={property}
        searchMode={searchMode}
        bookmarkIds={bookmarkIds}
        viewedEntries={viewedEntries}
        onBookmarkToggle={onBookmarkToggle}
        onPropertySelect={onPropertySelect}
        onViewAll={onViewAllSimilar}
      />
    </div>
  );
}

function DetailsContent({ rows }: { rows: ReturnType<typeof detailRowsFor> }) {
  return (
    <div className="px-5 py-5">
      <h2 className="text-lg font-bold text-[#1a2332] mb-3">Property details</h2>
      <dl className="rounded-2xl border border-[#e5e7eb] divide-y divide-[#e5e7eb] overflow-hidden">
        {rows.map((row) => (
          <div key={row.label} className="px-4 py-3 flex items-center justify-between gap-3">
            <dt className="text-sm text-gray-600">{row.label}</dt>
            <dd className="text-sm font-medium text-[#1a2332] text-right truncate">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function FloorPlanContent({
  url,
  propertyTitle,
  onExpand,
}: {
  url: string | null;
  propertyTitle: string;
  onExpand: () => void;
}) {
  if (!url) {
    return (
      <div className="px-5 py-8">
        <div className="rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-16 px-4 flex flex-col items-center text-center">
          <LayoutGrid className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-[#1a2332]">Floor plan not available</p>
          <p className="text-xs text-gray-500 mt-1">We don't have a floor plan for this listing yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-5">
      <h2 className="text-lg font-bold text-[#1a2332] mb-3">Floor plan</h2>
      <button
        type="button"
        onClick={onExpand}
        className="relative w-full rounded-2xl border border-[#e5e7eb] bg-white overflow-hidden hover:shadow-md transition-shadow"
        aria-label={`Open floor plan for ${propertyTitle} full screen`}
      >
        <img
          src={url}
          alt={`Floor plan for ${propertyTitle}`}
          className="w-full h-auto block"
          draggable={false}
        />
        <div className="absolute top-2 right-2 bg-white/95 rounded-full p-2 shadow-md text-[#1a2332]">
          <Maximize2 className="w-4 h-4" />
        </div>
      </button>
      <p className="mt-2 text-center text-xs text-gray-500">Tap image to view full screen</p>
    </div>
  );
}

function LocationContent({
  property,
  searchMode,
}: {
  property: Property;
  searchMode: SearchMode;
}) {
  return (
    <div className="px-5 py-5 space-y-5">
      <section>
        <h2 className="text-lg font-bold text-[#1a2332] mb-3">Location</h2>
        <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          {property.address}
        </p>
        <div className="h-56 rounded-2xl overflow-hidden border border-[#e5e7eb] relative">
          <Suspense
            fallback={
              <div className="h-full flex items-center justify-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading map…
              </div>
            }
          >
            <PropertyMap
              properties={[property]}
              searchMode={searchMode}
              areaCenter={{ lat: property.lat, lng: property.lng }}
              onPropertySelect={() => {}}
            />
          </Suspense>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold text-[#1a2332] mb-2">Nearest transport</h3>
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <Train className="w-4 h-4 text-[#ff6b35] flex-shrink-0" />
          {property.distanceToTube}
        </p>
      </section>

      <section>
        <h3 className="text-sm font-bold text-[#1a2332] mb-2">Schools nearby</h3>
        <NearbyList kinds={['School']} />
      </section>

      <section>
        <h3 className="text-sm font-bold text-[#1a2332] mb-2">Amenities nearby</h3>
        <NearbyList kinds={['Supermarket', 'Park']} />
      </section>
    </div>
  );
}

function NearbyList({ kinds }: { kinds: string[] }) {
  const items = NEARBY.filter((n) => kinds.includes(n.kind));
  if (items.length === 0) {
    return <p className="text-sm text-gray-500">No data available.</p>;
  }
  return (
    <ul className="rounded-2xl border border-[#e5e7eb] divide-y divide-[#e5e7eb] overflow-hidden">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.label} className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Icon className="w-4 h-4 text-[#ff6b35] flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#1a2332] truncate">{item.label}</p>
                <p className="text-[11px] text-gray-500">{item.kind}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 whitespace-nowrap">{item.distance}</p>
          </li>
        );
      })}
    </ul>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Bed; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl bg-[#f9fafb]">
      <Icon className="w-4 h-4 text-[#ff6b35]" />
      <p className="text-sm font-bold text-[#1a2332] leading-tight">{value}</p>
      <p className="text-[10px] text-gray-500 leading-tight">{label}</p>
    </div>
  );
}

function StatTile({ icon: Icon, label, value }: { icon: typeof Bed; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f9fafb] px-4 py-3 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Icon className="w-4 h-4 text-[#ff6b35]" />
        {label}
      </div>
      <p className="text-base font-bold text-[#1a2332]">{value}</p>
    </div>
  );
}

// ── Floor plan modal with pinch / wheel zoom ───────────────────────────

function FloorPlanModal({
  url,
  alt,
  onClose,
}: {
  url: string;
  alt: string;
  onClose: () => void;
}) {
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const t = window.setTimeout(() => setHintVisible(false), 2000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Floor plan – full screen"
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.85)' }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close floor plan"
        className="absolute inset-0 cursor-default"
        tabIndex={-1}
      />

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
        style={{ top: 'max(env(safe-area-inset-top), 1rem)' }}
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative w-full h-full md:max-w-[900px] md:max-h-[80vh] flex items-center justify-center px-4">
        <TransformWrapper
          minScale={1}
          maxScale={4}
          initialScale={1}
          centerOnInit
          doubleClick={{ mode: 'toggle', step: 1.5 }}
          wheel={{ step: 0.25 }}
          panning={{ disabled: false }}
          pinch={{ step: 5 }}
        >
          <TransformComponent
            wrapperClass="!w-full !h-full"
            contentClass="!w-full !h-full flex items-center justify-center"
          >
            <img
              src={url}
              alt={alt}
              className="max-w-full max-h-full object-contain"
              draggable={false}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>

      {hintVisible && (
        <div
          className="md:hidden absolute left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-2 rounded-full"
          style={{ bottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
        >
          Pinch to zoom · double-tap to toggle
        </div>
      )}
    </div>
  );
}
