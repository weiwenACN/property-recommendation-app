import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SlidersHorizontal,
  Heart,
  X,
  BedDouble,
  Bath,
  Maximize2,
  Check,
  Home,
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
import { agentById, DEFAULT_AGENT_ID } from '../../data/agents';

// ── Module-level session ──────────────────────────────────────────────────

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

// ── Extra photos per property ─────────────────────────────────────────────
// Supplementary Unsplash photos for the in-card photo carousel.
// Properties with no entry show only their primary imageUrl.

const EXTRA_PHOTOS: Record<string, string[]> = {
  '1': [
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
  ],
  '3': [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
  ],
  '4': [
    'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=600&q=80',
  ],
  '7': [
    'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=600&q=80',
    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&q=80',
  ],
  '9': [
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&q=80',
  ],
  '11': [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
  ],
  '12': [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
  ],
  '13': [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80',
  ],
};

function getPhotos(property: Property): string[] {
  const base = `${property.imageUrl}&w=600&q=80`;
  const extra = (EXTRA_PHOTOS[property.id] ?? []).filter((u) => u !== base);
  return [base, ...extra];
}

// ── Celebration particles ─────────────────────────────────────────────────

interface ParticleConfig {
  color: string;
  /** % from top of screen where particle travels to */
  endTop: number;
  /** % from left of screen where particle travels to */
  endLeft: number;
  /** animation-delay in ms */
  delay: number;
}

// 14 particles spread around 360°, using the four brand colours
const PARTICLES: ParticleConfig[] = [
  { color: '#E5917A', endTop: 18, endLeft: 72, delay: 0   },
  { color: '#7F77DD', endTop: 8,  endLeft: 58, delay: 30  },
  { color: '#1D9E75', endTop: 5,  endLeft: 38, delay: 60  },
  { color: '#FFFFFF', endTop: 8,  endLeft: 18, delay: 90  },
  { color: '#E5917A', endTop: 22, endLeft: 8,  delay: 120 },
  { color: '#7F77DD', endTop: 42, endLeft: 4,  delay: 150 },
  { color: '#1D9E75', endTop: 62, endLeft: 8,  delay: 180 },
  { color: '#FFFFFF', endTop: 78, endLeft: 18, delay: 210 },
  { color: '#E5917A', endTop: 85, endLeft: 40, delay: 240 },
  { color: '#7F77DD', endTop: 82, endLeft: 62, delay: 270 },
  { color: '#1D9E75', endTop: 72, endLeft: 80, delay: 300 },
  { color: '#FFFFFF', endTop: 52, endLeft: 88, delay: 60  },
  { color: '#E5917A', endTop: 28, endLeft: 85, delay: 120 },
  { color: '#7F77DD', endTop: 12, endLeft: 78, delay: 180 },
];

/** Generates a unique @keyframes rule for each particle using viewport units */
function buildParticleCSS(): string {
  return PARTICLES.map((p, i) => {
    const dx = p.endLeft - 50; // positive = right, negative = left
    const dy = p.endTop - 50;  // positive = down, negative = up
    return `@keyframes spark-p-${i} {
  0%   { transform: translate(-50%, -50%) scale(0); opacity: 1; }
  70%  { opacity: 0.9; }
  100% { transform: translate(calc(-50% + ${dx}vw), calc(-50% + ${dy}vh)) scale(1); opacity: 0; }
}`;
  }).join('\n');
}

// ── CelebrationScreen ─────────────────────────────────────────────────────

interface CelebrationProps {
  property: Property;
  agentFirstName: string;
  searchMode: SearchMode;
  onDismiss: () => void;
}

