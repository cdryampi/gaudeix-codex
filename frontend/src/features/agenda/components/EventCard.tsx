import { useMemo } from "react";
import {
  MapPin,
  Clock,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Event } from "@/features/events/types";
import {
  formatDay,
  formatMonthShort,
  formatTime,
} from "@/features/agenda/dateUtils";

export function EventCard({ event }: { event: Event }) {
  const startDate = useMemo(() => new Date(event.start_at), [event.start_at]);
  const firstFestesActivity = event.festes_activities?.[0];
  const festesTarget = "/festes/programacio";

  // Resolve image URL from featured_media object or helper
  const imageUrl =
    event.image_url ||
    event.featured_media?.variant_medium ||
    event.featured_media?.file ||
    "/placeholder-event.jpg";

  return (
    <div className="group flex flex-col overflow-hidden rounded-[4rem] bg-white text-slate-900 transition-all hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] h-full">
      <div className="relative h-72 w-full overflow-hidden bg-slate-200">
        <img
          src={imageUrl}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute left-8 top-8 flex h-20 w-20 flex-col items-center justify-center rounded-[2rem] bg-white shadow-2xl">
          <span className="text-3xl font-black leading-none text-primary">
            {formatDay(startDate)}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
            {formatMonthShort(startDate)}
          </span>
        </div>
        {event.is_free && (
          <div className="absolute right-8 top-8 rounded-full bg-primary px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl">
            Gratis
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-10">
        <span className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
          {event.category_name || "Evento"}
        </span>
        {firstFestesActivity && (
          <Link
            to={festesTarget}
            className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-white"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Acto de Festa Major
          </Link>
        )}
        <h3 className="mb-8 text-3xl font-black leading-[1.1] tracking-tighter uppercase line-clamp-3">
          {event.title}
        </h3>

        {event.occurrences_count > 1 && (
          <div
            className="mb-6 flex items-center gap-3 rounded-2xl bg-puerto-rico-50 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-primary"
            data-testid="event-multidate"
          >
            <Calendar className="h-4 w-4" />
            <span>+{event.occurrences_count - 1} fechas más</span>
          </div>
        )}

        {event.event_status === "ongoing" && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-amber-50 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-amber-600">
            <Clock className="h-4 w-4" />
            <span>En curso ahora</span>
          </div>
        )}

        {event.event_status === "finished" && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-slate-100 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Finalizado</span>
          </div>
        )}

        <div className="mt-auto space-y-4 border-t border-slate-100 pt-8">
          <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="truncate">
              {event.venue_name ||
                event.location_text ||
                "Ubicación por confirmar"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
            <Clock className="h-6 w-6 text-primary" />
            <span>{formatTime(startDate)} h</span>
          </div>
        </div>

        <Link
          to={`/agenda/${event.slug}`}
          className="mt-8 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-primary group-hover:gap-5 transition-all"
        >
          Ver más <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
