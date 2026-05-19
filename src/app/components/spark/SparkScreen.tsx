import { useMemo, useRef, useState } from 'react';
import {
  SlidersHorizontal,
  Heart,
  X,
  BedDouble,
  Bath,
  Maximize2,
  ChevronRight,
} from 'lucide-react';
import {
  applyFilters,
  DEFAULT_FILTERS,
  isFilterActive,
  type PropertyFilters,
} from '../../data/propertyFilters';
import { type Property } from '../../data/properties';
import { priceFor, type SearchMode } from '../../data/pricing';
import { FilterSheet } from '../areas/FilterSheet';

// ── Module-level session (survives navigation within the browser session) ─

interface SparkSession {
  shuffled: Property[];
  currentIdx: number;
  filters: PropertyFilters;
}

let _sparkSession: SparkSession | null = null;

function getSparkSession(allProperties: Property[]): SparkSession {
  if (!_sparkSession) {
    _sparkSession = {
      shuffled: [...allProperties].sort(() => Math.random() - 0.5),
      currentIdx: 0,
      filters: DEFAULT_FILTERS,
    };
  }
  return _sparkSession;
}

function patchSparkSession(patch: Partial<Omit<SparkSession, 'shuffled'>>) {
  if (_sparkSession) Object.assign(_sparkSession, patch);
}

// ── SparkCard ─────────────────────────────────────────────────────────────

interface SparkCardProps {
  property: Property;
  searchMode: SearchMode;
}