function CelebrationScreen({ property, agentFirstName, searchMode, onDismiss }: CelebrationProps) {
  const [dismissing, setDismissing] = useState(false);
  const photos = getPhotos(property);

  const handleDismiss = () => {
    if (dismissing) return;
    setDismissing(true);
    setTimeout(onDismiss, 200);
  };

  return (
    <>
      {/* Inject particle keyframes */}
      <style>{buildParticleCSS()}</style>

      <div
        onClick={handleDismiss}
        role="dialog"
        aria-modal="true"
        aria-label="You're interested! Tap anywhere to continue."
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9500,
          width: '100vw',
          height: '100dvh',
          background: '#0F0C2E',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(12px, 3vh, 24px)',
          padding: 'clamp(16px, 4vw, 32px)',
          boxSizing: 'border-box',
          overflow: 'hidden',
          opacity: dismissing ? 0 : 1,
          transition: 'opacity 200ms ease',
          cursor: 'pointer',
        }}
      >
        {/* Particles */}
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 'clamp(5px, 1.2vw, 8px)',
              height: 'clamp(5px, 1.2vw, 8px)',
              borderRadius: '50%',
              background: p.color,
              animationName: `spark-p-${i}`,
              animationDuration: '800ms',
              animationTimingFunction: 'ease-out',
              animationDelay: `${p.delay}ms`,
              animationFillMode: 'forwards',
              animationIterationCount: '1',
              pointerEvents: 'none',
            } as React.CSSProperties}
          />
        ))}

        {/* Headline */}
        <h1
          style={{
            color: '#E5917A',
            fontSize: 'clamp(24px, 5vw, 38px)',
            fontWeight: 500,
            letterSpacing: '-0.5px',
            margin: 0,
            lineHeight: 1.2,
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Love at first sight?
        </h1>

        <p
          style={{
            color: '#FFFFFF',
            fontSize: 'clamp(14px, 2.8vw, 20px)',
            fontWeight: 400,
            textAlign: 'center',
            margin: 0,
            position: 'relative',
            zIndex: 1,
          }}
        >
          Set up a date with {agentFirstName}!
        </p>

        {/* Property summary card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 'clamp(10px, 2vw, 14px)',
            padding: 'clamp(10px, 2.5vw, 16px)',
            width: 'min(320px, 85vw)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxSizing: 'border-box',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <img
            src={photos[0]}
            alt={property.title}
            style={{
              width: 'clamp(40px, 9vw, 56px)',
              height: 'clamp(40px, 9vw, 56px)',
              borderRadius: '8px',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                color: '#FFFFFF',
                fontSize: 'clamp(13px, 2.2vw, 16px)',
                fontWeight: 500,
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {priceFor(searchMode, property)}
            </p>
            <p
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 'clamp(11px, 1.8vw, 13px)',
                margin: '2px 0 0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {property.address}
            </p>
          </div>
        </div>

        {/* Tap hint */}
        <p
          style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: 'clamp(11px, 1.8vw, 13px)',
            margin: 0,
            position: 'relative',
            zIndex: 1,
          }}
        >
          Tap anywhere to continue
        </p>
      </div>
    </>
  );
}

// ── SparkToast ────────────────────────────────────────────────────────────

interface SparkToastProps {
  onView: () => void;
  onDismiss: () => void;
}

