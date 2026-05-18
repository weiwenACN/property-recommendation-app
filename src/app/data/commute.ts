import type { Workplace } from './workplaceStore';

// Rough commute estimate without an external routing API. Distance is
// honest (great-circle / haversine), the time is a per-mode multiplier
// based on typical London door-to-door speeds. Easy to swap with a real
// routing call when a backend lands; the call sites only consume
// `estimateCommute(workplace, property)`.

const EARTH_RADIUS_KM = 6371;

// Minutes per km. Tuned to feel sane for London door-to-door commutes.
const MINUTES_PER_KM = {
  walk: 13,
  transit: 4.2,
};

// Below this haversine distance walking is plausibly the fastest mode.
const WALK_THRESHOLD_KM = 1.5;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): number {
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export type CommuteMode = 'walk' | 'transit';

export interface CommuteEstimate {
  mode: CommuteMode;
  minutes: number;
  km: number;
}

export function estimateCommute(
  workplace: Workplace | null,
  property: { lat: number; lng: number },
): CommuteEstimate | null {
  if (!workplace) return null;

  const km = haversineKm({ lat: workplace.lat, lng: workplace.lng }, property);
  const mode: CommuteMode = km <= WALK_THRESHOLD_KM ? 'walk' : 'transit';
  const minutes = Math.max(1, Math.round(km * MINUTES_PER_KM[mode]));
  return { mode, minutes, km };
}

export function formatCommute(estimate: CommuteEstimate): string {
  return `≈${estimate.minutes} min`;
}
