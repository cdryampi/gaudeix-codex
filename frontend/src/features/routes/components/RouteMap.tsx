import { useMemo, useState, useEffect } from "react";
import {
  MarkerF,
  PolylineF,
  InfoWindowF,
  DirectionsRenderer,
  useGoogleMap,
} from "@react-google-maps/api";
import { MapContainer, DEFAULT_CENTER } from "@/components/site/MapContainer";
import { Route, RouteItinerary } from "../types";
import { Navigation, AlertCircle } from "lucide-react";

interface RouteMapProps {
  route: Route;
  itinerary?: RouteItinerary;
  hoveredCheckpointId?: number | null;
  onHoverCheckpoint?: (id: number | null) => void;
  onSelectCheckpoint?: (id: number | null) => void;
  className?: string;
}

// Helper to fit bounds to a set of coordinates
function FitBounds({
  coordinates,
  bounds,
}: {
  coordinates: google.maps.LatLngLiteral[];
  bounds?: { north: number; south: number; east: number; west: number };
}) {
  const map = useGoogleMap();
  useEffect(() => {
    if (!map) return;
    if (bounds) {
      map.fitBounds(bounds, 50);
    } else if (coordinates.length > 0) {
      const gBounds = new google.maps.LatLngBounds();
      coordinates.forEach((coord) => gBounds.extend(coord));
      map.fitBounds(gBounds, 50);
    }
  }, [map, coordinates, bounds]);
  return null;
}

