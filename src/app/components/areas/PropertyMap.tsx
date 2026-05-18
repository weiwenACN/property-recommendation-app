import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../leaflet-setup";
import { Bed, Bath } from "lucide-react";
import type { Property } from "../../data/properties";
import { priceFor, type SearchMode } from "../../data/pricing";
import { categoryIconFor } from "../../data/categories";
import { preferenceOptionById } from "../../data/preferences";

interface PropertyMapProps {
  properties: Property[];
  searchMode: SearchMode;
  areaCenter?: { lat: number; lng: number };
  areaName?: string;
  onPropertySelect: (property: Property) => void;
}

const LONDON_CENTER: [number, number] = [51.5074, -0.1278];
const DEFAULT_ZOOM = 13;
const SINGLE_RESULT_ZOOM = 15;

function FitToProperties({ properties }: { properties: Property[] }) {
  const map = useMap();

  useEffect(() => {
    if (properties.length === 0) return;

    if (properties.length === 1) {
      map.setView([properties[0].lat, properties[0].lng], SINGLE_RESULT_ZOOM);
      return;
    }

    const bounds = L.latLngBounds(properties.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, properties]);

  return null;
}

export function PropertyMap({
  properties,
  searchMode,
  areaCenter,
  areaName,
  onPropertySelect,
}: PropertyMapProps) {
  const initialCenter: [number, number] = areaCenter
    ? [areaCenter.lat, areaCenter.lng]
    : properties.length > 0
    ? [properties[0].lat, properties[0].lng]
    : LONDON_CENTER;

  const initialZoom = properties.length === 1 ? SINGLE_RESULT_ZOOM : DEFAULT_ZOOM;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitToProperties properties={properties} />

        {properties.map((property) => {
          const CategoryIcon = categoryIconFor(property.propertyType);
          return (
          <Marker key={property.id} position={[property.lat, property.lng]}>
            <Popup>
              <div className="w-56">
                {property.imageUrl && (
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="mb-2 h-28 w-full rounded-md object-cover"
                  />
                )}
                <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-[#f9fafb] px-2 py-0.5 text-[10px] font-medium text-[#1a2332]">
                  <CategoryIcon className="h-3 w-3" />
                  {property.propertyType}
                </div>
                <h3 className="text-sm font-bold text-[#1a2332]">{property.title}</h3>
                <p className="mb-1 text-xs text-gray-600">{property.address}</p>
                <p className="mb-2 font-bold text-[#1a2332]">{priceFor(searchMode, property)}</p>
                <div className="mb-2 flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Bed className="h-3 w-3" />
                    {property.bedrooms} bed
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="h-3 w-3" />
                    {property.bathrooms} bath
                  </span>
                </div>
                {property.preferenceTags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {property.preferenceTags.map((id) => {
                      const opt = preferenceOptionById(id);
                      if (!opt) return null;
                      const Icon = opt.icon;
                      return (
                        <span
                          key={id}
                          title={opt.label}
                          className="flex items-center justify-center w-5 h-5 rounded-full bg-[#fff5f2] text-[#ff6b35]"
                        >
                          <Icon className="w-3 h-3" />
                        </span>
                      );
                    })}
                  </div>
                )}
                <button
                  onClick={() => onPropertySelect(property)}
                  className="w-full rounded-md bg-[#1a2332] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#ff6b35]"
                >
                  View details
                </button>
              </div>
            </Popup>
          </Marker>
          );
        })}
      </MapContainer>

      {properties.length === 0 && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-[1000] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-[#1a2332] shadow-md">
          No properties found{areaName ? ` in ${areaName}` : ""}
        </div>
      )}
    </div>
  );
}

export default PropertyMap;
