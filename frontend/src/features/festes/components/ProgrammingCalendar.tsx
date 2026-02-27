/**
 * ProgrammingCalendar renders Festa events grouped by day and time.
 */

import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import { Event } from "@/features/events/types";

interface ProgrammingCalendarProps {
  events: Event[];
}

type GroupedEvents = Array<{
  dayKey: string;
  dayLabel: string;
  items: Event[];
}>;

const dayLabelFormatter = new Intl.DateTimeFormat("ca-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const timeFormatter = new Intl.DateTimeFormat("ca-ES", {
  hour: "2-digit",
  minute: "2-digit",
});

const getDayKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const groupEventsByDay = (events: Event[]): GroupedEvents => {
  const map = new Map<string, Event[]>();

  events
    .slice()
    .sort(
      (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
    )
    .forEach((event) => {
      const startAt = new Date(event.start_at);
      const dayKey = getDayKey(startAt);
      const current = map.get(dayKey) || [];
      current.push(event);
      map.set(dayKey, current);
    });

  return Array.from(map.entries()).map(([dayKey, items]) => ({
    dayKey,
    dayLabel: dayLabelFormatter.format(new Date(`${dayKey}T00:00:00`)),
    items,
  }));
};

export const ProgrammingCalendar = ({ events }: ProgrammingCalendarProps) => {
  const grouped = groupEventsByDay(events);

  return (
    <div className="space-y-8">
      {grouped.map((group) => (
        <section key={group.dayKey} className="space-y-5">
          <header className="sticky top-20 z-10 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-black uppercase tracking-tight text-white md:text-2xl">
                {group.dayLabel}
              </h3>
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-accent">
                {group.items.length}{" "}
                {group.items.length === 1 ? "acte" : "actes"}
              </span>
            </div>
          </header>

          <div className="space-y-3">
            {group.items.map((event) => (
              <article
                key={event.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 space-y-2">
                    <p className="inline-flex max-w-full items-center rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                      {event.category_name || "Event"}
                    </p>
                    <h4 className="text-lg font-black leading-tight text-white md:text-xl">
                      {event.title}
                    </h4>
                    {event.summary && (
                      <p className="text-sm font-medium text-slate-300">
                        {event.summary}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
                      Inici
                    </p>
                    <p className="text-lg font-black text-accent">
                      {timeFormatter.format(new Date(event.start_at))}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-300 md:grid-cols-3">
                  <p className="flex items-center gap-2">
                    <Clock3 className="h-3.5 w-3.5 text-accent" />
                    {event.end_at
                      ? `Fins a ${timeFormatter.format(new Date(event.end_at))}`
                      : "Sense hora de fi"}
                  </p>
                  <p className="flex items-center gap-2 md:col-span-2">
                    <MapPin className="h-3.5 w-3.5 text-accent" />
                    {event.venue_name ||
                      event.location_text ||
                      "Ubicacio per confirmar"}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                      event.is_free
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {event.is_free
                      ? "Gratuit"
                      : event.price_text || "De pagament"}
                  </span>
                  <Link
                    to={`/agenda/${event.slug}`}
                    className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white/90 transition-colors hover:bg-white/10"
                  >
                    <CalendarDays className="h-3 w-3" />
                    Veure detall
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
