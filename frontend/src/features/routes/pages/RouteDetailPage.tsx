/**
 * RouteDetailPage — Detailed view for a single route.
 *
 * Hybrid layout (Stitch Screens 2+3):
 *   Desktop: Hero → Stats bar → Split Map+Itinerary → Content → CTA
 *   Mobile:  Hero → Swipeable pills → Map → Carousel → Content → Sticky bar
 */

import { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MarkerF, PolylineF, InfoWindowF } from "@react-google-maps/api";
import {
  ArrowLeft,
  Timer,
  Mountain,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Download,
  MapPin,
  FileText,
  ChevronRight,
  ExternalLink,
  Image,
  Navigation,
  Bookmark,
} from "lucide-react";

import { GuidedAppBanner } from "../components/GuidedAppBanner";

import { getRouteBySlug, getRouteItinerary } from "../api";
import { getDifficultyConfig, getRouteTypeConfig } from "../constants";
import { MapContainer, DEFAULT_CENTER } from "@/components/site/MapContainer";

export const RouteDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [hoveredCheckpointId, setHoveredCheckpointId] = useState<number | null>(
    null,
  );

  const {
    data: route,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["route", slug],
    queryFn: () => getRouteBySlug(slug!),
    enabled: !!slug,
  });

  const { data: itinerary } = useQuery({
    queryKey: ["route-itinerary", slug],
    queryFn: () => getRouteItinerary(slug!),
    enabled: !!slug,
  });

  const polylinePath = useMemo(() => {
    if (!itinerary?.checkpoints) return [];
    return itinerary.checkpoints
      .filter((cp) => cp.lat !== null && cp.lng !== null)
      .map((cp) => ({ lat: cp.lat as number, lng: cp.lng as number }));
  }, [itinerary]);

  const mapCenter = useMemo(() => {
    if (itinerary?.bounds) {
      return {
        lat: (itinerary.bounds.north + itinerary.bounds.south) / 2,
        lng: (itinerary.bounds.east + itinerary.bounds.west) / 2,
      };
    }
    if (route?.start_latitude && route?.start_longitude) {
      return {
        lat: Number(route.start_latitude),
        lng: Number(route.start_longitude),
      };
    }
    return DEFAULT_CENTER;
  }, [itinerary, route]);

  const renderedMarkers = useMemo(() => {
    if (!itinerary?.checkpoints) return null;
    return itinerary.checkpoints.map((cp) =>
      cp.lat && cp.lng ? (
        <MarkerF
          key={cp.id}
          position={{ lat: cp.lat, lng: cp.lng }}
          onMouseOver={() => setHoveredCheckpointId(cp.id)}
          onMouseOut={() => setHoveredCheckpointId(null)}
          label={{
            text: String(cp.order),
            color: "#fff",
            fontWeight: "bold",
            fontSize: "11px",
          }}
        />
      ) : null,
    );
  }, [itinerary?.checkpoints]);

  const hasCheckpoints = itinerary?.checkpoints && itinerary.checkpoints.length > 0;

  // ---------- Loading ----------
  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="h-[60vh] bg-slate-100 animate-pulse" />
        <div className="container mx-auto px-6 py-20">
          <div className="h-12 w-1/2 bg-slate-100 animate-pulse rounded-xl mb-8" />
          <div className="h-6 w-3/4 bg-slate-100 animate-pulse rounded-lg" />
        </div>
      </main>
    );
  }

  // ---------- Error ----------
  if (error || !route) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Mountain className="h-20 w-20 text-slate-200 mx-auto mb-8" />
          <h1 className="text-4xl font-black text-slate-900 mb-4">
            Ruta no encontrada
          </h1>
          <p className="text-slate-500 mb-8">
            La ruta que buscas no existe o ha sido eliminada.
          </p>
          <Link
            to="/rutas"
            className="inline-flex items-center gap-2 h-14 px-8 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Ver todas las rutas
          </Link>
        </div>
      </main>
    );
  }

  const difficultyConfig = getDifficultyConfig(route.difficulty);
  const routeTypeConfig = getRouteTypeConfig(route.route_type);
  const RouteTypeIcon = routeTypeConfig.icon;

  const googleMapsUrl =
    route.start_latitude && route.start_longitude
      ? `https://www.google.com/maps/search/?api=1&query=${route.start_latitude},${route.start_longitude}`
      : null;

  return (
    <main className="min-h-screen bg-white">
      {/* ─── HERO IMAGE ─── */}
      <section className="relative min-h-[50vh] md:min-h-[60vh] flex flex-col overflow-hidden">
        <img
          src={
            route.featured_media?.variant_large ||
            route.featured_media?.file ||
            route.image_url ||
            "/placeholder-route.jpg"
          }
          alt={route.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

        <div className="relative z-10 flex-1 flex flex-col p-6 pt-56 md:p-20 md:pt-48">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex self-start items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white transition-colors mb-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>

          <div className="mt-8">
            {/* Badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white">
                <RouteTypeIcon className="h-3.5 w-3.5" />
                {routeTypeConfig.label}
              </div>
              <div
                className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest ${difficultyConfig.bgColor} ${difficultyConfig.textColor}`}
              >
                {difficultyConfig.label}
              </div>
              {route.is_circular && (
                <div className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white">
                  <RotateCcw className="h-3 w-3" />
                  Circular
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight max-w-4xl">
              {route.title}
            </h1>

            {route.summary && (
              <p className="text-xl md:text-2xl text-white/70 mt-4 max-w-2xl font-medium">
                {route.summary}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="bg-slate-950">
        {/* Mobile: swipeable stat pills (Screen 3) */}
        <div className="lg:hidden overflow-x-auto py-5 px-6 scrollbar-hide">
          <div className="flex gap-3 min-w-max">
            {route.distance_km && (
              <div className="flex flex-col items-center px-5 py-3 rounded-2xl bg-white/10 min-w-[90px]">
                <Mountain className="h-4 w-4 text-accent mb-1" />
                <span className="text-lg font-black text-white">{Number(route.distance_km).toFixed(1)} km</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">Distància</span>
              </div>
            )}
            {route.duration_formatted && (
              <div className="flex flex-col items-center px-5 py-3 rounded-2xl bg-white/10 min-w-[90px]">
                <Timer className="h-4 w-4 text-accent mb-1" />
                <span className="text-lg font-black text-white">{route.duration_formatted}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">Duració</span>
              </div>
            )}
            {route.elevation_gain && (
              <div className="flex flex-col items-center px-5 py-3 rounded-2xl bg-white/10 min-w-[90px]">
                <ArrowUp className="h-4 w-4 text-green-400 mb-1" />
                <span className="text-lg font-black text-white">+{route.elevation_gain}m</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">Desnivell +</span>
              </div>
            )}
            {route.elevation_loss && (
              <div className="flex flex-col items-center px-5 py-3 rounded-2xl bg-white/10 min-w-[90px]">
                <ArrowDown className="h-4 w-4 text-red-400 mb-1" />
                <span className="text-lg font-black text-white">-{route.elevation_loss}m</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">Desnivell -</span>
              </div>
            )}
          </div>
        </div>

        {/* Desktop: classic stats bar */}
        <div className="hidden lg:block py-8">
          <div className="container mx-auto px-6">
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {route.distance_km && (
                <div className="flex items-center gap-3 text-white">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Mountain className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-black">{Number(route.distance_km).toFixed(1)} km</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Distancia</div>
                  </div>
                </div>
              )}
              {route.duration_formatted && (
                <div className="flex items-center gap-3 text-white">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Timer className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-black">{route.duration_formatted}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Duración</div>
                  </div>
                </div>
              )}
              {route.elevation_gain && (
                <div className="flex items-center gap-3 text-white">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <ArrowUp className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-black">+{route.elevation_gain}m</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Desnivel +</div>
                  </div>
                </div>
              )}
              {route.elevation_loss && (
                <div className="flex items-center gap-3 text-white">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <ArrowDown className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-black">-{route.elevation_loss}m</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Desnivel -</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAP + ITINERARY (side-by-side on desktop) ─── */}
      <section className="container mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Map (3/5) — sticky on desktop */}
          <div className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-4 lg:mb-6">
              Mapa del Recorrido
            </h2>
            <div className="aspect-[4/3] lg:aspect-auto lg:h-[450px] rounded-2xl lg:rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 relative shadow-sm">
              {hasCheckpoints ? (
                <MapContainer
                  className="w-full h-full"
                  center={mapCenter}
                  zoom={13}
                  options={{
                    mapTypeControl: true,
                    streetViewControl: false,
                    fullscreenControl: true,
                  }}
                >
                  {/* Polyline */}
                  {polylinePath.length > 1 && (
                    <PolylineF
                      path={polylinePath}
                      options={{
                        strokeColor: "#e8a317",
                        strokeOpacity: 0.9,
                        strokeWeight: 4,
                      }}
                    />
                  )}

                  {/* Checkpoint markers with numbers */}
                  {renderedMarkers}

                  {/* InfoWindow */}
                  {hoveredCheckpointId && (() => {
                    const cp = itinerary!.checkpoints.find(
                      (c) => c.id === hoveredCheckpointId,
                    );
                    return cp?.lat && cp?.lng ? (
                      <InfoWindowF
                        position={{ lat: cp.lat, lng: cp.lng }}
                        options={{ disableAutoPan: true }}
                      >
                        <div className="p-2 min-w-[180px]">
                          <p className="font-bold text-slate-900 text-sm mb-1">
                            {cp.order}. {cp.title}
                          </p>
                          {cp.description && (
                            <p className="text-xs text-slate-500">
                              {cp.description}
                            </p>
                          )}
                        </div>
                      </InfoWindowF>
                    ) : null;
                  })()}
                </MapContainer>
              ) : (
                /* Fallback: static placeholder */
                <div className="h-full flex items-center justify-center bg-slate-50">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">
                      Mapa interactivo no disponible
                    </p>
                    <p className="text-sm text-slate-300 mt-1">
                      Sin puntos de paso configurados
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons (below map, compact row) */}
            <div className="flex gap-3 mt-4">
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Navegar
                </a>
              )}
              {route.gpx_file && (
                <a
                  href={route.gpx_file.file}
                  download
                  className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-white border-2 border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  GPX
                </a>
              )}
              {!route.gpx_file && googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-white border-2 border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Maps
                </a>
              )}
            </div>
          </div>

          {/* Mobile: Checkpoint carousel (Screen 3) */}
          {hasCheckpoints && (
            <div className="lg:hidden col-span-full">
              <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-4">
                Itinerario
              </h2>
              <div className="overflow-x-auto -mx-6 px-6 scrollbar-hide">
                <div className="flex gap-4 min-w-max pb-2">
                  {itinerary!.checkpoints.map((cp) => (
                    <div
                      key={cp.id}
                      className="w-48 shrink-0 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm"
                    >
                      {cp.image_url ? (
                        <img
                          src={cp.image_url}
                          alt={cp.title}
                          className="w-full h-28 object-cover"
                        />
                      ) : (
                        <div className="w-full h-28 bg-slate-100 flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-slate-300" />
                        </div>
                      )}
                      <div className="p-3">
                        <span className="text-xs font-black text-primary">{cp.order}.</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5 leading-tight">{cp.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Desktop: Itinerary sidebar (2/5) */}
          <div className="hidden lg:block lg:col-span-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-6">
              Itinerario
            </h2>

            {hasCheckpoints ? (
              <div className="space-y-0">
                {itinerary!.checkpoints.map((cp, idx) => (
                  <div
                    key={cp.id}
                    className="flex gap-4 group cursor-pointer"
                    onMouseEnter={() => setHoveredCheckpointId(cp.id)}
                    onMouseLeave={() => setHoveredCheckpointId(null)}
                  >
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors ${hoveredCheckpointId === cp.id
                          ? "bg-primary text-white"
                          : "bg-slate-900 text-white"
                          }`}
                      >
                        {cp.order}
                      </div>
                      {idx < itinerary!.checkpoints.length - 1 && (
                        <div className="w-0.5 flex-1 bg-slate-200 my-1" />
                      )}
                    </div>

                    {/* Content — horizontal card layout on desktop */}
                    <div className="pb-6 flex-1">
                      <p
                        className={`font-bold text-sm transition-colors ${hoveredCheckpointId === cp.id
                          ? "text-primary"
                          : "text-slate-900"
                          }`}
                      >
                        {cp.title}
                      </p>
                      {cp.image_url && (
                        <div className="mt-2 mb-1.5 flex gap-3">
                          <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0 shadow-sm">
                            <img
                              src={cp.image_url}
                              alt={cp.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          {cp.description && (
                            <p className="text-xs text-slate-500 leading-relaxed flex-1">
                              {cp.description}
                            </p>
                          )}
                        </div>
                      )}
                      {!cp.image_url && cp.description && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {cp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center">
                <MapPin className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400">
                  No hay itinerario configurado para esta ruta.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── CONTENT ─── */}
      <section className="container mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* App Banner (if any URLs present) */}
            {(route.ios_app_url || route.android_app_url) && (
              <div className="animate-fade-in -mt-4">
                <GuidedAppBanner
                  iosUrl={route.ios_app_url}
                  androidUrl={route.android_app_url}
                />
              </div>
            )}

            {route.description && (
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-6">
                  Descripción
                </h2>
                <div
                  className="prose prose-lg max-w-none text-slate-600"
                  dangerouslySetInnerHTML={{ __html: route.description }}
                />
              </div>
            )}

            {route.instructions && (
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-6">
                  Instrucciones
                </h2>
                <div
                  className="prose prose-lg max-w-none text-slate-600"
                  dangerouslySetInnerHTML={{ __html: route.instructions }}
                />
              </div>
            )}

            {route.waypoints_list && route.waypoints_list.length > 0 && (
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-6">
                  Puntos de Interés ({route.waypoints_list.length})
                </h2>
                <div className="space-y-4">
                  {route.waypoints_list.map((waypoint, index) => (
                    <div
                      key={waypoint.id}
                      className="flex items-start gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-black shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <Link
                          to={`/lugares/${waypoint.place_slug}`}
                          className="text-lg font-bold text-slate-900 hover:text-primary transition-colors"
                        >
                          {waypoint.place_title}
                        </Link>
                        {waypoint.instructions && (
                          <p className="text-sm text-slate-500 mt-1">
                            {waypoint.instructions}
                          </p>
                        )}
                        {waypoint.distance_from_previous_km && (
                          <p className="text-xs text-slate-400 mt-2">
                            {Number(waypoint.distance_from_previous_km).toFixed(1)} km
                            desde el punto anterior
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {route.gallery && route.gallery.length > 0 && (
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-6">
                  Galería ({route.gallery.length} fotos)
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {route.gallery.map((image) => (
                    <a
                      key={image.id}
                      href={image.variant_large || image.file}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100"
                    >
                      <img
                        src={image.variant_medium || image.file}
                        alt={image.title || "Foto de la ruta"}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Image className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {route.attachments && route.attachments.length > 0 && (
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">
                  Documentos
                </h3>
                <div className="space-y-3">
                  {route.attachments.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.file}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100 hover:border-primary/30 transition-colors group"
                    >
                      <FileText className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                      <span className="text-sm font-bold text-slate-700 group-hover:text-primary flex-1 truncate">
                        {doc.title}
                      </span>
                      <Download className="h-4 w-4 text-slate-300" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {route.tags && route.tags.length > 0 && (
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">
                  Etiquetas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {route.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600"
                    >
                      {tag.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── BACK CTA ─── */}
      <section className="bg-slate-950 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-8">
            ¿Quieres explorar más rutas?
          </h2>
          <Link
            to="/rutas"
            className="inline-flex items-center gap-3 h-16 px-12 rounded-[2rem] bg-accent text-slate-900 text-xs font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform"
          >
            Ver todas las rutas
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ─── STICKY MOBILE ACTION BAR (Screen 3) ─── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 flex gap-3">
        {googleMapsUrl && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-colors"
          >
            <Navigation className="h-4 w-4" />
            Iniciar Navegación
          </a>
        )}
        <button
          className="h-12 w-12 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-colors shrink-0"
          title="Guardar ruta"
        >
          <Bookmark className="h-5 w-5" />
        </button>
      </div>
      {/* Spacer for sticky bar */}
      <div className="lg:hidden h-20" />
    </main>
  );
};
