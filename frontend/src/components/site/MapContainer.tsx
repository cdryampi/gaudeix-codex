import { ReactNode, useMemo } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  GoogleMapProps,
} from "@react-google-maps/api";
import { MapPin } from "lucide-react";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as
  | string
  | undefined;

export const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#dadada" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c9c9c9" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
];

export const DEFAULT_CENTER = { lat: 41.5262, lng: 2.3933 };

interface MapContainerProps extends GoogleMapProps {
  children?: ReactNode;
  className?: string;
}

export function MapContainer({
  children,
  className,
  ...props
}: MapContainerProps) {
  if (!GOOGLE_MAPS_API_KEY) {
    return <MapFallback className={className} />;
  }

  return (
    <LoadedMapContainer className={className} {...props}>
      {children}
    </LoadedMapContainer>
  );
}

function LoadedMapContainer({
  children,
  className,
  ...props
}: MapContainerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "gaudeix-google-maps",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY as string,
  });

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      clickableIcons: false,
      styles: MAP_STYLES,
      ...props.options,
    }),
    [props.options],
  );

  if (loadError) {
    return <MapFallback className={className} />;
  }

  if (!isLoaded) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-900 text-slate-500 animate-pulse ${className}`}
      >
        <div className="text-center">
          <div className="h-2 w-24 bg-slate-800 rounded-full mx-auto mb-4" />
          <p className="font-bold uppercase tracking-widest text-[10px] opacity-40">
            Iniciando motor de mapas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <GoogleMap
        mapContainerClassName="h-full w-full"
        center={DEFAULT_CENTER}
        zoom={14}
        {...props}
        options={mapOptions}
      >
        {children}
      </GoogleMap>
    </div>
  );
}

function MapFallback({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-slate-900 text-slate-500 ${className}`}
    >
      <div className="text-center px-10">
        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p className="font-bold uppercase tracking-widest text-[10px]">
          Mapa no disponible
        </p>
      </div>
    </div>
  );
}
