/**
 * ProgrammingMap renders Festa activities on a venue-based interactive map.
 */

import { useMemo, useState } from "react";
import { InfoWindowF, MarkerF } from "@react-google-maps/api";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import { MapContainer, DEFAULT_CENTER } from "@/components/site/MapContainer";

import { getVenues } from "../api";
import { Activity, Venue } from "../types";

interface ProgrammingMapProps {
  activities: Activity[];
}

interface ActivityWithCoords extends Activity {
  latitude: number;
  longitude: number;
}

const categoryColor = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes("music") || normalized.includes("musica")) return "#f97316";
  if (normalized.includes("fam") || normalized.includes("infant")) return "#22c55e";
  if (normalized.includes("trad") || normalized.includes("cercavila")) return "#a855f7";
  return "#06b6d4";
};

export const ProgrammingMap = ({ activities }: ProgrammingMapProps) => {
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);

  const { data: venuesData } = useQuery({
    queryKey: ["venues", "programming-map"],
    queryFn: () => getVenues({ is_published: true, limit: 500 }),
  });

  const venuesBySlug = useMemo(() => {
    const map = new Map<string, Venue>();
    (venuesData?.results || []).forEach((venue) => {
      map.set(venue.slug, venue);
    });
    return map;
  }, [venuesData]);

  const { activitiesWithCoords, activitiesWithoutCoords } = useMemo(() => {
    const withCoords: ActivityWithCoords[] = [];
    const withoutCoords: Activity[] = [];

    activities.forEach((activity) => {
      const venue = activity.venue_slug ? venuesBySlug.get(activity.venue_slug) : null;
      const lat = venue?.latitude;
      const lng = venue?.longitude;

      if (typeof lat === "number" && typeof lng === "number") {
        withCoords.push({
          ...activity,
          latitude: lat,
          longitude: lng,
        });
        return;
      }

      withoutCoords.push(activity);
    });

    return {
      activitiesWithCoords: withCoords,
      activitiesWithoutCoords: withoutCoords,
    };
  }, [activities, venuesBySlug]);

  const selectedActivity = useMemo(
    () =>
      activitiesWithCoords.find((activity) => activity.id === selectedActivityId) ||
      null,
    [activitiesWithCoords, selectedActivityId],
  );

  const center = useMemo(() => {
    if (activitiesWithCoords.length === 0) {
      return DEFAULT_CENTER;
    }

    const total = activitiesWithCoords.reduce(
      (acc, activity) => {
        acc.lat += activity.latitude;
        acc.lng += activity.longitude;
        return acc;
      },
      { lat: 0, lng: 0 },
    );

    return {
      lat: total.lat / activitiesWithCoords.length,
      lng: total.lng / activitiesWithCoords.length,
    };
  }, [activitiesWithCoords]);

  return (
    <div className="space-y-5">
      <div className="h-[420px] overflow-hidden rounded-3xl border border-white/10">
        <MapContainer
          className="h-full w-full"
          center={center}
          zoom={13}
          onClick={() => setSelectedActivityId(null)}
        >
          {window.google &&
            activitiesWithCoords.map((activity) => {
              const color = categoryColor(activity.category || "");
              const isSelected = selectedActivityId === activity.id;

              return (
                <MarkerF
                  key={activity.id}
                  position={{ lat: activity.latitude, lng: activity.longitude }}
                  onClick={() => setSelectedActivityId(activity.id)}
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

          {selectedActivity && (
            <InfoWindowF
              position={{
                lat: selectedActivity.latitude,
                lng: selectedActivity.longitude,
              }}
              onCloseClick={() => setSelectedActivityId(null)}
            >
              <div className="min-w-[260px] max-w-[300px] rounded-2xl bg-white p-4 text-slate-900">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                  {selectedActivity.category || "Activitat"}
                </p>
                <h4 className="mt-1 text-lg font-black leading-tight">
                  {selectedActivity.title}
                </h4>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  {selectedActivity.location ||
                    selectedActivity.venue_name ||
                    "Ubicacio per confirmar"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={`/festes/activitats/${selectedActivity.slug}`}
                    className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-[10px] font-black uppercase tracking-widest text-white"
                  >
                    Veure detall
                  </Link>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedActivity.title} ${selectedActivity.location || selectedActivity.venue_name}`)}`}
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
          {activitiesWithCoords.length} activitats amb mapa · {activitiesWithoutCoords.length} sense coordenades
        </p>

        {activitiesWithoutCoords.length > 0 && (
          <div className="mt-3 space-y-2">
            {activitiesWithoutCoords.slice(0, 8).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-2 text-sm font-semibold text-slate-300"
              >
                <MapPin className="h-4 w-4 text-white/40" />
                <span className="truncate">
                  {activity.title} - {activity.location || activity.venue_name || "Ubicacio per confirmar"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
