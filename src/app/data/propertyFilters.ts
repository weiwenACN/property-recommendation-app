import type { Property } from './properties';
import type { SearchMode } from './pricing';

export type BedroomsFilter = 'any' | '1' | '2' | '3' | '4+';
export type PropertyTypeFilter = 'any' | 'flat' | 'house';

export interface PropertyFilters {
  bedrooms: BedroomsFilter;
  minPrice: number | null;
  maxPrice: number | null;
  propertyType: PropertyTypeFilter;
}

export const DEFAULT_FILTERS: PropertyFilters = {
  bedrooms: 'any',
  minPrice: null,
  maxPrice: null,
  propertyType: 'any',
};

// Anything that isn't a House is considered a "flat" for filter purposes
// (Apartment, Studio, Penthouse, Loft).
function isFlat(propertyType: string): boolean {
  return propertyType !== 'House';
}

function bedroomMatches(property: Property, filter: BedroomsFilter): boolean {
  switch (filter) {
    case 'any':
      return true;
    case '4+':
      return property.bedrooms >= 4;
    default:
      return property.bedrooms === Number(filter);
  }
}

function typeMatches(property: Property, filter: PropertyTypeFilter): boolean {
  if (filter === 'any') return true;
  if (filter === 'flat') return isFlat(property.propertyType);
  return property.propertyType === 'House';
}

function priceMatches(property: Property, filters: PropertyFilters, mode: SearchMode): boolean {
  const price = mode === 'rent' ? property.rentPrice : property.salePrice;
  if (filters.minPrice !== null && price < filters.minPrice) return false;
  if (filters.maxPrice !== null && price > filters.maxPrice) return false;
  return true;
}

export function applyFilters(
  properties: Property[],
  filters: PropertyFilters,
  mode: SearchMode,
): Property[] {
  return properties.filter(
    (p) =>
      bedroomMatches(p, filters.bedrooms) &&
      typeMatches(p, filters.propertyType) &&
      priceMatches(p, filters, mode),
  );
}

export function isFilterActive(filters: PropertyFilters): boolean {
  return (
    filters.bedrooms !== 'any' ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.propertyType !== 'any'
  );
}

export function activeFilterCount(filters: PropertyFilters): number {
  let count = 0;
  if (filters.bedrooms !== 'any') count++;
  if (filters.minPrice !== null || filters.maxPrice !== null) count++;
  if (filters.propertyType !== 'any') count++;
  return count;
}
