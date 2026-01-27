import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { AgendaFilters } from "@/features/agenda/components/AgendaFilters";
import { EventDayGroup } from "@/features/agenda/components/EventDayGroup";
import {
  filterEvents,
  groupEventsByDay,
  sortEventsByDate,
  DateRangeFilter,
} from "@/features/agenda/utils";
import { getEvents } from "@/features/events/api";
import { Event } from "@/features/events/types";
import { EventCard } from "@/features/agenda/components/EventCard";

export function AgendaPage() {
  const [category, setCategory] = useState<string>("all");
  const [range, setRange] = useState<DateRangeFilter>("month");
  const [query, setQuery] = useState("");

  const {
    data: eventsData,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["events", { is_published: true }],
    queryFn: () => getEvents({ is_published: true }),
  });

  const events = useMemo(() => {
    if (!eventsData) return [];
    if (Array.isArray(eventsData)) return eventsData;
    return eventsData.results || [];
  }, [eventsData]);

  const filtered = useMemo(
    () => filterEvents(events, { category, range, query }),
    [category, events, query, range],
  );

  const featured = useMemo(
    () => sortEventsByDate(filtered.filter((e) => e.is_featured)).slice(0, 3),
    [filtered],
  );
  const rest = useMemo(
    () => sortEventsByDate(filtered.filter((e) => !e.is_featured)),
    [filtered],
  );
  const groups = useMemo(() => groupEventsByDay(rest), [rest]);

  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-accent selection:text-slate-950">
      {/* High-Impact Hero Header */}
      <section className="min-h-[80vh] flex flex-col justify-center px-6 md:px-20 py-32 bg-slate-950 uppercase relative overflow-hidden">
        {/* Background Accent Blur */}
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <span className="text-base font-black uppercase tracking-[0.5em] text-accent mb-8 block">
            Agenda Cultural
          </span>
          <h1 className="text-[clamp(4rem,15vw,15rem)] font-black leading-[0.8] tracking-tighter text-white mb-16">
            AGENDA <br />
            <span className="italic text-accent">VIVA</span>
          </h1>

          <p className="text-xl md:text-3xl font-bold leading-tight text-slate-400 max-w-4xl tracking-tight mb-20 normal-case">
            Descubre las actividades municipales, cultura, deportes y propuestas
            familiares de Cabrera de Mar.
          </p>

          <AgendaFilters
            category={category}
            range={range}
            query={query}
            onChange={(next) => {
              setCategory(next.category);
              setRange(next.range);
              setQuery(next.query);
            }}
          />
        </div>
      </section>

      <div className="container mx-auto px-6 pb-48">
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
            <p className="mt-8 text-xl font-black uppercase tracking-widest text-slate-500">
              Cargando experiencias...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-[4rem] border-4 border-dashed border-red-500/20 bg-red-500/5 p-24 text-center">
            <p className="text-4xl font-black uppercase tracking-tighter text-red-500">
              Error en el sistema
            </p>
            <p className="mt-4 text-xl font-bold text-slate-400">
              No hemos podido conectar con la agenda viva.
            </p>
          </div>
        ) : (
          <div className="space-y-48">
            {/* Featured Section */}
            {featured.length > 0 && (
              <section className="space-y-16">
                <div className="flex items-center gap-6">
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                    Destacados
                  </h2>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
                  {featured.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </div>
              </section>
            )}

            {/* List Section */}
            {groups.length ? (
              <div className="space-y-32">
                {groups.map((g) => (
                  <div key={g.dayLabel} className="space-y-16">
                    <div className="sticky top-20 z-20 bg-slate-950/80 backdrop-blur-md py-6 border-b border-white/5">
                      <h3 className="text-3xl font-black uppercase tracking-tighter text-accent italic">
                        {g.dayLabel}
                      </h3>
                    </div>
                    <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
                      {g.items.map((item) => (
                        <EventCard key={item.id} event={item} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-48 text-center border-4 border-dashed border-white/10 rounded-[4rem]">
                <span className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white/10">
                  Sin eventos para esta selección
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
