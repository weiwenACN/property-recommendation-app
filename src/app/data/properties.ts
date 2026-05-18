export interface RecommendedArea {
  id: string;
  name: string;
  borough: string;
  avgRent: number;
  avgSalePrice: number;
  tag: string;
  imageUrl: string;
  matchReason: string;
  lat?: number;
  lng?: number;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  rentPrice: number;
  salePrice: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  distanceToTube: string;
  imageUrl: string;
  lat: number;
  lng: number;
  areaId: string;
  /** Lifestyle preference ids this property satisfies; see data/preferences.ts. */
  preferenceTags: string[];
}

export const recommendedAreas: RecommendedArea[] = [
  {
    id: '1',
    name: 'Shoreditch',
    borough: 'Hackney',
    avgRent: 2400,
    avgSalePrice: 750000,
    tag: 'Great for nightlife',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
    matchReason: 'Vibrant area with excellent transport links',
    lat: 51.5260,
    lng: -0.0780,
  },
  {
    id: '2',
    name: 'Clapham',
    borough: 'Lambeth',
    avgRent: 1950,
    avgSalePrice: 620000,
    tag: 'Great for families',
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
    matchReason: 'Parks nearby and good schools',
    lat: 51.4622,
    lng: -0.1376,
  },
  {
    id: '3',
    name: 'Canary Wharf',
    borough: 'Tower Hamlets',
    avgRent: 2800,
    avgSalePrice: 900000,
    tag: 'Close to CBD',
    imageUrl: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800',
    matchReason: 'Modern living in financial district',
    lat: 51.5048,
    lng: -0.0195,
  },
  {
    id: '4',
    name: 'Brixton',
    borough: 'Lambeth',
    avgRent: 1800,
    avgSalePrice: 550000,
    tag: 'Vibrant culture',
    imageUrl: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800',
    matchReason: 'Diverse area with great food scene',
    lat: 51.4623,
    lng: -0.1145,
  },
  {
    id: '5',
    name: 'Hackney',
    borough: 'Hackney',
    avgRent: 2100,
    avgSalePrice: 650000,
    tag: 'Trendy & artistic',
    imageUrl: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=800',
    matchReason: 'Creative hub with parks',
    lat: 51.5450,
    lng: -0.0553,
  },
];

