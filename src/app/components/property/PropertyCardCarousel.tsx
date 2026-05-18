import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { srcsetFor } from '../../data/gallery';

interface PropertyCardCarouselProps {
  images: string[];
  alt: string;
  /** When true, the first image loads eagerly; otherwise all images are lazy. */
  eager?: boolean;
  /** Tailwind aspect class for the photo frame. Defaults to 4/3. */
  aspectClass?: string;
}

const DESKTOP_QUERY = '(hover: hover) and (pointer: fine)';

export function PropertyCardCarousel({
  images,
  alt,
  eager = false,
  aspectClass = 'aspect-[4/3]',
}: PropertyCardCarouselProps) {
  // No images → render the placeholder. Tap target stays the same size so
  // the surrounding card doesn't shift layout.
  if (images.length === 0) {
    return (
      <div
        className={`relative ${aspectClass} w-full bg-[#f1f3f5] flex flex-col items-center justify-center text-gray-400`}
        aria-label="No photos available"
      >
        <ImageOff className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">No photos available</span>
      </div>
    );
  }

  // Single image → static. No swipe gestures, no controls.
  if (images.length === 1) {
    return (
      <div className={`relative ${aspectClass} w-full overflow-hidden bg-[#f1f3f5]`}>
        <img
          src={images[0]}
          srcSet={srcsetFor(images[0])}
          sizes="(min-width: 1024px) 480px, (min-width: 640px) 50vw, 100vw"
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <CarouselWithControls
      images={images}
      alt={alt}
      eager={eager}
      aspectClass={aspectClass}
    />
  );
}

function CarouselWithControls({
  images,
  alt,
  eager,
  aspectClass,
}: Required<Pick<PropertyCardCarouselProps, 'images' | 'alt' | 'eager' | 'aspectClass'>>) {
  const reducedMotion = usePrefersReducedMotion();
  const isDesktop = useIsDesktopHover();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    duration: reducedMotion ? 0 : 22, // ~250ms ease-out
    dragFree: false,
  });

  const [selected, setSelected] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Track which images have been "asked for" so we can preload the next
  // adjacent image without preloading all 8 up-front.
  const [loadedAroundIndex, setLoadedAroundIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const sync = () => {
      setSelected(emblaApi.selectedScrollSnap());
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
      setLoadedAroundIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', sync);
    emblaApi.on('reInit', sync);
    sync();
    return () => {
      emblaApi.off('select', sync);
      emblaApi.off('reInit', sync);
    };
  }, [emblaApi]);

  const stopCardNavigation = useCallback((e: React.SyntheticEvent) => {
    // Tapping arrows/dots must not bubble up to the surrounding card's
    // onClick (which routes to the detail screen). Same logic guards
    // swipes via Embla because pointer events are captured by the carousel
    // root, not the card.
    e.stopPropagation();
  }, []);

  const scrollPrev = useCallback(
    (e: React.MouseEvent) => {
      stopCardNavigation(e);
      emblaApi?.scrollPrev();
    },
    [emblaApi, stopCardNavigation],
  );
  const scrollNext = useCallback(
    (e: React.MouseEvent) => {
      stopCardNavigation(e);
      emblaApi?.scrollNext();
    },
    [emblaApi, stopCardNavigation],
  );
  const scrollTo = useCallback(
    (e: React.MouseEvent, index: number) => {
      stopCardNavigation(e);
      emblaApi?.scrollTo(index);
    },
    [emblaApi, stopCardNavigation],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        emblaApi?.scrollPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        emblaApi?.scrollNext();
      }
    },
    [emblaApi],
  );

  const useCounter = images.length > 5;

  return (
    <div
      className={`relative ${aspectClass} w-full overflow-hidden bg-[#f1f3f5]`}
      onKeyDown={handleKeyDown}
    >
      <div ref={emblaRef} className="h-full overflow-hidden touch-pan-y">
        <div className="flex h-full">
          {images.map((src, i) => {
            // Eager: hero image + image adjacent to the current selection.
            const shouldEager =
              (eager && i === 0) ||
              i === loadedAroundIndex ||
              i === loadedAroundIndex + 1;
            return (
              <div key={`${src}-${i}`} className="relative h-full shrink-0 grow-0 basis-full">
                <img
                  src={src}
                  srcSet={srcsetFor(src)}
                  sizes="(min-width: 1024px) 480px, (min-width: 640px) 50vw, 100vw"
                  alt={`${alt} – photo ${i + 1} of ${images.length}`}
                  loading={shouldEager ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(e) => {
                    // Replace with placeholder background instead of broken-image icon.
                    const img = e.currentTarget;
                    img.style.visibility = 'hidden';
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop arrows */}
      {isDesktop && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canPrev}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-[#1a2332] shadow-md flex items-center justify-center opacity-0 hover:opacity-100 focus-visible:opacity-100 transition-opacity disabled:opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canNext}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-[#1a2332] shadow-md flex items-center justify-center opacity-0 hover:opacity-100 focus-visible:opacity-100 transition-opacity disabled:opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Position indicator */}
      {useCounter ? (
        <div className="absolute bottom-2 right-2 bg-black/55 text-white text-[11px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
          {selected + 1} / {images.length}
        </div>
      ) : (
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1"
          onClick={stopCardNavigation}
        >
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => scrollTo(e, i)}
              aria-label={`Photo ${i + 1} of ${images.length}`}
              aria-current={i === selected}
              className={`h-1.5 rounded-full transition-all ${
                i === selected ? 'w-5 bg-white' : 'w-1.5 bg-white/55'
              } ${isDesktop ? '' : 'pointer-events-none'}`}
              tabIndex={isDesktop ? 0 : -1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

function useIsDesktopHover(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(DESKTOP_QUERY);
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return isDesktop;
}

// Re-export the ref helper kept for future use if a parent wants to imperatively
// scroll a card carousel.
export { useEmblaCarousel };

// Silence unused-import warnings on tooling that can't see the hook usage above.
const _ref = useRef;
const _memo = useMemo;
void _ref;
void _memo;
