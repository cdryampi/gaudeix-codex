import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { CalendarDays, Sparkles } from "lucide-react";

import { DataCard, PageHero, SectionHeader } from "@/components/site/primitives";
import { MotionReveal } from "@/components/animated/MotionReveal";
import { AnimatedCardGrid } from "@/components/animated/AnimatedCardGrid";
import { AgendaFilters } from "@/features/agenda/components/AgendaFilters";
import { EventDayGroup } from "@/features/agenda/components/EventDayGroup";
import {
  filterEvents,
  groupEventsByDay,
  sortEventsByDate,
  getRangeParams,
  DateRangeFilter,
} from "@/features/agenda/utils";
import { getEvents } from "@/features/events/api";
import { EventCard } from "@/features/agenda/components/EventCard";

export function AgendaPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") || "all";
  const range = (searchParams.get("range") as DateRangeFilter) || "month";
  const query = searchParams.get("q") || "";

  const {
    data: eventsData,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["events", { is_published: true, range }],
    queryFn: () =>
      getEvents({
        is_published: true,
        ...getRangeParams(range),
      }),
  });

  const setFilters = (next: {
    category: string;
    range: DateRangeFilter;
    query: string;
  }) => {
    const params = new URLSearchParams();
    if (next.category !== "all") params.set("category", next.category);
    if (next.range !== "month") params.set("range", next.range);
    if (next.query) params.set("q", next.query);
    setSearchParams(params);
  };

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
    <main className="min-h-screen bg-background-light page-shell-offset">
      <PageHero
        eyebrow="Agenda municipal"
        title="Una agenda mas visual, filtrable y util para seguir el pulso de Cabrera de Mar"
        description="La programacion cultural y las actividades del municipio se presentan ahora con un lenguaje mas editorial, mas ritmo visual y acceso directo a cada propuesta."
        tone="immersive"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Agenda" },
        ]}
        metrics={[
          { label: "Eventos publicados", value: `${events.length} actividades` },
          {
            label: "Filtro activo",
            value: range === "month" ? "Este mes" : range === "week" ? "Esta semana" : "Hoy",
          },
          { label: "Uso publico", value: "Agenda cultural y familiar" },
        ]}
        aside={
          <div className="grid gap-4">
            <DataCard
              label="Consulta rapida"
              value="Filtra, explora y accede al detalle"
              icon={CalendarDays}
              className="border-white/12 bg-white/10 text-white [&_p]:text-white/68 [&_.text-slate-900]:text-white"
            />
            <Link
              to="/festes"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/16 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/16"
            >
              <Sparkles className="h-4 w-4" />
              Ver festes y programacion
            </Link>
          </div>
        }
      />

      <div className="page-container space-y-10 py-10">
        <MotionReveal>
          <AgendaFilters
            category={category}
            range={range}
            query={query}
            onChange={(next) => {
              setFilters(next);
            }}
          />
        </MotionReveal>

        {loading ? (
          <div className="card-surface flex items-center justify-center py-20 text-center">
            <p className="text-lg font-semibold text-slate-500">Cargando agenda municipal...</p>
          </div>
        ) : error ? (
          <div className="card-surface flex items-center justify-center py-20 text-center">
            <p className="text-lg font-semibold text-red-500">
              No hemos podido cargar la agenda en este momento.
            </p>
          </div>
        ) : (
          <div className="space-y-14">
            {featured.length > 0 ? (
              <section className="space-y-6">
                <MotionReveal>
                  <SectionHeader
                    eyebrow="Selección destacada"
                    title="Eventos recomendados"
                    description="Una entrada curada para descubrir los planes más atractivos de los próximos días."
                  />
                </MotionReveal>
                <AnimatedCardGrid className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10">
                  {featured.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </AnimatedCardGrid>
              </section>
            ) : null}

            {groups.length ? (
              <section className="space-y-8">
                <MotionReveal>
                  <SectionHeader
                    eyebrow="Calendario"
                    title="Programación por fechas"
                    description="Consulta las actividades organizadas por jornada con una lectura más aireada y fácil de recorrer."
                  />
                </MotionReveal>
                <div className="space-y-16">
                  {groups.map((group) => (
                    <MotionReveal key={group.dayLabel}>
                      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
                        <div className="lg:w-72 shrink-0 lg:sticky lg:top-32">
                          <div className="flex flex-col gap-2">
                            <h3 className="text-3xl font-black tracking-tight text-slate-900">{group.dayLabel}</h3>
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary/60">
                              {group.items.length} {group.items.length === 1 ? "actividad programada" : "actividades programadas"}
                            </p>
                          </div>
                        </div>
                        <div className="flex-1 w-full scale-100">
                          <EventDayGroup dayLabel={group.dayLabel} items={group.items} />
                        </div>
                      </div>
                    </MotionReveal>
                  ))}
                </div>
              </section>
            ) : (
              <div className="card-surface flex flex-col items-center justify-center gap-4 py-20 text-center">
                <span className="text-xl font-semibold text-slate-500">
                  No hay eventos para esta seleccion.
                </span>
                <button
                  onClick={() => setFilters({ category: "all", range: "month", query: "" })}
                  className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
