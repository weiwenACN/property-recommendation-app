// Inline SVG floor plan used as the demo image for properties that
// "have" a floor plan. Real backends will replace this with per-property
// PNG/JPG URLs; the detail screen renders whatever URL we hand it.

const SAMPLE_FLOOR_PLAN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
  <rect width="800" height="560" fill="#fdfdfd"/>

  <!-- Outer wall -->
  <rect x="30" y="30" width="740" height="500" fill="#f7f8fa" stroke="#1a2332" stroke-width="6"/>

  <!-- Inner walls -->
  <line x1="30" y1="260" x2="450" y2="260" stroke="#1a2332" stroke-width="4"/>
  <line x1="450" y1="30" x2="450" y2="530" stroke="#1a2332" stroke-width="4"/>
  <line x1="450" y1="180" x2="770" y2="180" stroke="#1a2332" stroke-width="4"/>
  <line x1="600" y1="180" x2="600" y2="530" stroke="#1a2332" stroke-width="4"/>

  <!-- Doors (gaps) -->
  <line x1="200" y1="260" x2="260" y2="260" stroke="#fdfdfd" stroke-width="6"/>
  <line x1="450" y1="320" x2="450" y2="380" stroke="#fdfdfd" stroke-width="6"/>
  <line x1="500" y1="180" x2="560" y2="180" stroke="#fdfdfd" stroke-width="6"/>
  <line x1="600" y1="380" x2="600" y2="440" stroke="#fdfdfd" stroke-width="6"/>

  <!-- Windows -->
  <line x1="120" y1="30" x2="220" y2="30" stroke="#ff6b35" stroke-width="6"/>
  <line x1="540" y1="30" x2="640" y2="30" stroke="#ff6b35" stroke-width="6"/>
  <line x1="30" y1="100" x2="30" y2="180" stroke="#ff6b35" stroke-width="6"/>
  <line x1="770" y1="280" x2="770" y2="360" stroke="#ff6b35" stroke-width="6"/>

  <!-- Labels -->
  <text x="240" y="150" fill="#1a2332" font-size="22" font-weight="600">Bedroom 1</text>
  <text x="240" y="180" fill="#6b7280" font-size="14">4.2 × 3.6 m</text>

  <text x="560" y="110" fill="#1a2332" font-size="22" font-weight="600">Bedroom 2</text>
  <text x="560" y="140" fill="#6b7280" font-size="14">3.4 × 3.2 m</text>

  <text x="640" y="290" fill="#1a2332" font-size="20" font-weight="600">Bathroom</text>
  <text x="640" y="315" fill="#6b7280" font-size="13">2.4 × 2.0 m</text>

  <text x="640" y="460" fill="#1a2332" font-size="20" font-weight="600">Kitchen</text>
  <text x="640" y="485" fill="#6b7280" font-size="13">3.0 × 3.4 m</text>

  <text x="180" y="400" fill="#1a2332" font-size="24" font-weight="700">Living Room</text>
  <text x="180" y="430" fill="#6b7280" font-size="15">5.4 × 4.8 m</text>

  <text x="40" y="540" fill="#9ca3af" font-size="11">Sample floor plan – not to scale</text>
</svg>`;

export const SAMPLE_FLOOR_PLAN_URL = `data:image/svg+xml;utf8,${encodeURIComponent(SAMPLE_FLOOR_PLAN_SVG)}`;

// Which properties "have" a floor plan in our demo dataset. Apartments and
// Penthouses get one; Studios / Houses / Lofts show the placeholder so both
// states are visible in the UI.
const HAS_FLOOR_PLAN_TYPES = new Set(['Apartment', 'Penthouse']);

export function floorPlanFor(propertyType: string): string | null {
  return HAS_FLOOR_PLAN_TYPES.has(propertyType) ? SAMPLE_FLOOR_PLAN_URL : null;
}
