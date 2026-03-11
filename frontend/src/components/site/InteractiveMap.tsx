import { useMemo, useState, useEffect } from "react";
import { InfoWindowF, MarkerF } from "@react-google-maps/api";
import { useQuery } from "@tanstack/react-query";
import { getPlaces } from "@/features/places/api";
import { Place } from "@/features/places/types";
import {
  getPlaceDetailPath,
  isPlaceVisibleInExplorer,
} from "@/features/places/utils";
import { getSiteSettings } from "@/features/site-settings/api";
import { MapContainer, DEFAULT_CENTER } from "./MapContainer";
import {
  Utensils,
  Hotel,
  Mountain,
  Landmark,
  Palmtree,
  Sailboat,
  Brush,
  MapPin,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface InteractiveMapProps {
  highlightedPlaceId?: number | null;
  onMarkerClick?: (placeId: number) => void;
}

const CATEGORY_THEME: Record<string, { color: string; icon: any }> = {
  restaurants: { color: "#f97316", icon: Utensils },
  accommodations: { color: "#3b82f6", icon: Hotel },
  nature: { color: "#22c55e", icon: Mountain },
  culture: { color: "#a855f7", icon: Brush },
  heritage: { color: "#64748b", icon: Landmark },
  beaches: { color: "#06b6d4", icon: Palmtree },
  sports: { color: "#ec4899", icon: Sailboat },
};

export function InteractiveMap({
  highlightedPlaceId,
  onMarkerClick,
}: InteractiveMapProps) {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<number | null>(null);

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSiteSettings,
  });

  const center = useMemo(() => {
    if (settings?.latitude && settings?.longitude) {
      return {
        lat: Number(settings.latitude),
        lng: Number(settings.longitude),
      };
    }
    return DEFAULT_CENTER;
  }, [settings]);

  const { data: placesData } = useQuery({
    queryKey: ["places", "map"],
    queryFn: () => getPlaces({ is_published: true, limit: 100 }),
  });

  const places = useMemo(() => {
    if (!placesData) return [];
    const normalized = Array.isArray(placesData)
      ? placesData
      : placesData.results || [];
    return normalized.filter(isPlaceVisibleInExplorer);
  }, [placesData]);

  const googleMaps =
    typeof window !== "undefined" ? window.google?.maps : undefined;

  const symbolPathCircle = googleMaps?.SymbolPath.CIRCLE;

  const markerAnchor =
    typeof googleMaps?.Point === "function"
      ? new googleMaps.Point(12, 24)
      : undefined;

  useEffect(() => {
    if (highlightedPlaceId) {
      const place = places.find((p) => p.id === highlightedPlaceId);
      if (place) setSelectedPlace(place);
    }
  }, [highlightedPlaceId, places]);

  return (
    <MapContainer
      className="h-full w-full"
      center={center}
      onClick={() => setSelectedPlace(null)}
    >
      {symbolPathCircle !== undefined && (
        <>
          {/* Main Village Marker */}
          <MarkerF
            position={center}
            icon={{
              path: symbolPathCircle,
              fillColor: "#00f2ea", // Accent color
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 4,
              scale: 12,
            }}
          />

          {places.map((place) => {
            if (!place.latitude || !place.longitude) return null;

            const isHighlighted =
              highlightedPlaceId === place.id || hoveredMarkerId === place.id;
            const theme = CATEGORY_THEME[place.template_key || ""] || {
              color: "#94a3b8",
            };

            return (
              <MarkerF
                key={place.id}
                position={{
                  lat: Number(place.latitude),
                  lng: Number(place.longitude),
                }}
                onMouseOver={() => setHoveredMarkerId(place.id)}
                onMouseOut={() => setHoveredMarkerId(null)}
                onClick={() => {
                  setSelectedPlace(place);
                  onMarkerClick?.(place.id);
                }}
                icon={{
                  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
                  fillColor: theme.color,
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 2,
                  scale: isHighlighted ? 1.8 : 1.4,
                  anchor: markerAnchor,
                }}
              />
            );
          })}
        </>
      )}

      {selectedPlace && selectedPlace.latitude && selectedPlace.longitude && (
        <InfoWindowF
          position={{
            lat: Number(selectedPlace.latitude),
            lng: Number(selectedPlace.longitude),
          }}
          onCloseClick={() => setSelectedPlace(null)}
        >
          <div className="w-[300px] overflow-hidden rounded-3xl bg-white shadow-2xl font-interface ring-1 ring-slate-100">
            <div className="relative h-40 overflow-hidden bg-slate-100">
              {selectedPlace.featured_media ? (
                <img
                  src={
                    selectedPlace.featured_media.variant_medium ||
                    selectedPlace.featured_media.file
                  }
                  alt={selectedPlace.title}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <MapPin className="h-8 w-8 text-slate-300" />
                </div>
              )}
              <div className="absolute left-4 top-4">
                <span className="rounded-full bg-slate-900/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                  {selectedPlace.template_key || "Lugar"}
                </span>
              </div>
            </div>

            <div className="flex flex-col p-6">
              <span className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                {selectedPlace.location_text || "Cabrera de mar"}
              </span>
              <h4 className="mb-6 line-clamp-2 text-xl font-bold leading-tight text-slate-900">
                {selectedPlace.title}
              </h4>

              <div className="mt-auto grid grid-cols-2 gap-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedPlace.title} ${selectedPlace.location_text}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-slate-50 py-3 transition-colors hover:bg-slate-100"
                >
                  <ExternalLink className="h-4 w-4 text-slate-500 transition-transform group-hover:scale-110 group-hover:text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600 group-hover:text-slate-900">
                    Abrir
                  </span>
                </a>
                <a
                  href={getPlaceDetailPath(selectedPlace)}
                  className="group flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-primary py-3 text-white shadow-lg shadow-primary/20 transition-all hover:bg-secondary hover:shadow-xl hover:shadow-secondary/20"
                >
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                    Detalles
                  </span>
                </a>
              </div>
            </div>
          </div>
        </InfoWindowF>
      )}
    </MapContainer>
  );
}
