import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Heart,
  ArrowLeftRight,
  Phone,
  Bed,
  Bath,
  Maximize,
  Home as HomeIcon,
  Calendar,
  ChevronDown,
  Check,
  X,
  MapPin,
  Loader2,
} from 'lucide-react';
import type { Property } from '../../data/properties';
import { priceFor, type SearchMode } from '../../data/pricing';
import { categoryIconFor } from '../../data/categories';
import { preferenceOptionById } from '../../data/preferences';
import { featuresFor } from '../../data/propertyFeatures';
import { PropertyPhotoCarousel } from './PropertyPhotoCarousel';

const PropertyMap = lazy(() => import('../areas/PropertyMap'));

interface PropertyDetailScreenProps {
  property: Property;
  searchMode: SearchMode;
  onBack: () => void;
  onFavorite: () => void;
  onCompare: () => void;
  onContactAgentSent: (property: Property) => void;
  isFavorited: boolean;
}

type ContactStage = 'idle' | 'sheet' | 'confirmation';
type TabId = 'overview' | 'features' | 'location';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'features', label: 'Features' },
  { id: 'location', label: 'Location' },
];

const AGENT = {
  name: 'Sarah Chen',
  branch: 'Canary Wharf Branch',
};

function galleryFor(property: Property): string[] {
  // Single hero plus a curated handful so the carousel always has content.
  return [
    property.imageUrl,
    'https://images.unsplash.com/photo-1502672260066-6bc2614030a5?w=800',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800',
  ];
}

const NEARBY = [
  { label: 'Old Street Station', kind: 'transport', distance: '5 min walk' },
  { label: 'St. Luke\'s Primary School', kind: 'school', distance: '10 min walk' },
  { label: 'Tesco Express', kind: 'shop', distance: '3 min walk' },
  { label: 'Shoreditch Park', kind: 'park', distance: '8 min walk' },
];