export const RouteMap = ({
  route,
  itinerary,
  hoveredCheckpointId,
  onHoverCheckpoint,
  onSelectCheckpoint,
  className = "w-full h-full",
}: RouteMapProps) => {
  // 1. Parse track_geojson
  const parsedTrackPaths = useMemo(() => {
    if (!route.track_geojson) return null;
    try {
      if (route.track_geojson.type === "LineString") {
        return [
          route.track_geojson.coordinates.map((coord: number[]) => ({
            lat: coord[1],
            lng: coord[0],
          })),
        ];
      } else if (route.track_geojson.type === "MultiLineString") {
        return route.track_geojson.coordinates.map((segment: number[][]) =>
          segment.map((coord: number[]) => ({
            lat: coord[1],
            lng: coord[0],
          })),
        );
      }
    } catch (e) {
      console.error("Failed to parse track_geojson", e);
    }
    return null;
  }, [route.track_geojson]);

  // 2. Identify Checkpoints Path (Fallback)
  const checkpointsPath = useMemo(() => {
    if (!itinerary?.checkpoints) return [];
    return itinerary.checkpoints
      .filter((cp) => cp.lat !== null && cp.lng !== null)
      .map((cp) => ({ lat: cp.lat as number, lng: cp.lng as number }));
  }, [itinerary]);

  const waypointPath = useMemo(() => {
    if (!itinerary?.waypoints) return [];
    return itinerary.waypoints
      .filter((wp) => wp.lat !== null && wp.lng !== null)
      .map((wp) => ({ lat: wp.lat as number, lng: wp.lng as number }));
  }, [itinerary]);

  const endpointMarkers = useMemo(() => {
    const markers: Array<{
      id: string;
      label: string;
      position: google.maps.LatLngLiteral;
      title: string;
    }> = [];

    if (route.start_latitude !== null && route.start_longitude !== null) {
      markers.push({
        id: "start",
        label: "S",
        position: {
          lat: Number(route.start_latitude),
          lng: Number(route.start_longitude),
        },
        title: "Inicio",
      });
    }

    if (route.end_latitude !== null && route.end_longitude !== null) {
      markers.push({
        id: "end",
        label: "E",
        position: {
          lat: Number(route.end_latitude),
          lng: Number(route.end_longitude),
        },
        title: "Final",
      });
    }

    return markers;
  }, [
    route.end_latitude,
    route.end_longitude,
    route.start_latitude,
    route.start_longitude,
  ]);

  // 3. Map Center & Bounds
  const mapCenter = useMemo(() => {
    if (
      route.track_geojson?.bbox &&
      Array.isArray(route.track_geojson.bbox) &&
      route.track_geojson.bbox.length === 4
    ) {
      // bbox is [minLng, minLat, maxLng, maxLat]
      const [minLng, minLat, maxLng, maxLat] = route.track_geojson.bbox;
      return {
        lat: (minLat + maxLat) / 2,
        lng: (minLng + maxLng) / 2,
      };
    }
    if (itinerary?.bounds) {
      return {
        lat: (itinerary.bounds.north + itinerary.bounds.south) / 2,
        lng: (itinerary.bounds.east + itinerary.bounds.west) / 2,
      };
    }
    if (route.start_latitude !== null && route.start_longitude !== null) {
      return {
        lat: Number(route.start_latitude),
        lng: Number(route.start_longitude),
      };
    }
    return DEFAULT_CENTER;
  }, [route, itinerary]);

  // Bounds for fitBounds
  const mapBounds = useMemo(() => {
    if (
      route.track_geojson?.bbox &&
      Array.isArray(route.track_geojson.bbox) &&
      route.track_geojson.bbox.length === 4
    ) {
      const [minLng, minLat, maxLng, maxLat] = route.track_geojson.bbox;
      return { north: maxLat, south: minLat, east: maxLng, west: minLng };
    }
    return itinerary?.bounds;
  }, [route, itinerary]);

  const allCoords = parsedTrackPaths
    ? parsedTrackPaths.flat()
    : checkpointsPath.length > 0
      ? checkpointsPath
      : waypointPath.length > 0
        ? waypointPath
        : endpointMarkers.map((marker) => marker.position);

  // 4. Trace from my location features
  const [tracingMode, setTracingMode] = useState<google.maps.TravelMode | null>(
    null,
  );
  const [directionsResponse, setDirectionsResponse] =
    useState<google.maps.DirectionsResult | null>(null);
  const [directionsError, setDirectionsError] = useState<string | null>(null);

  const handleTraceRoute = () => {
    // If we have directions, user clicks again to reset
    if (tracingMode) {
      setTracingMode(null);
      setDirectionsResponse(null);
      setDirectionsError(null);
      return;
    }

    if (!navigator.geolocation) {
      setDirectionsError("Geolocalización no soportada por su navegador.");
      return;
    }

    setDirectionsError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        let destination: google.maps.LatLngLiteral | null = null;
        if (route.start_latitude !== null && route.start_longitude !== null) {
          destination = {
            lat: Number(route.start_latitude),
            lng: Number(route.start_longitude),
          };
        } else if (allCoords.length > 0) {
          destination = allCoords[0];
        }

        if (!destination) {
          setDirectionsError("Aquesta ruta no té un punt d'inici definit.");
          return;
        }

        setTracingMode(
          window.google?.maps?.TravelMode?.DRIVING || ("DRIVING" as any),
        );

        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
          {
            origin,
            destination,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              setDirectionsResponse(result);
            } else {
              setDirectionsError(
                "No s'ha pogut calcular la ruta. Pot haver-hi oceans de per mig o manca de dades.",
              );
              setTracingMode(null);
            }
          },
        );
      },
      () => {
        setDirectionsError("Permís de geolocalització denegat.");
      },
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {directionsError && (
        <div className="absolute top-4 left-4 right-4 z-10 bg-white border border-red-200 p-3 rounded-xl shadow-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-slate-900">Error en traçar</p>
            <p className="text-xs text-slate-500">{directionsError}</p>
          </div>
          <button
            onClick={() => setDirectionsError(null)}
            className="ml-auto text-slate-400 hover:text-slate-600"
          >
            &times;
          </button>
        </div>
      )}

      {/* Button floating over map */}
      <button
        onClick={handleTraceRoute}
        className={`absolute top-4 right-4 z-10 shadow-lg px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2 ${
          tracingMode
            ? "bg-red-500 text-white hover:bg-red-600 border border-transparent"
            : "bg-white text-slate-700 hover:text-primary border border-slate-200"
        }`}
      >
        <Navigation className="h-3.5 w-3.5" />
        {tracingMode ? "Cancel·lar Traçat" : "Com arribar?"}
      </button>

      <MapContainer
        className={className}
        center={mapCenter}
        zoom={13}
        options={{
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        <FitBounds coordinates={allCoords} bounds={mapBounds || undefined} />

        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              suppressMarkers: false,
              polylineOptions: {
                strokeColor: "#0F76A4", // Secondary for driving route
                strokeOpacity: 0.8,
                strokeWeight: 4,
              },
            }}
          />
        )}

        {/* Polylines for the Route track itself */}
        {parsedTrackPaths ? (
          parsedTrackPaths.map(
            (path: google.maps.LatLngLiteral[], index: number) => (
              <PolylineF
                key={`track-${index}`}
                path={path}
                options={{
                  strokeColor: "#E7640C", // Primary accent
                  strokeOpacity: 0.9,
                  strokeWeight: 4,
                }}
              />
            ),
          )
        ) : checkpointsPath.length > 1 ? (
          <PolylineF
            path={checkpointsPath}
            options={{
              strokeColor: "#E7640C",
              strokeOpacity: 0.9,
              strokeWeight: 4,
            }}
          />
        ) : (
          waypointPath.length > 1 && (
            <PolylineF
              path={waypointPath}
              options={{
                strokeColor: "#E7640C",
                strokeOpacity: 0.9,
                strokeWeight: 4,
              }}
            />
          )
        )}

        {/* Checkpoint markers */}
        {itinerary?.checkpoints?.map((cp) =>
          cp.lat !== null && cp.lng !== null ? (
            <MarkerF
              key={`cp-${cp.id}`}
              position={{ lat: cp.lat, lng: cp.lng }}
              onMouseOver={() => onHoverCheckpoint?.(cp.id)}
              onMouseOut={() => onHoverCheckpoint?.(null)}
              onClick={() => onSelectCheckpoint?.(cp.id)}
              label={{
                text: String(cp.order),
                color: "#fff",
                fontWeight: "bold",
                fontSize: "11px",
              }}
            />
          ) : null,
        )}

        {!itinerary?.checkpoints?.length &&
          itinerary?.waypoints?.map((wp) =>
            wp.lat !== null && wp.lng !== null ? (
              <MarkerF
                key={`wp-${wp.id}`}
                position={{ lat: wp.lat, lng: wp.lng }}
                label={{
                  text: String(wp.order),
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "11px",
                }}
                title={wp.place_title}
              />
            ) : null,
          )}

        {!parsedTrackPaths &&
          checkpointsPath.length === 0 &&
          waypointPath.length === 0 &&
          endpointMarkers.map((marker) => (
            <MarkerF
              key={marker.id}
              position={marker.position}
              label={{
                text: marker.label,
                color: "#fff",
                fontWeight: "bold",
                fontSize: "11px",
              }}
              title={marker.title}
            />
          ))}

        {/* InfoWindow for hovered checkpoint */}
        {hoveredCheckpointId &&
          (() => {
            const cp = itinerary?.checkpoints?.find(
              (c) => c.id === hoveredCheckpointId,
            );
            if (!cp || cp.lat === null || cp.lng === null) {
              return null;
            }

            return (
              <InfoWindowF
                position={{ lat: cp.lat, lng: cp.lng }}
                options={{
                  disableAutoPan: true,
                  pixelOffset: new window.google.maps.Size(0, -35),
                }}
              >
                <div className="p-2 min-w-[180px]">
                  <p className="font-bold text-slate-900 text-sm mb-1">
                    {cp.order}. {cp.title}
                  </p>
                  {cp.description && (
                    <p className="text-xs text-slate-500">{cp.description}</p>
                  )}
                </div>
              </InfoWindowF>
            );
          })()}
      </MapContainer>
    </div>
  );
};
