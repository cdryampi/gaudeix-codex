import { useMemo, useState, useEffect } from "react";
import { InfoWindowF, MarkerF } from "@react-google-maps/api";
import { useQuery } from "@tanstack/react-query";
import { getPlaces } from "@/features/places/api";
import { Place } from "@/features/places/types";
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
    return Array.isArray(placesData) ? placesData : placesData.results || [];
  }, [placesData]);

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
      {window.google && (
        <>
          {/* Main Village Marker */}
          <MarkerF
            position={center}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
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
                  anchor: new google.maps.Point(12, 24),
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
          <div className="min-w-[280px] p-0 overflow-hidden bg-white rounded-2xl shadow-2xl border-none">
            <div className="relative h-32 overflow-hidden">
              {selectedPlace.featured_media ? (
                <img
                  src={
                    selectedPlace.featured_media.variant_medium ||
                    selectedPlace.featured_media.file
                  }
                  alt={selectedPlace.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <MapPin className="text-slate-300 h-10 w-10" />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white">
                  {selectedPlace.template_key || "Lugar"}
                </span>
              </div>
            </div>

            <div className="p-5">
              <h4 className="text-xl font-black text-slate-900 leading-[1.1] mb-2 tracking-tight">
                {selectedPlace.title}
              </h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-6">
                {selectedPlace.location_text}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedPlace.title} ${selectedPlace.location_text}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 bg-slate-50 text-slate-600 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  Ruta
                </a>
                <a
                  href={`/lugares/${selectedPlace.slug}`}
                  className="flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-colors shadow-lg shadow-slate-900/20"
                >
                  Detalles
                  <ChevronRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </InfoWindowF>
      )}
    </MapContainer>
  );
}
