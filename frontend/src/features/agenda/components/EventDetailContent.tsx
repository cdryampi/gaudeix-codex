import { Link } from "react-router-dom";
import {
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
import { Event } from "../../events/types";
import { formatDateTime, formatTime } from "../dateUtils";
import { getNextSession } from "../utils";

interface EventDetailContentProps {
  event: Event;
  isAuthenticated?: boolean;
  isFavoritePending?: boolean;
  isCheckinPending?: boolean;
  onFavorite?: () => void;
  onCheckin?: () => void;
  onShare?: () => void;
  onAddToCalendar?: () => void;
  isPreview?: boolean;
}

export function EventDetailContent({
  event,
  isAuthenticated,
  isFavoritePending,
  isCheckinPending,
  onFavorite,
  onCheckin,
  onShare,
  onAddToCalendar,
  isPreview = false,
}: EventDetailContentProps) {
  const nextSession = getNextSession(event.dates || []);
  const startDate = new Date(event.start_at);

  const imageUrl =
    event.image_url ||
    event.featured_media?.variant_large ||
    event.featured_media?.file ||
    "/placeholder-event.jpg";

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue_name} ${event.location_text}`)}`;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Hero Image */}
      <div className="relative h-[70vh] w-full overflow-hidden bg-slate-900 md:h-[85vh]">
        <img
          src={imageUrl}
          alt={event.title}
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

        {/* Navigation & Breadcrumbs Overlay */}
        {!isPreview && (
          <div className="absolute top-0 left-0 right-0 z-10 pt-48 px-6 md:px-16">
            <div className="container mx-auto">
              <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-12">
                <Link to="/" className="hover:text-white transition-colors">
                  Inicio
                </Link>
                <ChevronRight className="h-3 w-3" />
                <Link
                  to="/agenda"
                  className="hover:text-white transition-colors"
                >
                  Agenda
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-accent truncate max-w-[200px] md:max-w-none">
                  {event.title}
                </span>
              </nav>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-12">
              {!isPreview ? (
                <Link
                  to="/agenda"
                  className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md transition-all hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a la Agenda
                </Link>
              ) : (
                <div />
              )}

              <button
                onClick={onFavorite}
                disabled={isPreview || isFavoritePending}
                className={`flex h-16 w-16 items-center justify-center rounded-2xl backdrop-blur-md transition-all ${
                  event.is_favorited
                    ? "bg-red-500 text-white shadow-xl shadow-red-500/20"
                    : "bg-white/10 text-white hover:bg-white/20"
                } ${isPreview ? "cursor-default" : ""}`}
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
              {event.tags?.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-white/10 px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm border border-white/10"
                >
                  #{tag.nombre}
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
              dangerouslySetInnerHTML={{ __html: event.description || "" }}
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
                    +{event.points_value || 20} puntos
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
                onClick={onCheckin}
                disabled={isPreview || isCheckinPending}
                className="inline-flex items-center justify-center gap-4 rounded-3xl bg-accent px-12 py-6 text-xs font-black uppercase tracking-[0.2em] text-slate-900 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-xl shadow-accent/20"
              >
                {isCheckinPending ? (
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

          {event.attachments && event.attachments.length > 0 && (
            <div className="rounded-[3rem] border-2 border-slate-100 bg-slate-50/30 p-12">
              <h3 className="mb-10 text-3xl font-black uppercase tracking-tighter text-slate-900 italic">
                Documentos <span className="text-primary">Oficiales</span>
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                {event.attachments.map((doc) => (
                  <a
                    key={doc.id}
                    href={isPreview ? "#" : doc.file}
                    target={isPreview ? undefined : "_blank"}
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

                  {event.dates && event.dates.length > 1 && (
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
                    href={isPreview ? "#" : mapUrl}
                    target={isPreview ? undefined : "_blank"}
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
                onClick={onAddToCalendar}
                disabled={isPreview}
                className="flex w-full items-center justify-center gap-4 rounded-[2rem] bg-slate-950 py-7 text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all hover:bg-primary shadow-xl hover:shadow-primary/20"
              >
                Añadir al calendario
              </button>

              <button
                onClick={onShare}
                disabled={isPreview}
                className="flex w-full items-center justify-center gap-4 rounded-[2rem] border-2 border-slate-100 bg-white py-7 text-[10px] font-black uppercase tracking-[0.3em] text-slate-950 transition-all hover:bg-slate-50 shadow-lg"
              >
                <Share2 className="h-5 w-5" />
                Compartir evento
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowLeft(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}
