import { useMemo, useState } from "react";
import { Calendar, CalendarDays, Clock, Filter, History } from "lucide-react";
import { Link } from "react-router-dom";

import { MotionReveal } from "@/components/animated/MotionReveal";
import { AnimatedCardGrid } from "@/components/animated/AnimatedCardGrid";
import {
  FilterBar,
  PageHero,
  SectionHeader,
} from "@/components/site/primitives";
import { EventCard } from "@/features/agenda/components/EventCard";
import { CategoryLayoutProps } from "../types";
import { Event } from "@/features/events/types";
import { useTranslation } from "@/hooks/useTranslation";

type TimeFilter = "upcoming" | "past" | "all";

function EventsCategoryLayout({ category, events }: CategoryLayoutProps) {
  const { t } = useTranslation();
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
        new Date(a.start_at || 0).getTime() -
        new Date(b.start_at || 0).getTime(),
    );
    past.sort(
      (a, b) =>
        new Date(b.start_at || 0).getTime() -
        new Date(a.start_at || 0).getTime(),
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
    <div
      className="min-h-screen bg-background-light page-shell-offset"
      data-testid="category-layout-events"
    >
      <PageHero
        eyebrow={t("Agenda tematizada")}
        title={category.nombre}
        description={category.descripcion}
        tone="immersive"
        breadcrumbs={[
          { label: t("Inicio"), href: "/" },
          { label: t("Categorías"), href: "/categorias" },
          { label: category.nombre },
        ]}
        metrics={[
          { label: t("Total eventos"), value: events.length },
          { label: t("Proximos"), value: upcomingEvents.length },
          {
            label: t("Filtro"),
            value:
              timeFilter === "upcoming"
                ? t("Proximos")
                : timeFilter === "past"
                  ? t("Pasados")
                  : t("Todos"),
          },
        ]}
        media={
          image ? (
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={image}
                alt={category.nombre}
                className="h-full w-full object-cover"
                fetchPriority="high"
                loading="eager"
              />
            </div>
          ) : undefined
        }
      />

      <div className="page-container space-y-10 py-10">
        <MotionReveal>
          <FilterBar>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Filter className="h-4 w-4 text-primary" />
                {t("Filtra por fecha o tipo de evento")}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  id="btn-events-filter-upcoming"
                  onClick={() => setTimeFilter("upcoming")}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border border-border-soft transition-all duration-200 ${
                    timeFilter === "upcoming"
                      ? "bg-primary text-white"
                      : "bg-surface text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                  }`}
                >
                  <CalendarDays className="h-4 w-4" />
                  {t("Proximos")} ({upcomingEvents.length})
                </button>
                <button
                  id="btn-events-filter-past"
                  onClick={() => setTimeFilter("past")}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border border-border-soft transition-all duration-200 ${
                    timeFilter === "past"
                      ? "bg-primary text-white"
                      : "bg-surface text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                  }`}
                >
                  <History className="h-4 w-4" />
                  {t("Pasados")} ({pastEvents.length})
                </button>
                <button
                  id="btn-events-filter-all"
                  onClick={() => setTimeFilter("all")}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border border-border-soft transition-all duration-200 ${
                    timeFilter === "all"
                      ? "bg-primary text-white"
                      : "bg-surface text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  {t("Todos")} ({events.length})
                </button>
              </div>
            </div>
          </FilterBar>
        </MotionReveal>

        <section className="space-y-6 defer-render">
          <MotionReveal>
            <SectionHeader
              eyebrow={t("Programacion")}
              title={`${displayedEvents.length} ${t("eventos en esta categoria")}`}
              description={t(
                "Explora la programación de actividades y propuestas culturales en el municipio.",
              )}
              action={
                <Link
                  to="/agenda"
                  id="btn-events-agenda-full"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
                >
                  <Calendar className="h-4 w-4" />
                  {t("Ver agenda completa")}
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
              <Calendar className="mx-auto mb-6 h-16 w-16 text-text-secondary/40" />
              <p className="text-xl font-bold text-text-secondary">
                {t("No hay eventos en esta categoria para el filtro actual.")}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
EventsCategoryLayout.displayName = "EventsCategoryLayout";
export default EventsCategoryLayout;
