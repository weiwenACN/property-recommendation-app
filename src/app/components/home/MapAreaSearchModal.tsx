import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../../leaflet-setup';
import { X, Search } from 'lucide-react';
import {
  recommendedAreas,
  type RecommendedArea,
} from '../../data/properties';

interface MapAreaSearchModalProps {
  open: boolean;
  initialQuery: string;
  onClose: () => void;
  onSelectArea: (area: RecommendedArea) => void;
}

const CENTRAL_LONDON: [number, number] = [51.5074, -0.1278];
const DEFAULT_ZOOM = 11;
const FOCUS_ZOOM = 13;

function MapController({
  focusArea,
}: {
  focusArea: RecommendedArea | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (focusArea?.lat !== undefined && focusArea?.lng !== undefined) {
      map.flyTo([focusArea.lat, focusArea.lng], FOCUS_ZOOM, { duration: 0.8 });
    } else {
      map.flyTo(CENTRAL_LONDON, DEFAULT_ZOOM, { duration: 0.6 });
    }
  }, [map, focusArea]);

  return null;
}

export function MapAreaSearchModal({
  open,
  initialQuery,
  onClose,
  onSelectArea,
}: MapAreaSearchModalProps) {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    if (open) setQuery(initialQuery);
  }, [open, initialQuery]);

  const matchedAreaIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return new Set<string>();
    return new Set(
      recommendedAreas
        .filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.borough.toLowerCase().includes(q),
        )
        .map((a) => a.id),
    );
  }, [query]);

  const focusArea = useMemo(() => {
    if (matchedAreaIds.size === 0) return null;
    return recommendedAreas.find((a) => matchedAreaIds.has(a.id)) ?? null;
  }, [matchedAreaIds]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
      {/* Top bar */}
      <div className="bg-[#1a2332] px-4 pb-4 header-pt">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            aria-label="Close map search"
            className="p-2 -ml-2 text-white hover:text-[#ff6b35] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to highlight an area on the map"
              className="w-full pl-9 pr-3 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6b35] text-[#1a2332] text-sm"
            />
          </div>
        </div>
        <p className="text-xs text-gray-300 mt-3">
          Tap a neighbourhood pin to search — or type above to highlight one.
        </p>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={CENTRAL_LONDON}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController focusArea={focusArea} />

          {recommendedAreas.map((area) => {
            if (area.lat === undefined || area.lng === undefined) return null;
            const isHighlighted =
              matchedAreaIds.size === 0 || matchedAreaIds.has(area.id);
            return (
              <Marker
                key={area.id}
                position={[area.lat, area.lng]}
                opacity={isHighlighted ? 1 : 0.35}
                eventHandlers={{
                  click: () => onSelectArea(area),
                }}
              >
                <Tooltip direction="top" offset={[-15, -10]} permanent>
                  <span className="font-medium">{area.name}</span>
                </Tooltip>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapAreaSearchModal;
