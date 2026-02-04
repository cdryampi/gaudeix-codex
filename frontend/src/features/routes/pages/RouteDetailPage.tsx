/**
 * RouteDetailPage - Detailed view for a single route with map, stats, and gallery.
 */

import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";

import { getRouteBySlug } from "../api";
import { getDifficultyConfig, getRouteTypeConfig } from "../constants";

export const RouteDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const {
    data: route,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["route", slug],
    queryFn: () => getRouteBySlug(slug!),
    enabled: !!slug,
  });

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
      {/* Hero Section with Image */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
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

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-20">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 md:top-12 md:left-20 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>

          {/* Badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div
              className={`flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white`}
            >
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
      </section>

      {/* Stats Bar */}
      <section className="bg-slate-950 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {route.distance_km && (
              <div className="flex items-center gap-3 text-white">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Mountain className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-black">
                    {route.distance_km.toFixed(1)} km
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                    Distancia
                  </div>
                </div>
              </div>
            )}

            {route.duration_formatted && (
              <div className="flex items-center gap-3 text-white">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Timer className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-black">
                    {route.duration_formatted}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                    Duración
                  </div>
                </div>
              </div>
            )}

            {route.elevation_gain && (
              <div className="flex items-center gap-3 text-white">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <ArrowUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-black">
                    +{route.elevation_gain}m
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                    Desnivel +
                  </div>
                </div>
              </div>
            )}

            {route.elevation_loss && (
              <div className="flex items-center gap-3 text-white">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <ArrowDown className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <div className="text-2xl font-black">
                    -{route.elevation_loss}m
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                    Desnivel -
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
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

            {/* Instructions */}
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

            {/* Waypoints */}
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
                            {waypoint.distance_from_previous_km.toFixed(1)} km
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

            {/* Map Placeholder */}
            {route.track_geojson && (
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-6">
                  Mapa del Recorrido
                </h2>
                <div className="aspect-video rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">
                      Mapa interactivo del recorrido
                    </p>
                    <p className="text-sm text-slate-300 mt-1">
                      (Próximamente disponible)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Gallery */}
            {route.gallery && route.gallery.length > 0 && (
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-6">
                  Galería ({route.gallery.length} fotos)
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
            {/* Quick Actions */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">
                Acciones
              </h3>
              <div className="space-y-4">
                {googleMapsUrl && (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-primary transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir en Google Maps
                  </a>
                )}

                {route.gpx_file && (
                  <a
                    href={route.gpx_file.file}
                    download
                    className="flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-white border-2 border-slate-200 text-slate-900 text-xs font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Descargar GPX
                  </a>
                )}
              </div>
            </div>

            {/* Attachments */}
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

            {/* Tags */}
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
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Back to Routes CTA */}
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
    </main>
  );
};