function SparkToast({ onView, onDismiss }: SparkToastProps) {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 50);
    const fadeTimer = setTimeout(() => setFading(true), 3000);
    const dismissTimer = setTimeout(() => onDismissRef.current(), 3300);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
      clearTimeout(dismissTimer);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
        left: 'clamp(12px, 4vw, 24px)',
        right: 'clamp(12px, 4vw, 24px)',
        background: '#0F0C2E',
        borderRadius: '12px',
        padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 18px)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transform: visible && !fading ? 'translateY(0)' : 'translateY(20px)',
        opacity: visible && !fading ? 1 : 0,
        transition: 'transform 250ms ease, opacity 300ms ease',
        zIndex: 9200,
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        boxSizing: 'border-box',
      }}
    >
      {/* Green checkmark */}
      <div
        aria-hidden="true"
        style={{
          width: 'clamp(18px, 4vw, 24px)',
          height: 'clamp(18px, 4vw, 24px)',
          background: '#1D9E75',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Check
          strokeWidth={2.5}
          style={{
            width: 'clamp(10px, 2.5vw, 14px)',
            height: 'clamp(10px, 2.5vw, 14px)',
            color: '#FFFFFF',
          }}
        />
      </div>

      {/* Label */}
      <span
        style={{
          color: '#FFFFFF',
          fontSize: 'clamp(12px, 1.8vw, 14px)',
          fontWeight: 500,
          flex: 1,
        }}
      >
        Message sent to agent
      </span>

      {/* View button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onView();
        }}
        style={{
          color: '#AFA9EC',
          fontSize: 'clamp(12px, 1.8vw, 14px)',
          fontWeight: 500,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0 4px',
          minWidth: '44px',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        View
      </button>
    </div>
  );
}

// ── SparkCard (front, interactive) ────────────────────────────────────────

interface SparkCardProps {
  property: Property;
  searchMode: SearchMode;
  photos: string[];
  photoIndex: number;
  agentInitials: string;
}

function SparkCard({ property, searchMode, photos, photoIndex, agentInitials }: SparkCardProps) {
  return (
    <div
      className="pointer-events-none"
      style={{
        position: 'relative',
        height: '100%',
        borderRadius: 'clamp(16px, 3vw, 24px)',
        overflow: 'hidden',
        background: '#111',
      }}
    >
      {/* ── Full-height crossfading photos ── */}
      {photos.map((url, i) => (
        <img
          key={url}
          src={url}
          alt={`${property.title} — photo ${i + 1}`}
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: i === photoIndex ? 1 : 0,
            transition: 'opacity 250ms ease',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ── Deep bottom gradient ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.1) 62%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Photo indicator dots (top centre) ── */}
      {photos.length > 1 && (
        <div
          style={{
            position: 'absolute',
            top: 'clamp(10px, 2vh, 16px)',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '5px',
            pointerEvents: 'none',
          }}
        >
          {photos.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === photoIndex ? 'clamp(14px, 3vw, 20px)' : '5px',
                height: '4px',
                borderRadius: '100px',
                background: 'rgba(255,255,255,0.9)',
                opacity: i === photoIndex ? 1 : 0.45,
                transition: 'width 220ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease',
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Content overlay (bottom) ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 'clamp(16px, 4vw, 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(6px, 1.5vh, 10px)',
          boxSizing: 'border-box',
        }}
      >
        {/* Price + agent avatar row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
          <p
            style={{
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 'clamp(24px, 6vw, 34px)',
              margin: 0,
              letterSpacing: '-0.5px',
              lineHeight: 1,
              textShadow: '0 2px 12px rgba(0,0,0,0.4)',
            }}
          >
            {priceFor(searchMode, property)}
          </p>

          {/* Agent avatar */}
          <div
            style={{
              width: 'clamp(36px, 8vw, 44px)',
              height: 'clamp(36px, 8vw, 44px)',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7F77DD 0%, #3C3489 100%)',
              border: '2.5px solid rgba(255,255,255,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 12px rgba(0,0,0,0.35)',
            }}
          >
            <span
              style={{
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 'clamp(11px, 2.2vw, 14px)',
                letterSpacing: '-0.2px',
              }}
            >
              {agentInitials}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          style={{
            fontWeight: 700,
            color: '#FFFFFF',
            fontSize: 'clamp(15px, 3.2vw, 20px)',
            lineHeight: 1.25,
            margin: 0,
            letterSpacing: '-0.3px',
            textShadow: '0 1px 6px rgba(0,0,0,0.3)',
          }}
        >
          {property.title}
        </h3>

        {/* Address */}
        <p
          style={{
            color: 'rgba(255,255,255,0.72)',
            fontSize: 'clamp(12px, 2.2vw, 14px)',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {property.address}
        </p>

        {/* Stats pills */}
        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
          {[
            { Icon: BedDouble, label: `${property.bedrooms} bed` },
            { Icon: Bath,      label: `${property.bathrooms} bath` },
            { Icon: Maximize2, label: `${property.floorAreaSqft.toLocaleString()} sqft` },
          ].map(({ Icon, label }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '100px',
                padding: '5px 11px',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <Icon
                style={{
                  width: 'clamp(11px, 2vw, 13px)',
                  height: 'clamp(11px, 2vw, 13px)',
                  color: 'rgba(255,255,255,0.85)',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 'clamp(11px, 1.8vw, 13px)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Tap hint */}
        <p
          style={{
            fontSize: 'clamp(10px, 1.6vw, 12px)',
            color: 'rgba(255,255,255,0.38)',
            margin: 0,
            letterSpacing: '0.2px',
          }}
        >
          Tap bottom to view details
        </p>
      </div>
    </div>
  );
}

// ── BackCard (simplified, behind front card) ───────────────────────────────

function BackCard({ property, searchMode }: { property: Property; searchMode: SearchMode }) {
  const photos = getPhotos(property);
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: 'clamp(16px, 3vw, 24px)',
        overflow: 'hidden',
        background: '#111',
      }}
    >
      <img
        src={photos[0]}
        alt={property.title}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      {/* Bottom gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)',
        }}
      />
      {/* Price + title */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 'clamp(16px, 4vw, 22px)',
        }}
      >
        <p
          style={{
            fontWeight: 800,
            color: '#FFFFFF',
            fontSize: 'clamp(20px, 4.5vw, 28px)',
            margin: '0 0 4px',
            letterSpacing: '-0.4px',
            lineHeight: 1,
          }}
        >
          {priceFor(searchMode, property)}
        </p>
        <p
          style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: 'clamp(12px, 2.2vw, 15px)',
            fontWeight: 600,
            margin: 0,
            letterSpacing: '-0.2px',
          }}
        >
          {property.title}
        </p>
      </div>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────

function EmptyState({ onUpdateFilters }: { onUpdateFilters: () => void }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(16px, 4vw, 32px)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#EEEDFE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        <Heart style={{ width: '28px', height: '28px', color: '#B4B2A9' }} />
      </div>
      <h2
        style={{
          fontSize: 'clamp(18px, 4vw, 22px)',
          fontWeight: 600,
          color: '#0F0C2E',
          margin: '0 0 8px',
          letterSpacing: '-0.3px',
        }}
      >
        You&rsquo;re all caught up!
      </h2>
      <p
        style={{
          fontSize: 'clamp(13px, 2.2vw, 15px)',
          color: '#5F5E5A',
          margin: '0 0 24px',
          lineHeight: 1.5,
        }}
      >
        Adjust your filters to discover more properties.
      </p>
      <button
        onClick={onUpdateFilters}
        style={{
          background: '#3C3489',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '12px',
          padding: '12px 24px',
          fontSize: 'clamp(13px, 2.2vw, 15px)',
          fontWeight: 600,
          cursor: 'pointer',
          minHeight: '44px',
        }}
      >
        Update filters
      </button>
    </div>
  );
}

// ── SparkScreen ───────────────────────────────────────────────────────────

export interface SparkScreenProps {
  properties: Property[];
  searchMode: SearchMode;
  onPropertySelect: (property: Property) => void;
  /** Called silently on swipe-right — parent should NOT navigate to chat. */
  onInterestedInProperty: (property: Property) => void;
  /** Called when the user taps "View" on the post-swipe toast. */
  onViewChat: (property: Property) => void;
  /** Whether the current user is a guest — swipe-right opens the sign-up sheet. */
  isGuest?: boolean;
  /** Called when a guest swipes right — parent should open the sign-up prompt. */
  onGuestPrompt?: () => void;
}

const SWIPE_THRESHOLD = 80;
/** Tap = pointerup within this many px of pointerdown AND under TAP_TIME_MS */
const TAP_DISTANCE = 10;
const TAP_TIME_MS = 200;
/** Proportion of full-height card where tap = photo cycle vs tap = open detail.
 *  With the new full-bleed card, the bottom ~28% shows text — tap there = open detail. */
const IMAGE_AREA_RATIO = 0.72;

export function SparkScreen({
  properties,
  searchMode,
  onPropertySelect,
  onInterestedInProperty,
  onViewChat,
  isGuest = false,
  onGuestPrompt,
}: SparkScreenProps) {
  const session = getSparkSession(properties);
  const agent = agentById(DEFAULT_AGENT_ID);
  const agentFirstName = agent?.fullName.split(' ')[0] ?? 'your Star Homes agent';

  const [filters, setFilters] = useState<PropertyFilters>(session.filters);
  const [currentIdx, setCurrentIdx] = useState(session.currentIdx);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  // ── Drag state ──────────────────────────────────────────────────────────
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const currentDragRef = useRef(0);   // live drag value (ref avoids stale closure)
  const cardRef = useRef<HTMLDivElement>(null);
  const exitingRef = useRef(false);

  // ── Post-swipe state ────────────────────────────────────────────────────
  const [celebrationProperty, setCelebrationProperty] = useState<Property | null>(null);
  const [toastProperty, setToastProperty] = useState<Property | null>(null);
  const [showToast, setShowToast] = useState(false);

  const filteredStack = useMemo(
    () => applyFilters(session.shuffled, filters, searchMode),
    [session.shuffled, filters, searchMode],
  );

  // ── Helpers ─────────────────────────────────────────────────────────────

  const advance = (nextIdx: number) => {
    patchSparkSession({ currentIdx: nextIdx });
    setCurrentIdx(nextIdx);
    setDragX(0);
    currentDragRef.current = 0;
    setIsDragging(false);
    setPhotoIndex(0);
    exitingRef.current = false;
  };

  const triggerSwipeRight = () => {
    if (exitingRef.current) return;

    // Guests see the sign-up sheet instead of the celebration flow
    if (isGuest) {
      onGuestPrompt?.();
      return;
    }

    exitingRef.current = true;
    setIsDragging(false);
    setDragX(700);
    const property = filteredStack[currentIdx];
    // Notify parent silently — parent must NOT navigate to chat
    onInterestedInProperty(property);
    window.setTimeout(() => {
      setCelebrationProperty(property);
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

  const handleCelebrationDismiss = () => {
    const prop = celebrationProperty;
    setCelebrationProperty(null);
    if (prop) {
      setToastProperty(prop);
      setShowToast(true);
    }
  };

  // ── Pointer event handlers ───────────────────────────────────────────────

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (exitingRef.current) return;
    setIsDragging(true);
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startTimeRef.current = Date.now();
    currentDragRef.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || exitingRef.current) return;
    const dx = e.clientX - startXRef.current;
    currentDragRef.current = dx;
    setDragX(dx);
  };

  const handlePointerUp = () => {
    if (!isDragging || exitingRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    const dx = currentDragRef.current;
    const isTap = Math.abs(dx) < TAP_DISTANCE && elapsed < TAP_TIME_MS;

    setIsDragging(false);

    if (isTap) {
      setDragX(0);
      currentDragRef.current = 0;
      const card = cardRef.current;
      if (card) {
        const rect = card.getBoundingClientRect();
        const relY = (startYRef.current - rect.top) / rect.height;
        const relX = (startXRef.current - rect.left) / rect.width;
        const photos = getPhotos(filteredStack[currentIdx]);

        if (relY < IMAGE_AREA_RATIO && photos.length > 1) {
          // Cycle photos: left half = previous, right half = next
          setPhotoIndex((prev) =>
            relX < 0.5
              ? (prev - 1 + photos.length) % photos.length
              : (prev + 1) % photos.length,
          );
        } else if (relY >= IMAGE_AREA_RATIO) {
          // Tap in content area → open full detail
          onPropertySelect(filteredStack[currentIdx]);
        }
      }
      return;
    }

    if (dx > SWIPE_THRESHOLD) {
      triggerSwipeRight();
    } else if (dx < -SWIPE_THRESHOLD) {
      triggerSwipeLeft();
    } else {
      // Snap back
      setDragX(0);
      currentDragRef.current = 0;
    }
  };

  // ── Derived values ───────────────────────────────────────────────────────

  const hasActiveFilters = isFilterActive(filters);
  const exhausted = currentIdx >= filteredStack.length;
  const topCard = exhausted ? null : filteredStack[currentIdx];
  const backCard =
    !exhausted && currentIdx + 1 < filteredStack.length
      ? filteredStack[currentIdx + 1]
      : null;

  const topPhotos = topCard ? getPhotos(topCard) : [];
  const backProgress = Math.min(1, Math.abs(dragX) / SWIPE_THRESHOLD);
  const backScale = 0.94 + backProgress * 0.06;       // 0.94 → 1.0
  const backOpacity = 0.7 + backProgress * 0.3;       // 0.70 → 1.0
  const backTranslateY = 10 * (1 - backProgress);     // 10px → 0px

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#F7F6FB',
        overflowX: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background: '#FFFFFF',
          borderBottom: '0.5px solid rgba(0,0,0,0.08)',
          padding:
            'max(env(safe-area-inset-top), clamp(12px, 3vw, 16px)) clamp(14px, 4vw, 20px) clamp(10px, 2.5vw, 14px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          {/* Star Homes brand lockup */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
            <div
              style={{
                background: '#3C3489',
                borderRadius: '6px',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Home style={{ width: '13px', height: '13px', color: '#fff', strokeWidth: 2 }} />
            </div>
            <span
              style={{
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                fontWeight: 600,
                color: '#0F0C2E',
                letterSpacing: '-0.2px',
                lineHeight: 1,
              }}
            >
              Star Homes
            </span>
          </div>
          <h1
            style={{
              fontSize: 'clamp(17px, 3.5vw, 22px)',
              fontWeight: 600,
              color: '#0F0C2E',
              margin: 0,
              letterSpacing: '-0.3px',
            }}
          >
            Spark
          </h1>
          <p
            style={{
              fontSize: 'clamp(11px, 1.8vw, 13px)',
              color: '#B4B2A9',
              margin: '2px 0 0',
            }}
          >
            Swipe to find your next home
          </p>
        </div>
        <button
          onClick={() => setFilterOpen(true)}
          aria-label="Open filters"
          style={{
            position: 'relative',
            width: 'clamp(36px, 8vw, 44px)',
            height: 'clamp(36px, 8vw, 44px)',
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: '#F7F6FB',
            border: 'none',
            cursor: 'pointer',
            color: '#0F0C2E',
          }}
        >
          <SlidersHorizontal style={{ width: '18px', height: '18px' }} />
          {hasActiveFilters && (
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#E5917A',
                border: '1.5px solid #0F0C2E',
              }}
            />
          )}
        </button>
      </div>

      {/* ── Body ── */}
      {exhausted ? (
        <EmptyState onUpdateFilters={() => setFilterOpen(true)} />
      ) : (
        <>
          {/* ── Card stack ── */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'clamp(8px, 2vw, 16px) clamp(10px, 3vw, 20px) clamp(4px, 1vw, 8px)',
              minHeight: 0,
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '480px',
                height: 'clamp(360px, 70vh, 540px)',
                margin: '0 auto',
              }}
            >
              {/* Back card */}
              {backCard && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    transform: `scale(${backScale}) translateY(${backTranslateY}px)`,
                    transformOrigin: 'bottom center',
                    opacity: backOpacity,
                    zIndex: 1,
                    transition: isDragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
                  }}
                >
                  <BackCard property={backCard} searchMode={searchMode} />
                </div>
              )}

              {/* Front card (draggable) */}
              {topCard && (
                <div
                  ref={cardRef}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
                    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(.23,1,.32,1)',
                    zIndex: 2,
                    touchAction: 'none',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    borderRadius: 'clamp(12px, 2vw, 20px)',
                    willChange: 'transform',
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  {/* "Interested" stamp */}
                  {dragX > 20 && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        padding: 'clamp(12px, 3vw, 20px)',
                        pointerEvents: 'none',
                        opacity: Math.min(1, (dragX - 20) / 80),
                        borderRadius: 'clamp(12px, 2vw, 20px)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          border: '3px solid #1D9E75',
                          borderRadius: '10px',
                          padding: '4px 10px',
                          transform: 'rotate(-12deg)',
                        }}
                      >
                        <span
                          style={{
                            color: '#1D9E75',
                            fontWeight: 700,
                            fontSize: 'clamp(16px, 3.5vw, 22px)',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Interested
                        </span>
                      </div>
                    </div>
                  )}

                  {/* "Pass" stamp */}
                  {dragX < -20 && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-end',
                        padding: 'clamp(12px, 3vw, 20px)',
                        pointerEvents: 'none',
                        opacity: Math.min(1, (-dragX - 20) / 80),
                        borderRadius: 'clamp(12px, 2vw, 20px)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          border: '3px solid #B4B2A9',
                          borderRadius: '10px',
                          padding: '4px 10px',
                          transform: 'rotate(12deg)',
                        }}
                      >
                        <span
                          style={{
                            color: '#B4B2A9',
                            fontWeight: 700,
                            fontSize: 'clamp(16px, 3.5vw, 22px)',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Pass
                        </span>
                      </div>
                    </div>
                  )}

                  <SparkCard
                    property={topCard}
                    searchMode={searchMode}
                    photos={topPhotos}
                    photoIndex={photoIndex}
                    agentInitials={agent?.initials ?? 'SC'}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'clamp(20px, 5vw, 40px)',
              padding: 'clamp(10px, 2.5vw, 16px) 0 clamp(12px, 3vw, 20px)',
              flexShrink: 0,
            }}
          >
            {/* Pass button */}
            <button
              onClick={triggerSwipeLeft}
              aria-label="Pass — skip this property"
              className="hover:scale-105 active:scale-95 transition-transform"
              style={{
                width: 'clamp(48px, 10vw, 64px)',
                height: 'clamp(48px, 10vw, 64px)',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
            >
              <X
                style={{
                  width: 'clamp(18px, 3.5vw, 26px)',
                  height: 'clamp(18px, 3.5vw, 26px)',
                  color: '#B4B2A9',
                }}
              />
            </button>

            {/* Interested button */}
            <button
              onClick={triggerSwipeRight}
              aria-label="Interested — contact the agent"
              className="hover:scale-105 active:scale-95 transition-transform"
              style={{
                width: 'clamp(48px, 10vw, 64px)',
                height: 'clamp(48px, 10vw, 64px)',
                borderRadius: '50%',
                background: '#0F0C2E',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 4px 20px rgba(15,12,46,0.35)',
              }}
            >
              <Heart
                style={{
                  width: 'clamp(18px, 3.5vw, 26px)',
                  height: 'clamp(18px, 3.5vw, 26px)',
                  color: '#E5917A',
                  fill: '#E5917A',
                }}
              />
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
          setPhotoIndex(0);
          patchSparkSession({ filters: next, currentIdx: 0 });
          setFilterOpen(false);
        }}
        onClear={() => {
          setFilters(DEFAULT_FILTERS);
          setCurrentIdx(0);
          setPhotoIndex(0);
          patchSparkSession({ filters: DEFAULT_FILTERS, currentIdx: 0 });
        }}
        onClose={() => setFilterOpen(false)}
      />

      {/* ── Celebration overlay ── */}
      {celebrationProperty && (
        <CelebrationScreen
          property={celebrationProperty}
          agentFirstName={agentFirstName}
          searchMode={searchMode}
          onDismiss={handleCelebrationDismiss}
        />
      )}

      {/* ── Post-swipe toast ── */}
      {showToast && toastProperty && (
        <SparkToast
          onView={() => {
            setShowToast(false);
            onViewChat(toastProperty);
          }}
          onDismiss={() => {
            setShowToast(false);
            setToastProperty(null);
          }}
        />
      )}
    </div>
  );
}
