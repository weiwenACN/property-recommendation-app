import type { Property } from './properties';

// Per-propertyType "supporting" photos. The first slot is always the
// property's own imageUrl; the rest come from this catalogue so we don't
// have to author 4-5 unique URLs per mock property. Easy to replace with
// real photo arrays once a backend feeds them.

const SUPPORTING_PHOTOS: Record<string, string[]> = {
  Apartment: [
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800',
    'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
  ],
  Studio: [
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
  ],
  Penthouse: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
  ],
  House: [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800',
  ],
  Loft: [
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800',
  ],
};

const FALLBACK = [
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
];

export function galleryFor(property: Property): string[] {
  const extras = SUPPORTING_PHOTOS[property.propertyType] ?? FALLBACK;
  return [property.imageUrl, ...extras];
}

// Unsplash supports query-string resizing, so we can synthesise a srcset
// from a single base URL. Strips any existing `w=` param so we don't end
// up with duplicates.
const WIDTHS = [400, 640, 960];

function stripWidth(url: string): string {
  return url.replace(/[?&]w=\d+/g, '').replace(/\?$/, '');
}

export function srcsetFor(url: string): string {
  if (!url) return '';
  const base = stripWidth(url);
  const sep = base.includes('?') ? '&' : '?';
  return WIDTHS.map((w) => `${base}${sep}w=${w} ${w}w`).join(', ');
}
