/**
 * ProgrammingMap renders Festa events on a venue-based interactive map.
 */

import { useMemo, useState } from "react";
import { InfoWindowF, MarkerF } from "@react-google-maps/api";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import { MapContainer, DEFAULT_CENTER } from "@/components/site/MapContainer";
import { Event } from "@/features/events/types";

import { getVenues } from "../api";
import { Venue } from "../types";

interface ProgrammingMapProps {
  events: Event[];
}

interface EventWithCoords extends Event {
  latitude: number;
  longitude: number;
}

const categoryColor = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes("music") || normalized.includes("musica"))
    return "#f97316";
  if (normalized.includes("fam") || normalized.includes("infant"))
    return "#22c55e";
  if (normalized.includes("trad") || normalized.includes("cercavila"))
    return "#a855f7";
  return "#06b6d4";
};

const normalizeKey = (value: string) => value.trim().toLowerCase();

export const ProgrammingMap = ({ events }: ProgrammingMapProps) => {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const { data: venuesData } = useQuery({
    queryKey: ["venues", "programming-map"],
    queryFn: () => getVenues({ is_published: true, limit: 500 }),
  });

  const venuesByName = useMemo(() => {
    const map = new Map<string, Venue>();
    (venuesData?.results || []).forEach((venue) => {
      if (venue.name) {
        map.set(normalizeKey(venue.name), venue);
      }
    });
    return map;
  }, [venuesData]);

  const { eventsWithCoords, eventsWithoutCoords } = useMemo(() => {
    const withCoords: EventWithCoords[] = [];
    const withoutCoords: Event[] = [];

    events.forEach((event) => {
      const venue = event.venue_name
        ? venuesByName.get(normalizeKey(event.venue_name))
        : null;
      const lat = venue?.latitude;
      const lng = venue?.longitude;

      if (typeof lat === "number" && typeof lng === "number") {
        withCoords.push({
          ...event,
          latitude: lat,
          longitude: lng,
        });
        return;
      }

      withoutCoords.push(event);
    });

    return {
      eventsWithCoords: withCoords,
      eventsWithoutCoords: withoutCoords,
    };
  }, [events, venuesByName]);

  const selectedEvent = useMemo(
    () =>
      eventsWithCoords.find((event) => event.id === selectedEventId) || null,
    [eventsWithCoords, selectedEventId],
  );

  const center = useMemo(() => {
    if (eventsWithCoords.length === 0) {
      return DEFAULT_CENTER;
    }

    const total = eventsWithCoords.reduce(
      (acc, event) => {
        acc.lat += event.latitude;
        acc.lng += event.longitude;
        return acc;
      },
      { lat: 0, lng: 0 },
    );

    return {
      lat: total.lat / eventsWithCoords.length,
      lng: total.lng / eventsWithCoords.length,
    };
  }, [eventsWithCoords]);

  return (
    <div className="space-y-5">
      <div className="h-[420px] overflow-hidden rounded-3xl border border-white/10">
        <MapContainer
          className="h-full w-full"
          center={center}
          zoom={13}
          onClick={() => setSelectedEventId(null)}
        >
          {window.google &&
            eventsWithCoords.map((event) => {
              const color = categoryColor(event.category_name || "");
              const isSelected = selectedEventId === event.id;

              return (
                <MarkerF
                  key={event.id}
                  position={{ lat: event.latitude, lng: event.longitude }}
                  onClick={() => setSelectedEventId(event.id)}
                  icon={{
                    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
                    fillColor: color,
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 2,
                    scale: isSelected ? 1.8 : 1.4,
                    anchor: new google.maps.Point(12, 24),
                  }}
                />
              );
            })}

          {selectedEvent && (
            <InfoWindowF
              position={{
                lat: selectedEvent.latitude,
                lng: selectedEvent.longitude,
              }}
              onCloseClick={() => setSelectedEventId(null)}
            >
              <div className="min-w-[260px] max-w-[300px] rounded-2xl bg-white p-4 text-slate-900">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                  {selectedEvent.category_name || "Event"}
                </p>
                <h4 className="mt-1 text-lg font-black leading-tight">
                  {selectedEvent.title}
                </h4>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  {selectedEvent.venue_name ||
                    selectedEvent.location_text ||
                    "Ubicacio per confirmar"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={`/agenda/${selectedEvent.slug}`}
                    className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-[10px] font-black uppercase tracking-widest text-white"
                  >
                    Veure detall
                  </Link>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedEvent.title} ${selectedEvent.location_text || selectedEvent.venue_name}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-300 px-3 text-[10px] font-black uppercase tracking-widest text-slate-700"
                  >
                    Ruta
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </InfoWindowF>
          )}
        </MapContainer>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
          {eventsWithCoords.length} esdeveniments amb mapa -{" "}
          {eventsWithoutCoords.length} sense coordenades
        </p>

        {eventsWithoutCoords.length > 0 && (
          <div className="mt-3 space-y-2">
            {eventsWithoutCoords.slice(0, 8).map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-2 text-sm font-semibold text-slate-300"
              >
                <MapPin className="h-4 w-4 text-white/40" />
                <span className="truncate">
                  {event.title} -{" "}
                  {event.venue_name ||
                    event.location_text ||
                    "Ubicacio per confirmar"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