export function PropertyDetailScreen({
  property,
  searchMode,
  onBack,
  onFavorite,
  onCompare,
  onContactAgentSent,
  isFavorited,
}: PropertyDetailScreenProps) {
  const [contactStage, setContactStage] = useState<ContactStage>('idle');
  const [message, setMessage] = useState(
    `Hi, I'm interested in ${property.title} at ${property.address}. Could you share more details?`,
  );
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [openFeatureKeys, setOpenFeatureKeys] = useState<Set<string>>(new Set(['interior']));

  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<TabId, HTMLElement | null>>({
    overview: null,
    features: null,
    location: null,
  });

  const CategoryIcon = categoryIconFor(property.propertyType);
  const features = useMemo(() => featuresFor(property.propertyType), [property.propertyType]);
  const images = useMemo(() => galleryFor(property), [property.id]);

  useEffect(() => {
    setContactStage('idle');
    setActiveTab('overview');
    setDescriptionExpanded(false);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [property.id]);

  // Scrollspy: keep the sticky tab in sync with whichever section dominates.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const sections = TABS.map((t) => sectionRefs.current[t.id]).filter((el): el is HTMLElement =>
      Boolean(el),
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top),
          );
        if (visible.length > 0) {
          const id = visible[0].target.getAttribute('data-section-id') as TabId | null;
          if (id) setActiveTab(id);
        }
      },
      {
        root,
        threshold: [0.25, 0.5, 0.75],
        rootMargin: '-96px 0px -50% 0px',
      },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [property.id]);

  const scrollToSection = useCallback((id: TabId) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveTab(id);
  }, []);

  const toggleFeatureKey = useCallback((key: string) => {
    setOpenFeatureKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

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
      {/* Scrollable area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-[140px]">
        {/* Photo carousel + back + favourite */}
        <div className="relative">
          <PropertyPhotoCarousel images={images} alt={property.title} />

          <button
            onClick={onBack}
            aria-label="Back"
            className="absolute top-[max(env(safe-area-inset-top),0.5rem)] left-3 bg-white/95 rounded-full p-2.5 shadow-lg hover:bg-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-[#1a2332]" />
          </button>

          <button
            onClick={onFavorite}
            aria-label={isFavorited ? 'Remove from favourites' : 'Save to favourites'}
            className="absolute top-[max(env(safe-area-inset-top),0.5rem)] right-3 bg-white/95 rounded-full p-2.5 shadow-lg hover:bg-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Heart
              className={`w-5 h-5 ${isFavorited ? 'text-[#ff6b35] fill-[#ff6b35]' : 'text-[#1a2332]'}`}
            />
          </button>

          <div className="absolute top-[max(env(safe-area-inset-top),0.5rem)] left-1/2 -translate-x-1/2 bg-white/95 px-3 py-1.5 rounded-full text-xs font-medium text-[#1a2332] flex items-center gap-1.5 shadow-lg">
            <CategoryIcon className="w-3.5 h-3.5" />
            {property.propertyType}
          </div>
        </div>

        {/* Quick stats card */}
        <div className="px-5 pt-4 pb-3 border-b border-[#f1f3f5]">
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

          <div className="grid grid-cols-4 gap-1.5 mt-3">
            <Stat icon={Bed} label="Beds" value={`${property.bedrooms}`} />
            <Stat icon={Bath} label="Baths" value={`${property.bathrooms}`} />
            <Stat icon={Maximize} label="Floor area" value={`${property.floorAreaSqft} ft²`} />
            <Stat icon={Calendar} label="Built" value={`${property.yearBuilt}`} />
          </div>
        </div>

        {/* Sticky tab bar */}
        <div className="sticky top-0 z-20 bg-white border-b border-[#e5e7eb]">
          <div role="tablist" className="flex">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => scrollToSection(tab.id)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors min-h-[44px] ${
                    isActive ? 'text-[#1a2332]' : 'text-gray-500 hover:text-[#1a2332]'
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

        {/* Overview */}
        <section
          ref={(el) => (sectionRefs.current.overview = el)}
          data-section-id="overview"
          className="px-5 py-5 scroll-mt-12"
        >
          <h2 className="text-lg font-bold text-[#1a2332] mb-3">About this property</h2>

          <p
            className={`text-[15px] text-gray-700 leading-relaxed ${
              descriptionExpanded ? '' : 'line-clamp-3'
            }`}
          >
            {property.description}
          </p>
          {property.description.length > 140 && (
            <button
              onClick={() => setDescriptionExpanded((v) => !v)}
              className="mt-2 text-sm font-medium text-[#ff6b35] hover:underline"
            >
              {descriptionExpanded ? 'Show less' : 'Show more'}
            </button>
          )}

          {property.preferenceTags.length > 0 && (
            <>
              <h3 className="text-sm font-bold text-[#1a2332] mt-5 mb-2">
                Matches your priorities
              </h3>
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
            </>
          )}
        </section>

        {/* Features */}
        <section
          ref={(el) => (sectionRefs.current.features = el)}
          data-section-id="features"
          className="px-5 py-5 border-t border-[#f1f3f5] scroll-mt-12"
        >
          <h2 className="text-lg font-bold text-[#1a2332] mb-3">Features</h2>

          <div className="rounded-2xl border border-[#e5e7eb] divide-y divide-[#e5e7eb]">
            <FeatureGroup
              id="interior"
              title="Interior"
              icon={HomeIcon}
              items={features.interior}
              open={openFeatureKeys.has('interior')}
              onToggle={() => toggleFeatureKey('interior')}
            />
            <FeatureGroup
              id="exterior"
              title="Exterior"
              icon={HomeIcon}
              items={features.exterior}
              open={openFeatureKeys.has('exterior')}
              onToggle={() => toggleFeatureKey('exterior')}
            />
            <FeatureGroup
              id="amenities"
              title="Amenities"
              icon={HomeIcon}
              items={features.amenities}
              open={openFeatureKeys.has('amenities')}
              onToggle={() => toggleFeatureKey('amenities')}
            />
            <KeyValueRow label="Parking" value={features.parking} />
            <KeyValueRow label="Year built" value={`${property.yearBuilt}`} />
            <KeyValueRow label="Floor area" value={`${property.floorAreaSqft} sq ft`} />
            <KeyValueRow label="Property type" value={property.propertyType} />
          </div>

          <button
            onClick={onCompare}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#f9fafb] text-[#1a2332] text-sm font-medium hover:bg-[#f5f5f7] transition-colors min-h-[44px]"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Compare with another
          </button>
        </section>

        {/* Location */}
        <section
          ref={(el) => (sectionRefs.current.location = el)}
          data-section-id="location"
          className="px-5 py-5 border-t border-[#f1f3f5] scroll-mt-12"
        >
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

          <h3 className="text-sm font-bold text-[#1a2332] mt-5 mb-2">Nearby</h3>
          <ul className="rounded-2xl border border-[#e5e7eb] divide-y divide-[#e5e7eb] overflow-hidden">
            {NEARBY.map((n) => (
              <li key={n.label} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1a2332] truncate">{n.label}</p>
                  <p className="text-xs text-gray-500 capitalize">{n.kind}</p>
                </div>
                <p className="text-xs text-gray-600 whitespace-nowrap">{n.distance}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Sticky bottom CTA bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2">
          <button
            onClick={onFavorite}
            aria-label={isFavorited ? 'Remove from favourites' : 'Save to favourites'}
            className={`min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl border-2 transition-colors ${
              isFavorited
                ? 'bg-[#fff5f2] border-[#ff6b35] text-[#ff6b35]'
                : 'bg-white border-[#e5e7eb] text-[#1a2332] hover:border-[#1a2332]'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
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

      {/* Contact Agent bottom sheet */}
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

      {/* Confirmation */}
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

interface StatProps {
  icon: typeof Bed;
  label: string;
  value: string;
}

function Stat({ icon: Icon, label, value }: StatProps) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl bg-[#f9fafb]">
      <Icon className="w-4 h-4 text-[#ff6b35]" />
      <p className="text-sm font-bold text-[#1a2332] leading-tight">{value}</p>
      <p className="text-[10px] text-gray-500 leading-tight">{label}</p>
    </div>
  );
}

interface FeatureGroupProps {
  id: string;
  title: string;
  icon: typeof HomeIcon;
  items: string[];
  open: boolean;
  onToggle: () => void;
}

function FeatureGroup({ title, items, open, onToggle }: FeatureGroupProps) {
  if (items.length === 0) return null;
  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="w-full px-4 py-3 flex items-center justify-between text-left min-h-[44px]"
      >
        <span className="text-sm font-medium text-[#1a2332]">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <ul className="px-4 pb-3 space-y-1.5">
          {items.map((item) => (
            <li key={item} className="text-sm text-gray-700 flex items-start gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-[#ff6b35] flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function KeyValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3 flex items-center justify-between gap-3">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-[#1a2332] text-right truncate">{value}</span>
    </div>
  );
}
