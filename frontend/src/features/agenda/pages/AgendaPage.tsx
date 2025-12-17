import { useEffect, useMemo, useState } from "react";

import { events as fallbackEvents, type EventCategory, type EventItem } from "@/data/mockEvents";
import { AgendaFilters } from "@/features/agenda/components/AgendaFilters";
import { FeaturedEvents } from "@/features/agenda/components/FeaturedEvents";
import { EventDayGroup } from "@/features/agenda/components/EventDayGroup";
import { filterEvents, groupEventsByDay, sortEventsByDate, type DateRangeFilter } from "@/features/agenda/utils";
import { listEventItems } from "@/features/events/api";

export function AgendaPage() {
  const [events, setEvents] = useState<EventItem[]>(fallbackEvents);
  const [category, setCategory] = useState<EventCategory | "all">("all");
  const [range, setRange] = useState<DateRangeFilter>("month");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const items = await listEventItems({ upcoming: true, limit: 200, isPublished: true });
        setEvents(items);
      } catch (err) {
        console.warn("Agenda running in mock mode (API not available).", err);
      }
    };
    load();
  }, []);

  const filtered = useMemo(
    () => filterEvents(events, { category, range, query }),
    [category, events, query, range]
  );

  const featured = useMemo(() => sortEventsByDate(filtered.filter((e) => e.featured)).slice(0, 3), [filtered]);
  const rest = useMemo(() => sortEventsByDate(filtered.filter((e) => !e.featured)), [filtered]);
  const groups = useMemo(() => groupEventsByDay(rest), [rest]);

  return (
    <main className="bg-puerto-rico-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="container py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Agenda</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Activitats municipals, cultura, esports i propostes familiars. Consulta dates i localitzacions.
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
      </header>

      <div className="container py-10">
        <div className="space-y-12">
          <FeaturedEvents items={featured} />

          {groups.length ? (
            <div className="space-y-12">
              {groups.map((g) => (
                <EventDayGroup key={g.dayLabel} dayLabel={g.dayLabel} items={g.items} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-sm font-semibold text-gray-900">No hay resultados</p>
              <p className="mt-2 text-sm text-gray-600">Prueba a cambiar la categoría, el rango o el texto de búsqueda.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