export const properties: Property[] = [
  // ----- Shoreditch (area 1) -----
  {
    id: '1',
    title: 'Modern 2-Bed Apartment',
    address: '15 High Street, Shoreditch',
    rentPrice: 2400,
    salePrice: 675000,
    bedrooms: 2,
    bathrooms: 2,
    propertyType: 'Apartment',
    distanceToTube: '5 min walk to Old Street',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    lat: 51.5260,
    lng: -0.0780,
    areaId: '1',
    preferenceTags: ['tube', 'nightlife', 'cbd'],
  },
  {
    id: '2',
    title: 'Spacious Studio',
    address: '23 Brick Lane, Shoreditch',
    rentPrice: 1850,
    salePrice: 450000,
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'Studio',
    distanceToTube: '3 min walk to Shoreditch High Street',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    lat: 51.5230,
    lng: -0.0715,
    areaId: '1',
    preferenceTags: ['tube', 'nightlife'],
  },
  {
    id: '3',
    title: 'Luxury Penthouse',
    address: '42 Curtain Road, Shoreditch',
    rentPrice: 3800,
    salePrice: 1150000,
    bedrooms: 3,
    bathrooms: 2,
    propertyType: 'Penthouse',
    distanceToTube: '7 min walk to Liverpool Street',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    lat: 51.5275,
    lng: -0.0830,
    areaId: '1',
    preferenceTags: ['cbd', 'nightlife', 'tube'],
  },

  // ----- Clapham (area 2) -----
  {
    id: '4',
    title: 'Family 3-Bed House',
    address: '88 Abbeville Road, Clapham',
    rentPrice: 2200,
    salePrice: 760000,
    bedrooms: 3,
    bathrooms: 2,
    propertyType: 'House',
    distanceToTube: '6 min walk to Clapham Common',
    imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
    lat: 51.4640,
    lng: -0.1390,
    areaId: '2',
    preferenceTags: ['schools', 'parks', 'supermarkets'],
  },
  {
    id: '5',
    title: 'Bright 1-Bed Flat',
    address: '5 The Pavement, Clapham',
    rentPrice: 1700,
    salePrice: 475000,
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'Apartment',
    distanceToTube: '2 min walk to Clapham Common',
    imageUrl: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800',
    lat: 51.4610,
    lng: -0.1370,
    areaId: '2',
    preferenceTags: ['tube', 'parks'],
  },
  {
    id: '6',
    title: 'Victorian Conversion',
    address: '17 Crescent Lane, Clapham',
    rentPrice: 2450,
    salePrice: 720000,
    bedrooms: 2,
    bathrooms: 1,
    propertyType: 'Apartment',
    distanceToTube: '8 min walk to Clapham North',
    imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
    lat: 51.4655,
    lng: -0.1340,
    areaId: '2',
    preferenceTags: ['schools', 'parks'],
  },

  // ----- Canary Wharf (area 3) -----
  {
    id: '7',
    title: 'River-view 2-Bed',
    address: '24 Westferry Circus, Canary Wharf',
    rentPrice: 2900,
    salePrice: 895000,
    bedrooms: 2,
    bathrooms: 2,
    propertyType: 'Apartment',
    distanceToTube: '3 min walk to Westferry',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    lat: 51.5042,
    lng: -0.0205,
    areaId: '3',
    preferenceTags: ['cbd', 'tube', 'supermarkets'],
  },
  {
    id: '8',
    title: 'High-floor Studio',
    address: '1 Bank Street, Canary Wharf',
    rentPrice: 2200,
    salePrice: 520000,
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'Studio',
    distanceToTube: '2 min walk to Canary Wharf',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    lat: 51.5054,
    lng: -0.0190,
    areaId: '3',
    preferenceTags: ['cbd', 'tube'],
  },
  {
    id: '9',
    title: '3-Bed Sky Apartment',
    address: 'Pan Peninsula, Canary Wharf',
    rentPrice: 4200,
    salePrice: 1200000,
    bedrooms: 3,
    bathrooms: 2,
    propertyType: 'Apartment',
    distanceToTube: '5 min walk to South Quay',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    lat: 51.5031,
    lng: -0.0182,
    areaId: '3',
    preferenceTags: ['cbd', 'tube', 'supermarkets'],
  },

  // ----- Brixton (area 4) -----
  {
    id: '10',
    title: 'Cosy 1-Bed Flat',
    address: '8 Market Row, Brixton',
    rentPrice: 1650,
    salePrice: 440000,
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'Apartment',
    distanceToTube: '4 min walk to Brixton',
    imageUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
    lat: 51.4615,
    lng: -0.1140,
    areaId: '4',
    preferenceTags: ['tube', 'nightlife', 'supermarkets'],
  },
  {
    id: '11',
    title: '2-Bed Garden Flat',
    address: '54 Coldharbour Lane, Brixton',
    rentPrice: 1900,
    salePrice: 625000,
    bedrooms: 2,
    bathrooms: 1,
    propertyType: 'Apartment',
    distanceToTube: '7 min walk to Loughborough Junction',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    lat: 51.4640,
    lng: -0.1120,
    areaId: '4',
    preferenceTags: ['parks', 'supermarkets'],
  },
  {
    id: '12',
    title: '3-Bed Terraced House',
    address: '21 Acre Lane, Brixton',
    rentPrice: 2400,
    salePrice: 775000,
    bedrooms: 3,
    bathrooms: 2,
    propertyType: 'House',
    distanceToTube: '5 min walk to Brixton',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    lat: 51.4630,
    lng: -0.1170,
    areaId: '4',
    preferenceTags: ['schools', 'parks', 'supermarkets'],
  },

  // ----- Hackney (area 5) -----
  {
    id: '13',
    title: 'Warehouse Loft',
    address: '12 Mare Street, Hackney',
    rentPrice: 2400,
    salePrice: 720000,
    bedrooms: 2,
    bathrooms: 1,
    propertyType: 'Loft',
    distanceToTube: '6 min walk to Hackney Central',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    lat: 51.5445,
    lng: -0.0560,
    areaId: '5',
    preferenceTags: ['nightlife', 'tube'],
  },
  {
    id: '14',
    title: '2-Bed Conversion',
    address: '7 Wilton Way, Hackney',
    rentPrice: 2000,
    salePrice: 595000,
    bedrooms: 2,
    bathrooms: 1,
    propertyType: 'Apartment',
    distanceToTube: '4 min walk to London Fields',
    imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
    lat: 51.5455,
    lng: -0.0545,
    areaId: '5',
    preferenceTags: ['parks', 'schools', 'supermarkets'],
  },
  {
    id: '15',
    title: 'Garden Studio',
    address: '33 Broadway Market, Hackney',
    rentPrice: 1800,
    salePrice: 415000,
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'Studio',
    distanceToTube: '8 min walk to Bethnal Green',
    imageUrl: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800',
    lat: 51.5430,
    lng: -0.0590,
    areaId: '5',
    preferenceTags: ['parks', 'nightlife'],
  },
];

export function propertiesByArea(areaId: string): Property[] {
  return properties.filter((p) => p.areaId === areaId);
}
