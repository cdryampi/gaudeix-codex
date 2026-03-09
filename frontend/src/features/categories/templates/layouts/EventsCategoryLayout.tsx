import { useMemo, useState } from "react";
import { Calendar, CalendarDays, Clock, History } from "lucide-react";
import { Link } from "react-router-dom";

import { MotionReveal } from "@/components/animated/MotionReveal";
import { AnimatedCardGrid } from "@/components/animated/AnimatedCardGrid";
import { FilterBar, PageHero, SectionHeader } from "@/components/site/primitives";
import { EventCard } from "@/features/agenda/components/EventCard";
import { CategoryLayoutProps } from "../types";
import { Event } from "@/features/events/types";

type TimeFilter = "upcoming" | "past" | "all";

export default function EventsCategoryLayout({
  category,
  events,
}: CategoryLayoutProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("upcoming");

  const image =
    category?.featured_media?.variant_large || category?.featured_media?.file;

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();
    const upcoming: Event[] = [];
    const past: Event[] = [];

    events.forEach((event) => {
      const eventDate = event.start_at ? new Date(event.start_at) : null;
      if (eventDate && eventDate >= now) {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    });

    upcoming.sort(
      (a, b) =>
        new Date(a.start_at || 0).getTime() - new Date(b.start_at || 0).getTime(),
    );
    past.sort(
      (a, b) =>
        new Date(b.start_at || 0).getTime() - new Date(a.start_at || 0).getTime(),
    );

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events]);

  const displayedEvents =
    timeFilter === "upcoming"
      ? upcomingEvents
      : timeFilter === "past"
        ? pastEvents
        : events;

  return (
    <main className="min-h-screen bg-background-light page-shell-offset" data-testid="category-layout-events">
      <PageHero
        eyebrow="Agenda tematizada"
        title={category.nombre}
        description={category.descripcion}
        tone="immersive"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Categorias", href: "/categorias" },
          { label: category.nombre },
        ]}
        metrics={[
          { label: "Total eventos", value: events.length },
          { label: "Proximos", value: upcomingEvents.length },
          { label: "Filtro", value: timeFilter === "upcoming" ? "Proximos" : timeFilter === "past" ? "Pasados" : "Todos" },
        ]}
        media={
          image ? (
            <div className="aspect-[4/3] overflow-hidden">
              <img src={image} alt={category.nombre} className="h-full w-full object-cover" />
            </div>
          ) : undefined
        }
      />

      <div className="page-container space-y-10 py-10">
        <MotionReveal>
          <FilterBar>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setTimeFilter("upcoming")}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${timeFilter === "upcoming" ? "bg-primary text-white" : "bg-white text-slate-600"
                  }`}
              >
                <CalendarDays className="h-4 w-4" />
                Proximos ({upcomingEvents.length})
              </button>
              <button
                onClick={() => setTimeFilter("past")}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${timeFilter === "past" ? "bg-primary text-white" : "bg-white text-slate-600"
                  }`}
              >
                <History className="h-4 w-4" />
                Pasados ({pastEvents.length})
              </button>
              <button
                onClick={() => setTimeFilter("all")}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${timeFilter === "all" ? "bg-primary text-white" : "bg-white text-slate-600"
                  }`}
              >
                <Clock className="h-4 w-4" />
                Todos ({events.length})
              </button>
            </div>
          </FilterBar>
        </MotionReveal>

        <section className="space-y-6">
          <MotionReveal>
            <SectionHeader
              eyebrow="Programacion"
              title={`${displayedEvents.length} eventos en esta categoria`}
              description="Una plantilla mas editorial para navegar la agenda tematica del municipio."
              action={
                <Link
                  to="/agenda"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/12 bg-white/80 px-4 py-2 text-sm font-semibold text-primary"
                >
                  <Calendar className="h-4 w-4" />
                  Ver agenda completa
                </Link>
              }
            />
          </MotionReveal>

          {displayedEvents.length ? (
            <AnimatedCardGrid className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10">
              {displayedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </AnimatedCardGrid>
          ) : (
            <div className="py-24 text-center">
              <Calendar className="mx-auto mb-6 h-16 w-16 text-slate-300" />
              <p className="text-xl font-bold text-slate-400">
                No hay eventos en esta categoria para el filtro actual.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
