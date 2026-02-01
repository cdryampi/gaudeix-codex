import { useQuery } from "@tanstack/react-query";
import { getPlaces } from "../api";
import { PlaceCard } from "./PlaceCard";
import { MapPin } from "lucide-react";

interface NearbyPlacesProps {
  latitude: number;
  longitude: number;
  currentPlaceId: number;
}

export const NearbyPlaces = ({
  latitude,
  longitude,
  currentPlaceId,
}: NearbyPlacesProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["places", "nearby", latitude, longitude, currentPlaceId],
    queryFn: () =>
      getPlaces({
        near: `${latitude},${longitude}`,
        radius_km: 2,
        is_published: true,
      }),
  });

  if (isLoading)
    return (
      <div className="h-64 w-full animate-pulse rounded-[3rem] bg-slate-50" />
    );

  const places = Array.isArray(data) ? data : data?.results || [];

  // Filter out current place and limit to 3
  const nearbyPlaces = places
    .filter((p) => p.id !== currentPlaceId)
    .slice(0, 3);

  if (nearbyPlaces.length === 0) return null;

  return (
    <div className="space-y-12 py-16 border-t border-slate-100">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
            <MapPin className="h-3 w-3" />A menos de 2km
          </div>
          <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">
            Qué ver <span className="text-primary italic">cerca</span>
          </h3>
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {nearbyPlaces.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>
    </div>
  );
};
