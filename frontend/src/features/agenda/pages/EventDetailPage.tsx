import { useParams, Link } from "react-router-dom";
import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  Ticket,
  Share2,
  Heart,
  ExternalLink,
  ChevronRight,
  Coins,
  CheckCircle2,
  CloudSun,
} from "lucide-react";
import toast from "react-hot-toast";

import { getEventBySlug, getEvents } from "@/features/events/api";
import { formatDateTime, formatTime } from "@/features/agenda/dateUtils";
import { getNextSession } from "@/features/agenda/utils";
import { useAuthStore } from "@/features/auth/store";
import { apiPost, apiDelete } from "@/lib/api";
import { EventCard } from "@/features/agenda/components/EventCard";
import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";

export function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // 1. Fetch main event
  const {
    data: event,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["event", slug],
    queryFn: () => getEventBySlug(slug!),
    enabled: !!slug,
  });

  // 2. Fetch related events (same category)
  const { data: relatedData } = useQuery({
    queryKey: ["events", "related", event?.category_slug],
    queryFn: () => getEvents({ category: event?.category_slug, limit: 4 }),
    enabled: !!event?.category_slug,
  });

  const relatedEvents = (
    Array.isArray(relatedData) ? relatedData : relatedData?.results || []
  )
    .filter((e) => e.slug !== slug)
    .slice(0, 3);

  // 3. Mutation for Favorite
  const favoriteMutation = useMutation({
    mutationFn: () => {
      if (event?.is_favorited) {
        return apiDelete(`/events/${slug}/favorite/`);
      }
      return apiPost(`/events/${slug}/favorite/`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", slug] });
      toast.success(
        event?.is_favorited ? "Eliminado de favoritos" : "Añadido a favoritos",
      );
    },
    onError: () => {
      toast.error("Error al procesar favoritos");
    },
  });

  // 4. Mutation for Check-in
  const checkinMutation = useMutation({
    mutationFn: () => apiPost(`/events/${slug}/checkin/`, {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["event", slug] });
      toast.success(
        `¡Check-in realizado! Has ganado ${data.checkin?.points_awarded || 20} puntos.`,
      );
    },
    onError: (err: any) => {
      toast.error(err.detail || "No se ha podido realizar el check-in");
    },
  });

  // Social Share Logic
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.summary,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  // Calendar Logic
  const handleAddToCalendar = () => {
    if (!event) return;
    const start = new Date(event.start_at)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");
    const end = event.end_at
      ? new Date(event.end_at).toISOString().replace(/-|:|\.\d\d\d/g, "")
      : new Date(new Date(event.start_at).getTime() + 2 * 60 * 60 * 1000)
          .toISOString()
          .replace(/-|:|\.\d\d\d/g, "");

    const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.summary)}&location=${encodeURIComponent(event.venue_name)}&sf=true&output=xml`;
    window.open(googleUrl, "_blank");
  };

  const mapUrl = useMemo(() => {
    if (!event) return "";
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue_name} ${event.location_text}`)}`;
  }, [event]);

  const nextSession = useMemo(() => {
    if (!event?.dates) return null;
    return getNextSession(event.dates);
  }, [event?.dates]);

  if (loading) return <EventDetailSkeleton />;

  if (error || !event) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-gray-50 p-4">
        <p className="text-lg text-gray-600">
          No se ha podido cargar el evento o no existe.
        </p>
        <Link to="/agenda" className="mt-4 text-primary hover:underline">
          Volver a la agenda
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.start_at);
  const imageUrl =
    event.image_url ||
    event.featured_media?.variant_large ||
    event.featured_media?.file ||
    "/placeholder-event.jpg";

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Hero Image */}
      <div className="relative h-[70vh] w-full overflow-hidden bg-slate-900 md:h-[85vh]">
        <img
          src={imageUrl}
          alt={event.title}
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

        {/* Navigation & Breadcrumbs Overlay */}
        <div className="absolute top-0 left-0 right-0 z-10 pt-32 px-6 md:px-16">
          <div className="container mx-auto">
            <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-12">
              <Link to="/" className="hover:text-white transition-colors">
                Inicio
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link to="/agenda" className="hover:text-white transition-colors">
                Agenda
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-accent truncate max-w-[200px] md:max-w-none">
                {event.title}
              </span>
            </nav>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-12">
              <Link
                to="/agenda"
                className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md transition-all hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a la Agenda
              </Link>

              <button
                onClick={() =>
                  isAuthenticated
                    ? favoriteMutation.mutate()
                    : toast.error("Inicia sesión para guardar favoritos")
                }
                className={`flex h-16 w-16 items-center justify-center rounded-2xl backdrop-blur-md transition-all ${
                  event.is_favorited
                    ? "bg-red-500 text-white shadow-xl shadow-red-500/20"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <Heart
                  className={`h-6 w-6 ${event.is_favorited ? "fill-current" : ""}`}
                />
              </button>
            </div>

            <div className="mb-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-primary px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-primary/20">
                {event.category_name}
              </span>
              {event.is_free && (
                <span className="rounded-full bg-emerald-500 px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-emerald-500/20">
                  Gratis
                </span>
              )}
              {event.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-white/10 px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm border border-white/10"
                >
                  #{tag.name}
                </span>
              ))}
            </div>

            <h1 className="text-6xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-8xl lg:text-9xl max-w-5xl">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto grid gap-16 px-6 py-12 md:grid-cols-12 md:py-32">
        {/* Main Content */}
        <div className="md:col-span-8 space-y-16">
          <div className="prose prose-2xl max-w-none prose-slate">
            <p className="lead text-3xl font-bold text-slate-900 leading-[1.1] border-l-[12px] border-primary pl-10 mb-16 italic tracking-tight">
              {event.summary}
            </p>
            <div
              className="text-slate-600 leading-relaxed space-y-8 text-xl"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </div>

          {/* Gamification Box */}
          <div className="rounded-[4rem] bg-slate-950 p-12 text-white shadow-3xl relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/20 blur-[100px] transition-all group-hover:bg-primary/30" />
            <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-accent/10 blur-[80px]" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
              <div>
                <div className="flex items-center gap-4 text-accent mb-6">
                  <Coins className="h-10 w-10" />
                  <span className="text-4xl font-black italic uppercase tracking-tighter">
                    +{event.points_value} puntos
                  </span>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-3">
                  ¡Participa y sube de nivel!
                </h3>
                <p className="text-slate-400 text-lg max-w-md leading-snug">
                  Consigue puntos de experiencia por asistir a las actividades
                  municipales.
                </p>
              </div>

              <button
                onClick={() =>
                  isAuthenticated
                    ? checkinMutation.mutate()
                    : toast.error("Inicia sesión para realizar check-in")
                }
                disabled={checkinMutation.isPending}
                className="inline-flex items-center justify-center gap-4 rounded-3xl bg-accent px-12 py-6 text-xs font-black uppercase tracking-[0.2em] text-slate-900 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-xl shadow-accent/20"
              >
                {checkinMutation.isPending ? (
                  "Procesando..."
                ) : (
                  <>
                    <CheckCircle2 className="h-6 w-6" />
                    Hacer Check-in
                  </>
                )}
              </button>
            </div>
          </div>

          {event.attachments.length > 0 && (
            <div className="rounded-[3rem] border-2 border-slate-100 bg-slate-50/30 p-12">
              <h3 className="mb-10 text-3xl font-black uppercase tracking-tighter text-slate-900 italic">
                Documentos <span className="text-primary">Oficiales</span>
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                {event.attachments.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.file}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-6 rounded-3xl bg-white p-6 text-sm font-black uppercase tracking-widest text-slate-700 shadow-sm transition-all hover:shadow-xl hover:text-primary border border-slate-100"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors font-black">
                      PDF
                    </div>
                    <span className="flex-1 truncate">{doc.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="md:col-span-4 space-y-8">
          <div className="rounded-[4rem] border border-slate-100 bg-white p-12 shadow-3xl shadow-slate-200/50 sticky top-32">
            <h3 className="mb-12 text-3xl font-black uppercase italic tracking-tighter text-slate-900">
              Logística
            </h3>

            <div className="space-y-12">
              {/* Date */}
              <div className="flex gap-8">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[2rem] bg-puerto-rico-50 text-primary shadow-inner">
                  <Calendar className="h-10 w-10" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
                    Fecha
                  </p>
                  <p className="text-2xl font-black text-slate-900 leading-none">
                    {formatDateTime(event.start_at)}
                  </p>

                  {event.dates.length > 1 && (
                    <div
                      className="mt-6 pt-6 border-t border-slate-100 space-y-4"
                      data-testid="event-sessions-list"
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                        Todas las sesiones
                      </p>
                      {event.dates.map((d) => {
                        const isNext = d.id === nextSession?.id;
                        const isPast =
                          new Date(d.start_at).getTime() < new Date().getTime();
                        return (
                          <div
                            key={d.id}
                            className={`flex items-center gap-3 text-sm font-bold ${
                              isNext
                                ? "text-primary"
                                : isPast
                                  ? "text-slate-300"
                                  : "text-slate-500"
                            }`}
                          >
                            <ChevronRight
                              className={`h-4 w-4 ${isNext ? "text-primary" : "text-slate-300"}`}
                            />
                            {formatDateTime(d.start_at)}
                            {isNext && (
                              <span className="text-[8px] px-2 py-0.5 rounded-full bg-puerto-rico-50">
                                Próxima
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Time */}
              <div className="flex gap-8">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[2rem] bg-puerto-rico-50 text-primary shadow-inner">
                  <Clock className="h-10 w-10" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
                    Horario
                  </p>
                  <p className="text-2xl font-black text-slate-900 leading-none">
                    {formatTime(startDate)} h
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex gap-8">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[2rem] bg-puerto-rico-50 text-primary shadow-inner">
                  <MapPin className="h-10 w-10" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
                    Ubicación
                  </p>
                  <p className="text-2xl font-black text-slate-900 leading-tight mb-2">
                    {event.venue_name}
                  </p>
                  <p className="text-sm font-bold text-slate-500 mb-6">
                    {event.location_text}
                  </p>
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary-dark transition-all group"
                  >
                    Cómo llegar{" "}
                    <ExternalLink className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Price */}
              <div className="flex gap-8">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[2rem] bg-puerto-rico-50 text-primary shadow-inner">
                  <Ticket className="h-10 w-10" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
                    Entrada
                  </p>
                  <p className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
                    {event.is_free
                      ? "Gratuita"
                      : event.price_text || `${event.price} €`}
                  </p>
                </div>
              </div>

              {/* Weather Forecast (Outdoor only) */}
              {event.is_outdoor && event.weather_forecast && (
                <div className="flex gap-8 p-6 rounded-[2rem] bg-amber-50/50 border border-amber-100">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-500 shadow-sm">
                    <CloudSun className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 mb-1">
                      Previsión Tiempo
                    </p>
                    <p className="text-xl font-black text-slate-900">
                      {event.weather_forecast.tempmax}°C /{" "}
                      {event.weather_forecast.tempmin}°C
                    </p>
                    <p className="text-[10px] font-bold text-amber-700/70 uppercase tracking-wider">
                      {event.weather_forecast.conditions ||
                        (event.weather_forecast.precip_prob !== undefined
                          ? `${event.weather_forecast.precip_prob}% prob. lluvia`
                          : "Actividad al exterior")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-16 space-y-4">
              <button
                onClick={handleAddToCalendar}
                className="flex w-full items-center justify-center gap-4 rounded-[2rem] bg-slate-950 py-7 text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all hover:bg-primary shadow-xl hover:shadow-primary/20"
              >
                Añadir al calendario
              </button>

              <button
                onClick={handleShare}
                className="flex w-full items-center justify-center gap-4 rounded-[2rem] border-2 border-slate-100 bg-white py-7 text-[10px] font-black uppercase tracking-[0.3em] text-slate-950 transition-all hover:bg-slate-50 shadow-lg"
              >
                <Share2 className="h-5 w-5" />
                Compartir evento
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Events */}
      {relatedEvents.length > 0 && (
        <section className="container mx-auto px-6 mt-24 border-t border-slate-100 pt-32">
          <div className="flex items-baseline justify-between mb-20 px-4">
            <h2 className="text-6xl font-black uppercase tracking-tighter text-slate-950">
              Más <span className="text-primary italic">Actividades</span>
            </h2>
            <Link
              to="/agenda"
              className="text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:underline underline-offset-8"
            >
              Explorar toda la agenda
            </Link>
          </div>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {relatedEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function EventDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-[70vh] w-full bg-slate-900 animate-pulse" />
      <div className="container mx-auto grid gap-16 px-6 py-12 md:grid-cols-12 md:py-32">
        <div className="md:col-span-8 space-y-12">
          <SkeletonBlock className="h-40 w-full opacity-10" rounded="3xl" />
          <SkeletonBlock className="h-80 w-full opacity-10" rounded="3xl" />
          <SkeletonBlock className="h-60 w-full opacity-10" rounded="3xl" />
        </div>
        <div className="md:col-span-4">
          <SkeletonBlock
            className="h-[600px] w-full opacity-10"
            rounded="3xl"
          />
        </div>
      </div>
    </div>
  );
}
