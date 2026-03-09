import { useMemo } from "react";
import { Clock, MapPin, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Event } from "@/features/events/types";
import {
  formatDay,
  formatMonthShort,
  formatTime,
} from "@/features/agenda/dateUtils";

export function EventCard({ event }: { event: Event }) {
  const startDate = useMemo(() => new Date(event.start_at), [event.start_at]);

  const imageUrl =
    event.image_url ||
    event.featured_media?.variant_medium ||
    event.featured_media?.file ||
    "/placeholder-event.jpg";

  return (
    <Link
      to={`/agenda/${event.slug}`}
      data-animated-card
      className="group block h-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-[2.5rem]"
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[2.5rem] bg-white text-slate-900 shadow-sm ring-1 ring-slate-100 transition-all duration-500 hover:shadow-[0_32px_80px_rgba(15,76,129,0.08)] hover:ring-slate-200">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={imageUrl}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="absolute left-5 top-5 flex items-center gap-2">
            {event.is_free ? (
              <div className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 shadow-sm backdrop-blur-md">
                Entrada Libre
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative flex flex-1 flex-col p-6 md:p-8">
          <div className="absolute -top-8 right-6 flex flex-col items-center justify-center rounded-[1.25rem] bg-white px-4 py-2.5 text-primary shadow-xl ring-1 ring-slate-100 transition-transform duration-500 group-hover:-translate-y-2">
            <span className="text-2xl font-black leading-none">{formatDay(startDate)}</span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em]">{formatMonthShort(startDate)}</span>
          </div>

          <div className="mt-2 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {event.category_name || "Agenda Local"}
            </span>
            <h3 className="line-clamp-2 text-xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-primary md:text-2xl">
              {event.title}
            </h3>
          </div>

          <div className="mt-6 flex flex-1 flex-col justify-end space-y-3 pt-5 text-sm font-medium text-slate-500 border-t border-slate-100/80">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-primary/60" />
              <span className="line-clamp-2">{event.venue_name || event.location_text || "Ubicación por confirmar"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-primary/60" />
              <span>
                {formatTime(startDate)} h {event.occurrences_count > 1 ? `(+${event.occurrences_count - 1} sesiones)` : ""}
              </span>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm font-bold text-primary">
            <span className="relative overflow-hidden">
              <span className="block transition-transform duration-500 group-hover:-translate-y-full">Detalles del evento</span>
              <span className="absolute inset-0 block translate-y-full text-secondary transition-transform duration-500 group-hover:translate-y-0">Detalles del evento</span>
            </span>
            <ChevronRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:text-secondary" />
          </div>
        </div>
      </div>
    </Link>
  );
}
