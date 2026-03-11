import { useMemo, useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MarkerF,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import {
  MapPin,
  Navigation,
  Car,
  Train,
  Bus,
  Plane,
  Clock,
  Info,
  ExternalLink,
  LocateFixed,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getSiteSettings } from "../api";
import { MapContainer } from "@/components/site/MapContainer";
import { useLocationStore } from "../locationStore";

export const HowToGetHere = () => {
  const [directionsResponse, setDirectionsResponse] =
    useState<google.maps.DirectionsResult | null>(null);
  const [travelMode, setTravelMode] = useState<string>("DRIVING");

  const userLocation = useLocationStore((state) => state.userLocation);
  const isLocating = useLocationStore((state) => state.isLocating);
  const permissionStatus = useLocationStore((state) => state.permissionStatus);
  const requestLocation = useLocationStore((state) => state.requestLocation);
  const checkPermission = useLocationStore((state) => state.checkPermission);

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSiteSettings,
  });

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const center = useMemo(
    () => ({
      lat: Number(settings?.latitude) || 41.5262,
      lng: Number(settings?.longitude) || 2.3933,
    }),
    [settings],
  );

  const handleGetLocation = async () => {
    try {
      setDirectionsResponse(null);
      await requestLocation();
    } catch (err) {
      console.error("Failed to get location", err);
    }
  };

  const directionsCallback = useCallback(
    (res: google.maps.DirectionsResult | null, status: string) => {
      if (res !== null && status === "OK") {
        setDirectionsResponse(res);
      }
    },
    [],
  );

  if (settingsLoading)
    return (
      <div className="h-96 w-full animate-pulse bg-slate-100 rounded-[3rem]" />
    );

  const destinationString = `${center.lat},${center.lng}`;

  const transportModes = [
    {
      id: "car",
      label: "Coche",
      icon: Car,
      time: "30 min",
      mode: "DRIVING",
      description:
        "Desde Barcelona vía C-32 (salida 9) o N-II. Parking gratuito en el centro.",
      url: `https://www.google.com/maps/dir/?api=1&destination=${destinationString}&travelmode=driving`,
    },
    {
      id: "train",
      label: "Tren (Rodalies R1)",
      icon: Train,
      time: "45 min",
      mode: "TRANSIT",
      description:
        "Línea R1 (Molins de Rei / L'Hospitalet - Maçanet-Massanes). Parada Cabrera-Vilassar.",
      url: `https://www.google.com/maps/dir/?api=1&destination=${destinationString}&travelmode=transit`,
    },
    {
      id: "bus",
      label: "Autobús",
      icon: Bus,
      time: "40 min",
      mode: "TRANSIT",
      description:
        "Líneas interurbanas nocturnas N80 y diurnas conectando con el Maresme.",
      url: `https://www.google.com/maps/dir/?api=1&destination=${destinationString}&travelmode=transit`,
    },
    {
      id: "airport",
      label: "Aeropuerto (BCN)",
      icon: Plane,
      time: "45-60 min",
      mode: "DRIVING",
      description:
        "Desde El Prat: Tren R2 Norte hasta Sants y transbordo a R1, o vía C-32 en coche.",
      url: `https://www.google.com/maps/dir/Aeropuerto+de+Barcelona-El+Prat+(BCN),+08820+El+Prat+de+Llobregat,+Barcelona/${destinationString}/?api=1`,
    },
  ];

  const currentRoute = directionsResponse?.routes[0]?.legs[0];

  return (
    <div className="space-y-24">
      {/* 1. Intro Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary">
            <Info className="h-3 w-3" />
            Guía de llegada interactiva
          </div>
          <h3 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-slate-900 italic leading-[0.85]">
            Tu viaje a <br />
            <span className="text-primary">Cabrera de Mar</span>
          </h3>
          <p className="text-2xl text-slate-500 font-bold leading-snug tracking-tight">
            Calcula tu ruta personalizada en tiempo real usando tu ubicación
            actual.
          </p>
        </div>

        <button
          onClick={handleGetLocation}
          disabled={isLocating}
          className={`group flex items-center gap-4 px-10 py-6 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 disabled:opacity-50 ${
            permissionStatus === "denied"
              ? "bg-red-50 text-red-600 border border-red-100"
              : "bg-slate-900 text-white hover:bg-primary"
          }`}
        >
          {isLocating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : permissionStatus === "denied" ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <LocateFixed className="h-5 w-5" />
          )}
          {isLocating
            ? "Localizando..."
            : permissionStatus === "denied"
              ? "Ubicación bloqueada"
              : "Usar mi ubicación"}
        </button>
      </div>

      {/* 2. Transport Modes & Route Info */}
      <div className="space-y-8">
        {currentRoute && (
          <div className="bg-primary text-white p-10 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-8">
              <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                <Navigation className="h-10 w-10 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">
                  Ruta calculada
                </p>
                <h4 className="text-3xl font-black tracking-tighter leading-none">
                  {currentRoute.distance?.text} — {currentRoute.duration?.text}
                </h4>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setDirectionsResponse(null)}
                className="px-8 py-4 rounded-full bg-black/20 text-[10px] font-black uppercase tracking-widest hover:bg-black/40 transition-colors"
              >
                Limpiar ruta
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full">
          {transportModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                setTravelMode(mode.mode);
                if (userLocation) setDirectionsResponse(null);
                else window.open(mode.url, "_blank");
              }}
              className={`group flex flex-col justify-between text-left gap-8 p-10 rounded-[3rem] border transition-all duration-500 hover:-translate-y-2 ${
                userLocation && travelMode === mode.mode
                  ? "bg-white border-primary shadow-2xl ring-4 ring-primary/5"
                  : "bg-slate-50 border-slate-100 shadow-sm hover:shadow-xl hover:bg-white hover:border-primary/20"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-[1.2rem] shadow-sm transition-all duration-500 ${
                    userLocation && travelMode === mode.mode
                      ? "bg-primary text-white"
                      : "bg-white text-slate-400 group-hover:bg-primary group-hover:text-white"
                  }`}
                >
                  <mode.icon className="h-8 w-8" />
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 font-black text-[10px] uppercase tracking-widest bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-50">
                  <Clock className="h-3.5 w-3.5 text-primary/40" />
                  {mode.time}
                </div>
              </div>

              <div className="space-y-3">
                <h4
                  className={`text-2xl font-black uppercase tracking-tight transition-colors ${
                    userLocation && travelMode === mode.mode
                      ? "text-primary"
                      : "text-slate-900 group-hover:text-primary"
                  }`}
                >
                  {mode.label}
                </h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  {mode.description}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                {userLocation ? "Ver en el mapa" : "Trazar ruta"}
                <Navigation className="h-3.5 w-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Map Section */}
      <div className="space-y-8 w-full">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h4 className="text-2xl font-black uppercase tracking-tighter text-slate-900">
              Visualización{" "}
              <span className="text-slate-300 italic">En Vivo</span>
            </h4>
          </div>
          {userLocation && (
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <LocateFixed className="h-3 w-3" /> Ubicación activa
            </div>
          )}
        </div>

        <MapContainer
          className="relative h-[750px] w-full rounded-[4rem] overflow-hidden shadow-3xl border border-slate-100 group"
          center={center}
        >
          {/* Route Logic - Only render if google is loaded */}
          {window.google && userLocation && !directionsResponse && (
            <DirectionsService
              options={{
                origin: userLocation,
                destination: center,
                travelMode: travelMode as google.maps.TravelMode,
              }}
              callback={directionsCallback}
            />
          )}

          {window.google && directionsResponse && (
            <DirectionsRenderer
              options={{
                directions: directionsResponse,
                suppressMarkers: false,
                polylineOptions: {
                  strokeColor: "#00f2ea",
                  strokeOpacity: 0.8,
                  strokeWeight: 6,
                },
              }}
            />
          )}

          {window.google?.maps?.SymbolPath && !directionsResponse && (
            <MarkerF
              position={center}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: "#00f2ea",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 4,
                scale: 14,
              }}
            />
          )}

          <div className="absolute top-10 right-10 z-10 flex flex-col gap-4">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 bg-white text-slate-900 px-10 py-5 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all border border-slate-100"
            >
              <ExternalLink className="h-4 w-4 text-primary" />
              Abrir Externo
            </a>
          </div>
        </MapContainer>
      </div>

      {/* Bottom Accents */}
      <div className="pt-24 border-t border-slate-100">
        <div className="flex flex-wrap gap-x-24 gap-y-12 items-center justify-center grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
          <span className="text-3xl font-black italic tracking-tighter uppercase text-slate-400 tracking-[0.3em]">
            Cabrera de Mar
          </span>
          <div className="h-2 w-2 rounded-full bg-slate-200" />
          <span className="text-3xl font-black italic tracking-tighter uppercase text-slate-400 tracking-[0.3em]">
            Cor del Maresme
          </span>
        </div>
      </div>
    </div>
  );
};
