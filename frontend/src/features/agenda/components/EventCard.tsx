import { useMemo } from "react";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import type { EventItem } from "@/data/mockEvents";
import { formatDay, formatMonthShort, formatTime } from "@/features/agenda/dateUtils";

export function EventCard({ event }: { event: EventItem }) {
  const startDate = useMemo(() => new Date(event.startAt), [event.startAt]);

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-[4rem] bg-white text-slate-900 transition-all hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] h-full"
    >
      <div className="relative h-72 w-full overflow-hidden bg-slate-200">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute left-8 top-8 flex h-20 w-20 flex-col items-center justify-center rounded-[2rem] bg-white shadow-2xl">
          <span className="text-3xl font-black leading-none text-primary">{formatDay(startDate)}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{formatMonthShort(startDate)}</span>
        </div>
        {event.isFree && (
          <div className="absolute right-8 top-8 rounded-full bg-primary px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl">
            Gratis
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-10">
        <span className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
          {event.category}
        </span>
        <h3 className="mb-8 text-3xl font-black leading-[1.1] tracking-tighter uppercase">
          {event.title}
        </h3>

        <div className="mt-auto space-y-4 border-t border-slate-100 pt-8">
          <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="truncate">{event.venueName}</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
            <Clock className="h-6 w-6 text-primary" />
            <span>{formatTime(startDate)} h</span>
          </div>
        </div>

        <a
          href={`/agenda/${event.slug}`}
          className="mt-8 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-primary group-hover:gap-5 transition-all"
        >
          Ver más <ArrowRight className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
}
