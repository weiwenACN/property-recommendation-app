import { Bed, Bath, MapPin, Train, Heart, Bookmark, Check, Footprints } from 'lucide-react';
import type { Property } from '../../data/properties';
import { priceFor, type SearchMode } from '../../data/pricing';
import { categoryIconFor } from '../../data/categories';
import { preferenceOptionById } from '../../data/preferences';
import { galleryFor } from '../../data/gallery';
import { estimateCommute } from '../../data/commute';
import type { Workplace } from '../../data/workplaceStore';
import { PropertyCardCarousel } from './PropertyCardCarousel';

export type PropertyCardVariant = 'default' | 'compact';

export interface PropertyCardProps {
  property: Property;
  searchMode: SearchMode;
  onSelect: (property: Property) => void;
  variant?: PropertyCardVariant;
  eager?: boolean;

  // Bookmark slot (Feature 5).
  isBookmarked?: boolean;
  onBookmarkToggle?: (property: Property) => void;

  // Multi-select slot (Feature 4).
  showSelectionToggle?: boolean;
  isSelected?: boolean;
  onSelectionToggle?: (property: Property) => void;

  // Commute slot (Feature 2/3/5). Pass the user's saved workplace so the card
  // can render a tag; omit to hide.
  workplace?: Workplace | null;

  // Recently Viewed timestamp slot (Feature 3).
  viewedAtLabel?: string;
}

function stopCardClick(e: React.SyntheticEvent) {
  e.stopPropagation();
}

export function PropertyCard({
  property,
  searchMode,
  onSelect,
  variant = 'default',
  eager = false,
  isBookmarked,
  onBookmarkToggle,
  showSelectionToggle = false,
  isSelected = false,
  onSelectionToggle,
  workplace = null,
  viewedAtLabel,
}: PropertyCardProps) {
  const CategoryIcon = categoryIconFor(property.propertyType);
  const images = galleryFor(property);
  const commute = estimateCommute(workplace, property);

  const handleCardClick = () => onSelect(property);

  const handleBookmark = (e: React.SyntheticEvent) => {
    stopCardClick(e);
    onBookmarkToggle?.(property);
  };

  const handleSelection = (e: React.SyntheticEvent) => {
    stopCardClick(e);
    onSelectionToggle?.(property);
  };

  return (
    <article
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`${property.title}, ${property.address}, ${priceFor(searchMode, property)}`}
      className={`group relative bg-white rounded-2xl overflow-hidden border border-[#e5e7eb] hover:shadow-lg transition-all cursor-pointer text-left ${
        isSelected ? 'ring-2 ring-[#3C3489]' : ''
      }`}
    >
      <div className="relative">
        <PropertyCardCarousel images={images} alt={property.title} eager={eager} />

        {/* Category pill (top-left, low on the image to leave room for select) */}
        <div className="absolute bottom-2 left-2 bg-white/95 px-2.5 py-1 rounded-full text-[11px] font-medium text-[#0F0C2E] flex items-center gap-1 shadow-sm">
          <CategoryIcon className="w-3 h-3" />
          {property.propertyType}
        </div>

        {/* Multi-select checkbox (top-left). Hidden by default. */}
        {showSelectionToggle && (
          <button
            type="button"
            onClick={handleSelection}
            onKeyDown={stopCardClick}
            aria-pressed={isSelected}
            aria-label={isSelected ? 'Deselect for comparison' : 'Select for comparison'}
            className={`absolute top-2 left-2 w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-[#3C3489] text-white'
                : 'bg-white/95 text-[#0F0C2E] hover:bg-white'
            }`}
          >
            {isSelected ? <Check className="w-5 h-5" strokeWidth={3} /> : <span className="w-4 h-4 rounded-full border-2 border-[#0F0C2E]" />}
          </button>
        )}

        {/* Bookmark heart (top-right) with a soft scrim so the icon stays
            legible against any photo. */}
        {onBookmarkToggle && (
          <>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-black/25 to-transparent pointer-events-none rounded-tr-2xl" />
            <button
              type="button"
              onClick={handleBookmark}
              onKeyDown={stopCardClick}
              aria-pressed={isBookmarked}
              aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
              className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/95 shadow-md flex items-center justify-center text-[#0F0C2E] hover:bg-white transition-colors min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px]"
            >
              <Heart
                className={`w-5 h-5 transition-transform ${
                  isBookmarked ? 'text-[#E5917A] fill-[#E5917A] scale-110' : 'text-[#0F0C2E]'
                }`}
              />
            </button>
          </>
        )}
      </div>

      {/* Body */}
      {variant === 'compact' ? (
        <div className="p-3">
          <p className="font-semibold text-[#0F0C2E] text-sm mb-1 truncate">{property.title}</p>
          <p className="text-xs text-gray-600 truncate mb-2">{property.address}</p>
          <div className="flex items-center justify-between">
            <p className="font-semibold text-[#3C3489] text-sm">{priceFor(searchMode, property)}</p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Bed className="w-3 h-3" />
              <span>{property.bedrooms}</span>
            </div>
          </div>
          {commute && (
            <p className="mt-1.5 text-[11px] text-[#0F0C2E] flex items-center gap-1">
              {commute.mode === 'walk' ? <Footprints className="w-3 h-3" /> : <Train className="w-3 h-3" />}
              ≈{commute.minutes} min to {workplace?.name}
            </p>
          )}
        </div>
      ) : (
        <div className="p-4">
          {viewedAtLabel && (
            <p className="mb-1 text-[11px] text-gray-500">{viewedAtLabel}</p>
          )}
          <div className="flex items-start justify-between mb-1">
            <div className="text-left flex-1 min-w-0">
              <h3 className="font-semibold text-[#0F0C2E] text-lg leading-tight truncate">
                {property.title}
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{property.address}</span>
              </div>
            </div>
            <div className="text-right ml-3 shrink-0">
              <p className="font-semibold text-[#0F0C2E] text-xl whitespace-nowrap">
                {priceFor(searchMode, property)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2 mb-1">
            <span className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              {property.bedrooms} bed
            </span>
            <span className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              {property.bathrooms} bath
            </span>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Train className="w-4 h-4" />
            <span>{property.distanceToTube}</span>
          </div>

          {commute && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0F0C2E] text-white text-[11px] font-medium">
              {commute.mode === 'walk' ? <Footprints className="w-3 h-3" /> : <Train className="w-3 h-3" />}
              ≈{commute.minutes} min to {workplace?.name}
            </div>
          )}

          {property.preferenceTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#f1f3f5]">
              {property.preferenceTags.map((id) => {
                const opt = preferenceOptionById(id);
                if (!opt) return null;
                const Icon = opt.icon;
                return (
                  <span
                    key={id}
                    title={opt.label}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EEEDFE] text-[#3C3489] text-[11px] font-medium"
                  >
                    <Icon className="w-3 h-3" />
                    {opt.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

// Re-export bookmark icon as a convenience alias so consumers can import everything from one file.
export { Bookmark };
