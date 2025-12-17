import { useMemo, useState } from "react";
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from "@react-google-maps/api";

// Configura la clave en `frontend/.env.local` como `VITE_GOOGLE_MAPS_API_KEY=...` (Vite solo expone variables con prefijo `VITE_`).
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

const CABRERA_DE_MAR = { lat: 41.5262, lng: 2.3933 };

export function InteractiveMap() {
  const [infoOpen, setInfoOpen] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "gaudeix-google-maps",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY ?? "",
  });

  const center = useMemo(() => CABRERA_DE_MAR, []);

  if (!GOOGLE_MAPS_API_KEY || loadError) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center rounded-2xl border border-gray-200 bg-white text-sm text-gray-600 shadow-sm md:h-[420px]">
        No se pudo cargar el mapa
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center rounded-2xl border border-gray-200 bg-white text-sm text-gray-600 shadow-sm md:h-[420px]">
        Cargando mapa...
      </div>
    );
  }

  return (
    <div className="h-[360px] w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:h-[420px]">
      <GoogleMap
        mapContainerClassName="h-full w-full"
        center={center}
        zoom={14}
        options={{
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          clickableIcons: false,
        }}
        onClick={() => setInfoOpen(false)}
      >
        <MarkerF position={center} title="Cabrera de Mar" onClick={() => setInfoOpen(true)} />
        {infoOpen ? (
          <InfoWindowF position={center} onCloseClick={() => setInfoOpen(false)}>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-900">Cabrera de Mar</p>
              <p className="text-xs text-gray-600">Ajuntament de Cabrera de Mar</p>
            </div>
          </InfoWindowF>
        ) : null}
      </GoogleMap>
    </div>
  );
}

