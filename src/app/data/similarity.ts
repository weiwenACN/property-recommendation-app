import type { Property } from './properties';
import type { SearchMode } from './pricing';
import type { ViewedEntry } from './viewedStore';

// Composite similarity scoring. No hard filters - the brief's "shares: area,
// price ±15%, bedrooms, type" become soft signals scored against each other
// so the top N always returns something useful even when no candidate
// satisfies all four criteria.

const WEIGHTS = {
  sameArea: 30,
  bedroomsExact: 25,
  bedroomsOff1: 10,
  sameType: 20,
  priceMax: 25, // scaled by closeness
  viewedAreaBoost: 5,
  viewedAreaStrongBoost: 5, // extra when very frequent
};

interface SimilarityOptions {
  viewedEntries?: ViewedEntry[];
  maxResults?: number;
}

interface ScoredProperty {
  property: Property;
  score: number;
}

function priceFor(mode: SearchMode, property: Property): number {
  return mode === 'rent' ? property.rentPrice : property.salePrice;
}

function buildViewedAreaCounts(
  properties: Property[],
  entries: ViewedEntry[] | undefined,
): Map<string, number> {
  const counts = new Map<string, number>();
  if (!entries) return counts;
  for (const entry of entries) {
    const viewed = properties.find((p) => p.id === entry.propertyId);
    if (viewed) {
      counts.set(viewed.areaId, (counts.get(viewed.areaId) ?? 0) + 1);
    }
  }
  return counts;
}

export function similarityScore(
  target: Property,
  candidate: Property,
  mode: SearchMode,
  viewedAreaCounts: Map<string, number>,
): number {
  if (candidate.id === target.id) return -1;
  let score = 0;

  if (candidate.areaId === target.areaId) score += WEIGHTS.sameArea;

  const bedroomDiff = Math.abs(candidate.bedrooms - target.bedrooms);
  if (bedroomDiff === 0) score += WEIGHTS.bedroomsExact;
  else if (bedroomDiff === 1) score += WEIGHTS.bedroomsOff1;

  if (candidate.propertyType === target.propertyType) score += WEIGHTS.sameType;

  const targetPrice = priceFor(mode, target);
  const candidatePrice = priceFor(mode, candidate);
  if (targetPrice > 0) {
    const priceDiff = Math.abs(candidatePrice - targetPrice) / targetPrice;
    if (priceDiff <= 0.15) {
      score += WEIGHTS.priceMax * (1 - priceDiff / 0.15);
    } else if (priceDiff <= 0.3) {
      // Soft tail-off for properties within 30% so the section still surfaces
      // sensible matches when nothing's within 15%.
      score += (WEIGHTS.priceMax / 2.5) * (1 - (priceDiff - 0.15) / 0.15);
    }
  }

  // Behavioural refinement (Feature 2d): if the user has been browsing this
  // candidate's area, nudge it up.
  const areaViewCount = viewedAreaCounts.get(candidate.areaId) ?? 0;
  if (areaViewCount >= 2) score += WEIGHTS.viewedAreaBoost;
  if (areaViewCount >= 4) score += WEIGHTS.viewedAreaStrongBoost;

  return score;
}

export function findSimilar(
  target: Property,
  properties: Property[],
  mode: SearchMode,
  options: SimilarityOptions = {},
): Property[] {
  const max = options.maxResults ?? 10;
  const viewedAreaCounts = buildViewedAreaCounts(properties, options.viewedEntries);

  const scored: ScoredProperty[] = properties
    .map((p) => ({ property: p, score: similarityScore(target, p, mode, viewedAreaCounts) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max);

  return scored.map((s) => s.property);
}

// Simulated async wrapper so consumers can treat similarity as a network call.
// The UI shows a loading state for ~150ms; swap this body with a real fetch
// when a /similarities endpoint exists - everything else stays the same.
export function fetchSimilar(
  target: Property,
  properties: Property[],
  mode: SearchMode,
  options: SimilarityOptions = {},
): Promise<Property[]> {
  return new Promise((resolve) => {
    const result = findSimilar(target, properties, mode, options);
    window.setTimeout(() => resolve(result), 150);
  });
}
