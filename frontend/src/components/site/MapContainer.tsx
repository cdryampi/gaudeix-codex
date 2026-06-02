import { ReactNode, useMemo, useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  GoogleMapProps,
} from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import { Place } from "@/features/places/types";

/* eslint-disable react-refresh/only-export-components */

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
  places?: Place[];
}

export function MapContainer({
  children,
  className,
  places = [],
  ...props
}: MapContainerProps) {
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (GOOGLE_MAPS_API_KEY) return;

    // Comprobar si Leaflet ya está cargado globalmente
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    const cssId = "leaflet-cdn-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const jsId = "leaflet-cdn-js";
    if (!document.getElementById(jsId)) {
      const script = document.createElement("script");
      script.id = jsId;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => setLeafletLoaded(true);
      document.body.appendChild(script);
    } else {
      const script = document.getElementById(jsId) as HTMLScriptElement;
      if (script) {
        script.addEventListener("load", () => setLeafletLoaded(true));
      }
    }
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !places || GOOGLE_MAPS_API_KEY) return;

    const L = (window as any).L;
    if (!L) return;

    const container = mapRef.current;
    if (!container) return;

    // Evitar inicializar el mapa múltiples veces sobre el mismo elemento
    if ((container as any)._leaflet_id) {
      return;
    }

    const mapCenter = props.center || DEFAULT_CENTER;
    const leafletMap = L.map(container, {
      zoomControl: true,
    }).setView([mapCenter.lat, mapCenter.lng], props.zoom || 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(leafletMap);

    const CATEGORY_COLORS: Record<string, string> = {
      restaurants: "#f97316",
      accommodations: "#3b82f6",
      nature: "#22c55e",
      culture: "#a855f7",
      heritage: "#64748b",
      beaches: "#06b6d4",
      sports: "#ec4899",
    };

    // Marcador municipal de Cabrera de Mar
    const mainIcon = L.divIcon({
      className: "custom-leaflet-marker-main",
      html: `<div style="background-color: #00f2ea; width: 16px; height: 16px; border: 4px solid #ffffff; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    L.marker([mapCenter.lat, mapCenter.lng], { icon: mainIcon })
      .addTo(leafletMap)
      .bindPopup(
        `<strong style="font-family: var(--font-interface); font-size: 12px;">Cabrera de Mar</strong>`,
      );

    // Marcadores dinámicos de los lugares (places)
    places.forEach((place) => {
      if (!place.latitude || !place.longitude) return;

      const themeColor = CATEGORY_COLORS[place.template_key || ""] || "#94a3b8";

      const markerHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${themeColor}" stroke="#ffffff" stroke-width="2" style="width: 28px; height: 28px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15));">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        </svg>
      `;

      const icon = L.divIcon({
        className: "custom-leaflet-marker",
        html: markerHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      });

      const mediaUrl =
        place.featured_media?.variant_medium || place.featured_media?.file;
      const popupContent = `
        <div style="font-family: var(--font-interface); width: 240px; overflow: hidden; padding: 2px;" class="text-slate-900 leading-tight">
          ${
            mediaUrl
              ? `<img src="${mediaUrl}" alt="${place.title}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />`
              : ""
          }
          <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; margin-bottom: 2px;">
            ${place.template_key || "Lugar"}
          </div>
          <h4 style="font-size: 14px; font-weight: 700; margin: 0 0 4px 0; color: #0f172a;">${place.title}</h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0;">${place.location_text || ""}</p>
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.title} ${place.location_text}`)}" target="_blank" style="flex: 1; text-align: center; text-decoration: none; background-color: #f1f5f9; color: #475569; padding: 8px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase;">
              Abrir
            </a>
            <a href="/lugares/${place.slug}" style="flex: 1; text-align: center; text-decoration: none; background-color: #0f4c81; color: #ffffff; padding: 8px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase;">
              Detalles
            </a>
          </div>
        </div>
      `;

      L.marker([Number(place.latitude), Number(place.longitude)], { icon })
        .addTo(leafletMap)
        .bindPopup(popupContent);
    });

    return () => {
      leafletMap.remove();
    };
  }, [leafletLoaded, places, props.center, props.zoom]);

  if (!GOOGLE_MAPS_API_KEY) {
    if (!leafletLoaded) {
      return (
        <div
          className={`flex items-center justify-center bg-background-light text-text-secondary border border-border-soft transition-colors duration-400 ${className}`}
        >
          <div className="text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-20 animate-bounce" />
            <p className="font-bold uppercase tracking-widest text-[10px] opacity-40">
              Iniciando motor de mapas libre...
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={mapRef}
        className={`bg-background-light border border-border-soft transition-colors duration-400 overflow-hidden ${className}`}
        style={{ height: "100%", width: "100%", minHeight: "300px" }}
      />
    );
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
