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

  isBookmarked?: boolean;
  onBookmarkToggle?: (property: Property) => void;

  showSelectionToggle?: boolean;
  isSelected?: boolean;
  onSelectionToggle?: (property: Property) => void;

  workplace?: Workplace | null;
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
      className={`group relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl active:scale-[0.98] transition-all duration-200 cursor-pointer text-left select-none ${
        isSelected ? 'ring-2 ring-[#3C3489] shadow-[#3C3489]/20' : ''
      }`}
    >
      {/* ── Photo section ── */}
      <div className="relative">
        <PropertyCardCarousel images={images} alt={property.title} eager={eager} />

        {/* Category pill */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#0F0C2E] flex items-center gap-1 shadow-sm">
          <CategoryIcon className="w-3 h-3" />
          {property.propertyType}
        </div>

        {/* Multi-select checkbox */}
        {showSelectionToggle && (
          <button
            type="button"
            onClick={handleSelection}
            onKeyDown={stopCardClick}
            aria-pressed={isSelected}
            aria-label={isSelected ? 'Deselect for comparison' : 'Select for comparison'}
            className={`absolute top-3 left-3 w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-all active:scale-90 ${
              isSelected
                ? 'bg-[#3C3489] text-white'
                : 'bg-white/95 text-[#0F0C2E] hover:bg-white'
            }`}
          >
            {isSelected ? <Check className="w-5 h-5" strokeWidth={3} /> : <span className="w-4 h-4 rounded-full border-2 border-[#0F0C2E]" />}
          </button>
        )}

        {/* Bookmark heart */}
        {onBookmarkToggle && (
          <>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-black/30 to-transparent pointer-events-none rounded-tr-3xl" />
            <button
              type="button"
              onClick={handleBookmark}
              onKeyDown={stopCardClick}
              aria-pressed={isBookmarked}
              aria-label={isBookmarked ? 'Remove from saved' : 'Save property'}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm shadow-md flex items-center justify-center text-[#0F0C2E] hover:bg-white active:scale-90 transition-all min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px]"
            >
              <Heart
                className={`w-5 h-5 transition-all duration-200 ${
                  isBookmarked ? 'text-[#E5917A] fill-[#E5917A] scale-110' : 'text-[#0F0C2E]'
                }`}
              />
            </button>
          </>
        )}
      </div>

      {/* ── Card body ── */}
      {variant === 'compact' ? (
        <div className="p-3">
          <p className="font-bold text-[#0F0C2E] text-sm mb-0.5 truncate tracking-tight">{property.title}</p>
          <p className="text-xs text-gray-500 truncate mb-2">{property.address}</p>
          <div className="flex items-center justify-between">
            <p className="font-extrabold text-[#0F0C2E] text-base tracking-tight">{priceFor(searchMode, property)}</p>
            <div className="flex items-center gap-1 bg-[#F7F6FB] px-2 py-0.5 rounded-full text-xs font-semibold text-[#0F0C2E]">
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
            <p className="mb-1.5 text-[11px] text-gray-400 font-medium">{viewedAtLabel}</p>
          )}

          {/* Title + price */}
          <div className="flex items-start justify-between mb-1 gap-2">
            <h3 className="font-bold tracking-tight text-[#0F0C2E] text-lg leading-tight flex-1 min-w-0 truncate">
              {property.title}
            </h3>
            <p className="font-extrabold text-[#0F0C2E] text-xl whitespace-nowrap tracking-tight flex-shrink-0">
              {priceFor(searchMode, property)}
            </p>
          </div>

          {/* Address */}
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{property.address}</span>
          </div>

          {/* Stats pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 bg-[#F7F6FB] px-2.5 py-1 rounded-full text-xs font-semibold text-[#0F0C2E]">
              <Bed className="w-3.5 h-3.5 text-gray-400" />
              {property.bedrooms} bed
            </span>
            <span className="flex items-center gap-1.5 bg-[#F7F6FB] px-2.5 py-1 rounded-full text-xs font-semibold text-[#0F0C2E]">
              <Bath className="w-3.5 h-3.5 text-gray-400" />
              {property.bathrooms} bath
            </span>
            <span className="flex items-center gap-1.5 bg-[#F7F6FB] px-2.5 py-1 rounded-full text-xs font-semibold text-[#0F0C2E]">
              <Train className="w-3.5 h-3.5 text-gray-400" />
              {property.distanceToTube}
            </span>

            {commute && (
              <span className="flex items-center gap-1.5 bg-[#0F0C2E] px-2.5 py-1 rounded-full text-xs font-semibold text-white">
                {commute.mode === 'walk' ? <Footprints className="w-3.5 h-3.5" /> : <Train className="w-3.5 h-3.5" />}
                ≈{commute.minutes} min
              </span>
            )}
          </div>

          {/* Preference tags */}
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
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EEEDFE] text-[#3C3489] text-[11px] font-semibold"
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

export { Bookmark };
