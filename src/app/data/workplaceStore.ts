import { namespaced, read, write, remove } from './stores';

const SLOT = 'workplace';

export interface Workplace {
  name: string;
  lat: number;
  lng: number;
}

// Curated London workplace hubs. Lets the Profile screen offer a quick
// picker without typing or geocoding.
export const WORKPLACE_PRESETS: Workplace[] = [
  { name: 'Canary Wharf',   lat: 51.5054, lng: -0.0235 },
  { name: 'City of London', lat: 51.5155, lng: -0.0922 },
  { name: 'Westminster',    lat: 51.4975, lng: -0.1357 },
  { name: 'Soho',           lat: 51.5136, lng: -0.1365 },
  { name: 'Paddington',     lat: 51.5154, lng: -0.1755 },
  { name: 'King\'s Cross',  lat: 51.5308, lng: -0.1238 },
  { name: 'Stratford',      lat: 51.5416, lng: -0.0030 },
];

export function loadWorkplace(phoneKey: string): Workplace | null {
  return read<Workplace>(namespaced(phoneKey, SLOT));
}

export function saveWorkplace(phoneKey: string, workplace: Workplace): void {
  write(namespaced(phoneKey, SLOT), workplace);
}

export function clearWorkplace(phoneKey: string): void {
  remove(namespaced(phoneKey, SLOT));
}
