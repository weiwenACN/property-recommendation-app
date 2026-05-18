import type { Property } from './properties';
import { featuresFor } from './propertyFeatures';

export interface DetailRow {
  label: string;
  value: string;
}

function epcFromYear(yearBuilt: number): string {
  if (yearBuilt >= 2015) return 'B';
  if (yearBuilt >= 2000) return 'C';
  if (yearBuilt >= 1980) return 'D';
  return 'E';
}

function leaseFor(propertyType: string): string {
  return propertyType === 'House' ? 'Freehold' : 'Leasehold (125 years remaining)';
}

function furnishedFor(propertyType: string): string {
  if (propertyType === 'Studio') return 'Furnished';
  if (propertyType === 'Penthouse') return 'Furnished';
  return 'Part-furnished';
}

export function detailRowsFor(property: Property): DetailRow[] {
  const features = featuresFor(property.propertyType);
  return [
    { label: 'Property type', value: property.propertyType },
    { label: 'Bedrooms', value: `${property.bedrooms}` },
    { label: 'Bathrooms', value: `${property.bathrooms}` },
    { label: 'Floor area', value: `${property.floorAreaSqft} sq ft` },
    { label: 'Year built', value: `${property.yearBuilt}` },
    { label: 'Furnished', value: furnishedFor(property.propertyType) },
    { label: 'Parking', value: features.parking },
    { label: 'EPC rating', value: epcFromYear(property.yearBuilt) },
    { label: 'Lease type', value: leaseFor(property.propertyType) },
    { label: 'Available from', value: 'Immediately' },
  ];
}