function SparkCard({ property, searchMode }: SparkCardProps) {
  return (
    <div className="flex flex-col h-full pointer-events-none">
      {/* Hero image – 60% of card */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ height: '60%' }}>
        <img
          src={`${property.imageUrl}&w=600&q=80`}
          alt={property.title}
          className="w-full h-full object-cover"
          draggable={false}
        />
        {/* Price badge */}
        <div className="absolute bottom-3 left-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-sm">
            <p className="text-[#0F0C2E] font-semibold text-lg leading-none">
              {priceFor(searchMode, property)}
            </p>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="flex-1 px-4 pt-3 pb-4 flex flex-col gap-2 min-h-0">
        <div>
          <h3 className="font-semibold text-[#0F0C2E] text-base leading-snug">{property.title}</h3>
          <p className="text-gray-500 text-sm">{property.address}</p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <BedDouble className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-[#0F0C2E]">{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-[#0F0C2E]">{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-[#0F0C2E]">
              {property.floorAreaSqft.toLocaleString()} sqft
            </span>
          </div>
        </div>

        {/* Description – 2-line clamp via inline style (Tailwind line-clamp may not be in v4 config) */}
        <p
          className="text-sm text-gray-600 leading-relaxed"
          style={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {property.description}
        </p>

        {/* "View details" hint */}
        <div className="flex items-center gap-0.5 text-[#3C3489] mt-auto">
          <span className="text-sm font-medium">View details</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────

function EmptyState({ onUpdateFilters }: { onUpdateFilters: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-[#F7F6FB] flex items-center justify-center mb-4">
        <Heart className="w-8 h-8 text-gray-300" />
      </div>
      <h2 className="text-xl font-semibold text-[#0F0C2E] mb-2">You're all caught up!</h2>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        Adjust your filters to discover more properties.
      </p>
      <button
        onClick={onUpdateFilters}
        className="bg-[#0F0C2E] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#2a3342] transition-colors"
      >
        Update filters
      </button>
    </div>
  );
}

// ── SparkScreen ───────────────────────────────────────────────────────────

interface SparkScreenProps {
  properties: Property[];
  searchMode: SearchMode;
  onPropertySelect: (property: Property) => void;
  onInterestedInProperty: (property: Property) => void;
}

const SWIPE_THRESHOLD = 80;

export function SparkScreen({
  properties,
  searchMode,
  onPropertySelect,
  onInterestedInProperty,
}: SparkScreenProps) {
  const session = getSparkSession(properties);

  const [filters, setFilters] = useState<PropertyFilters>(session.filters);
  const [currentIdx, setCurrentIdx] = useState(session.currentIdx);
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredStack = useMemo(
    () => applyFilters(session.shuffled, filters, searchMode),
    [session.shuffled, filters, searchMode],
  );

  // ── Drag / swipe state ─────────────────────────────────────────────────
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const isTapRef = useRef(false);
  const exitingRef = useRef(false);

  const advance = (nextIdx: number) => {
    patchSparkSession({ currentIdx: nextIdx });
    setCurrentIdx(nextIdx);
    setDragX(0);
    setIsDragging(false);
    exitingRef.current = false;
  };

  const triggerSwipeRight = () => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setIsDragging(false);
    setDragX(700);
    const property = filteredStack[currentIdx];
    window.setTimeout(() => {
      onInterestedInProperty(property);
      advance(currentIdx + 1);
    }, 300);
  };

  const triggerSwipeLeft = () => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setIsDragging(false);
    setDragX(-700);
    window.setTimeout(() => advance(currentIdx + 1), 300);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (exitingRef.current) return;
    setIsDragging(true);
    isTapRef.current = true;
    startXRef.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || exitingRef.current) return;
    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 5) isTapRef.current = false;
    setDragX(dx);
  };

  const handlePointerUp = () => {
    if (!isDragging || exitingRef.current) return;
    if (isTapRef.current) {
      // Pure tap → open property detail
      setIsDragging(false);
      setDragX(0);
      onPropertySelect(filteredStack[currentIdx]);
      return;
    }
    setIsDragging(false);
    if (dragX > SWIPE_THRESHOLD) {
      triggerSwipeRight();
    } else if (dragX < -SWIPE_THRESHOLD) {
      triggerSwipeLeft();
    } else {
      setDragX(0); // snap back (transition handles the spring)
    }
  };

  const hasActiveFilters = isFilterActive(filters);
  const exhausted = currentIdx >= filteredStack.length;

  return (
    <div className="flex flex-col h-full bg-[#F7F6FB]">
      {/* ── Header ── */}
      <div className="bg-white border-b border-[#e5e7eb] px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-[#0F0C2E]">Spark</h1>
          <p className="text-xs text-gray-500 mt-0.5">Swipe to find your next home</p>
        </div>
        <button
          onClick={() => setFilterOpen(true)}
          aria-label="Open filters"
          className="relative w-10 h-10 flex items-center justify-center rounded-full bg-[#F7F6FB] text-[#0F0C2E] hover:bg-[#EEEDFE] transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5" />
          {hasActiveFilters && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#E5917A] ring-2 ring-white" />
          )}
        </button>
      </div>

      {exhausted ? (
        <EmptyState onUpdateFilters={() => setFilterOpen(true)} />
      ) : (
        <>
          {/* ── Card stack ── */}
          <div className="flex-1 flex items-center justify-center px-5 pt-4 pb-2 min-h-0">
            <div
              className="relative w-full"
              style={{ maxWidth: 380, height: 'min(460px, 72vh)' }}
            >
              {/* Cards peeking behind the top card */}
              {[2, 1].map((offset) => {
                const idx = currentIdx + offset;
                if (idx >= filteredStack.length) return null;
                const scale = 1 - offset * 0.04;
                const translateY = offset * 10;
                return (
                  <div
                    key={filteredStack[idx].id}
                    className="absolute inset-0 bg-white rounded-3xl shadow-md overflow-hidden"
                    style={{
                      transform: `scale(${scale}) translateY(${translateY}px)`,
                      transformOrigin: 'bottom center',
                      zIndex: 3 - offset,
                    }}
                  />
                );
              })}

              {/* ── Top / draggable card ── */}
              <div
                className="absolute inset-0 bg-white rounded-3xl shadow-xl overflow-hidden select-none"
                style={{
                  transform: `translateX(${dragX}px) rotate(${dragX * 0.045}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(.23,1,.32,1)',
                  zIndex: 4,
                  touchAction: 'none',
                  cursor: isDragging ? 'grabbing' : 'grab',
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {/* "Interested" stamp */}
                {dragX > 20 && (
                  <div
                    className="absolute inset-0 z-10 flex items-start justify-start p-5 pointer-events-none"
                    style={{ opacity: Math.min(1, (dragX - 20) / 80) }}
                  >
                    <div
                      className="border-4 border-green-500 rounded-xl px-3 py-1"
                      style={{ transform: 'rotate(-12deg)' }}
                    >
                      <p className="text-green-500 font-semibold text-xl tracking-widest uppercase">
                        Interested
                      </p>
                    </div>
                  </div>
                )}

                {/* "Pass" stamp */}
                {dragX < -20 && (
                  <div
                    className="absolute inset-0 z-10 flex items-start justify-end p-5 pointer-events-none"
                    style={{ opacity: Math.min(1, (-dragX - 20) / 80) }}
                  >
                    <div
                      className="border-4 border-gray-400 rounded-xl px-3 py-1"
                      style={{ transform: 'rotate(12deg)' }}
                    >
                      <p className="text-gray-400 font-semibold text-xl tracking-widest uppercase">
                        Pass
                      </p>
                    </div>
                  </div>
                )}

                <SparkCard property={filteredStack[currentIdx]} searchMode={searchMode} />
              </div>
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex items-center justify-center gap-10 py-4 flex-shrink-0">
            <button
              onClick={triggerSwipeLeft}
              aria-label="Pass"
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
            >
              <X className="w-7 h-7 text-gray-400" />
            </button>
            <button
              onClick={triggerSwipeRight}
              aria-label="Interested – send to agent"
              className="w-16 h-16 rounded-full bg-[#0F0C2E] flex items-center justify-center hover:bg-[#1a1650] transition-colors"
              style={{ boxShadow: '0 4px 20px rgba(26,35,50,0.35)' }}
            >
              <Heart className="w-7 h-7 fill-white text-white" />
            </button>
          </div>
        </>
      )}

      {/* ── Filter sheet ── */}
      <FilterSheet
        open={filterOpen}
        initialFilters={filters}
        candidateProperties={properties}
        searchMode={searchMode}
        onApply={(next) => {
          setFilters(next);
          setCurrentIdx(0);
          patchSparkSession({ filters: next, currentIdx: 0 });
          setFilterOpen(false);
        }}
        onClear={() => {
          setFilters(DEFAULT_FILTERS);
          setCurrentIdx(0);
          patchSparkSession({ filters: DEFAULT_FILTERS, currentIdx: 0 });
        }}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  );
}
