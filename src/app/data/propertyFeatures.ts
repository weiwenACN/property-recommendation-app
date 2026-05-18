// Per-propertyType feature catalogue. Keeps per-property data lean while
// still giving the detail screen something realistic to render under each
// Features subsection. Swap to per-property data when the backend lands.

export interface PropertyFeatures {
  interior: string[];
  exterior: string[];
  amenities: string[];
  parking: string;
}

const DEFAULT_FEATURES: PropertyFeatures = {
  interior: ['Open-plan living', 'Engineered wood flooring', 'Double glazing'],
  exterior: ['Communal entrance'],
  amenities: ['Bike storage'],
  parking: 'On-street permit parking',
};

const CATALOGUE: Record<string, PropertyFeatures> = {
  Apartment: {
    interior: [
      'Open-plan kitchen-living',
      'Integrated appliances',
      'Engineered wood flooring',
      'Double glazing',
      'Built-in wardrobes',
    ],
    exterior: ['Private balcony', 'Communal courtyard'],
    amenities: ['Lift access', 'Concierge', 'Bike storage', 'Secure entry'],
    parking: 'Secure underground parking (extra)',
  },
  Studio: {
    interior: [
      'Cleverly zoned living and sleeping areas',
      'Integrated kitchen',
      'Engineered wood flooring',
      'Fitted wardrobes',
    ],
    exterior: ['Communal courtyard'],
    amenities: ['Lift access', 'Bike storage', 'Secure entry'],
    parking: 'On-street permit parking',
  },
  Penthouse: {
    interior: [
      'Triple-aspect reception',
      'Designer kitchen with Miele appliances',
      'Engineered wood flooring',
      'Walk-in dressing room',
      'Underfloor heating',
    ],
    exterior: ['Private roof terrace', 'Floor-to-ceiling windows'],
    amenities: ['24-hour concierge', 'Residents-only gym', 'Lift access', 'Secure entry'],
    parking: 'Allocated underground parking included',
  },
  House: {
    interior: [
      'Through-lounge with original features',
      'Extended kitchen-diner',
      'Period sash windows',
      'Engineered wood flooring',
      'Family bathroom plus en-suite',
    ],
    exterior: ['Private rear garden', 'Front garden'],
    amenities: ['Catchment for sought-after schools', 'Family-friendly street'],
    parking: 'On-street permit parking',
  },
  Loft: {
    interior: [
      'Exposed brickwork and cast-iron columns',
      'Four-metre ceilings',
      'Open-plan kitchen-living',
      'Polished concrete floors',
      'Mezzanine sleeping area',
    ],
    exterior: ['Shared roof terrace', 'Large industrial windows'],
    amenities: ['Lift access', 'Bike storage', 'Secure entry'],
    parking: 'On-street permit parking',
  },
};

export function featuresFor(propertyType: string): PropertyFeatures {
  return CATALOGUE[propertyType] ?? DEFAULT_FEATURES;
}
