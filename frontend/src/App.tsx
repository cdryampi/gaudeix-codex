import { useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/useTheme";
import {
  CalendarDays,
  ChevronRight,
  Clock,
  MapPin,
  Navigation,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Event } from "@/features/events/types";
import {
  formatDay,
  formatMonthShort,
  formatTime,
} from "@/features/agenda/dateUtils";
import { InteractiveMap } from "@/components/site/InteractiveMap";
import { MunicipalCTA, SectionHeader } from "@/components/site/primitives";
import { CategoryBrandIcon } from "@/features/categories/components/CategoryBrandIcon";
import { HeroVideoFrame } from "@/features/hero/components/HeroVideo";
import { HomeExperienceGrid } from "@/features/hero/components/HomeExperienceGrid";
import { getEvents } from "@/features/events/api";
import { getCategories } from "@/features/categories/api";
import { NewsCard } from "@/features/news/components/NewsCard";
import { filterEvents, DateRangeFilter } from "@/features/agenda/utils";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import PasswordResetPage from "@/pages/PasswordResetPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { NewsDetailPage } from "@/features/news/pages/NewsDetailPage";
import { EventDetailPage } from "@/features/agenda/pages/EventDetailPage";
import { AgendaPage } from "@/features/agenda/pages/AgendaPage";
import { PlacesPage } from "@/features/places/pages/PlacesPage";
import { LegacyBeachPlaceRedirect } from "@/features/places/pages/LegacyBeachPlaceRedirect";
import { BeachDetailPage } from "@/features/beaches/pages/BeachDetailPage";
import { RankingsPage } from "@/features/gamification/pages/RankingsPage";
import { CategoriesPage } from "@/features/categories/pages/CategoriesPage";
import { CategoryDetailPage } from "@/features/categories/pages/CategoryDetailPage";
import { ComoLlegarPage } from "@/features/site-settings/pages/ComoLlegarPage";
import { FavoritesPage } from "@/features/users/pages/FavoritesPage";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useAuthStore } from "@/features/auth/store";
import { useLanguageStore } from "@/features/site-settings/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { RoutesPage } from "@/features/routes/pages/RoutesPage";
import { RouteDetailPage } from "@/features/routes/pages/RouteDetailPage";
import { RoadmapPage } from "@/features/routes/pages/RoadmapPage";
import { FestesPage } from "@/features/festes/pages/FestesPage";
import { FestaDetailPage } from "@/features/festes/pages/FestaDetailPage";
import { ProgrammingPage } from "@/features/festes/pages/ProgrammingPage";
import { NewsPage } from "@/features/news/pages/NewsPage";
import { listNewsItems } from "@/features/news/api";
import { StorytellingPage } from "@/features/storytelling/pages/StorytellingPage";
import { StoryDetailPage } from "@/features/storytelling/pages/StoryDetailPage";
import { HistoricalStoryExplorer } from "@/features/storytelling/components/HistoricalStoryExplorer";
import { Category } from "@/features/categories/types";
import { EventCard } from "@/features/agenda/components/EventCard";
import { AnimatedCardGrid } from "@/components/animated/AnimatedCardGrid";
import { MotionReveal } from "@/components/animated/MotionReveal";

// Ilustraciones decorativas de fondo para Experiencias para descubrir
import cabezonesBufonesDeco from "@/assets/category/cabezones_bufones.png";
import caminoPlayaDeco from "@/assets/category/camino_playa.png";
import diablesDeco from "@/assets/category/diables.png";
import esgrimaDeco from "@/assets/category/esgrima.png";
import iglesiaDeco from "@/assets/category/iglesia.png";

const mosaicPattern = [
  "lg:col-span-7 lg:row-span-2",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-4",
  "lg:col-span-4",
  "lg:col-span-4",
];

function HomeMosaicTile({
  category,
  index,
}: {
  category: Category;
  index: number;
}) {
  const image =
    category.featured_media?.variant_large || category.featured_media?.file;
  const isLarge = index === 0;

  return (
    <Link
      to={`/categorias/${category.slug}`}
      data-animated-card
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-text-primary text-white shadow-xl ring-1 ring-white/10 transition-all duration-500 hover:shadow-2xl hover:ring-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        mosaicPattern[index % mosaicPattern.length],
        isLarge
          ? "min-h-[400px] md:min-h-[480px]"
          : "min-h-[280px] md:min-h-[320px]",
      )}
    >
      {image ? (
        <img
          src={image}
          alt={category.nombre}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.04]"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

      <div className="relative flex h-full flex-col justify-between p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md transition-colors group-hover:bg-white/25">
            {category.icon ? (
              <CategoryBrandIcon
                iconName={category.icon}
                className="h-3.5 w-3.5 opacity-80"
              />
            ) : null}
            {category.taxonomy || "Experiencia"}
          </div>
          <div className="flex h-10 w-10 shrink-0 transform items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:bg-white group-hover:text-text-primary">
            <ChevronRight className="h-5 w-5" />
          </div>
        </div>

        <div className="transform space-y-3 transition-transform duration-500 ease-out group-hover:-translate-y-1">
          <h3
            className={cn(
              "font-bold text-white",
              isLarge ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl",
            )}
          >
            {category.nombre}
          </h3>
          {category.descripcion ? (
            <p
              className={cn(
                "text-white/80",
                isLarge
                  ? "max-w-xl text-base md:text-lg"
                  : "text-sm md:text-base line-clamp-2 md:line-clamp-3",
              )}
            >
              {category.descripcion}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function getRelativeEventTimeString(dateString: string): string {
  const eventDate = new Date(dateString);
  const now = new Date();

  const eventDateClean = new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate(),
  );
  const nowClean = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = eventDateClean.getTime() - nowClean.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "¡Hoy mismo!";
  if (diffDays === 1) return "Mañana";
  if (diffDays === 2) return "En 2 días";
  if (diffDays > 2 && diffDays <= 7) return `En ${diffDays} días`;

  // Detectar si es este fin de semana
  const currentDay = now.getDay(); // 0: Domingo, 6: Sábado
  const daysToWeekend = currentDay === 0 ? 6 : 6 - currentDay;
  const weekendStart = new Date(
    nowClean.getTime() + daysToWeekend * 24 * 60 * 60 * 1000,
  );
  const weekendEnd = new Date(weekendStart.getTime() + 24 * 60 * 60 * 1000);

  if (eventDateClean >= weekendStart && eventDateClean <= weekendEnd) {
    return "Este fin de semana";
  }

  return `El ${eventDate.getDate()} de ${eventDate.toLocaleString("es-ES", { month: "long" })}`;
}

function HomeNextSuggestedEventCard({ event }: { event: Event }) {
  const startDate = useMemo(() => new Date(event.start_at), [event.start_at]);
  const relativeTime = useMemo(
    () => getRelativeEventTimeString(event.start_at),
    [event.start_at],
  );

  const imageUrl =
    event.image_url ||
    event.featured_media?.variant_large ||
    event.featured_media?.file ||
    "/placeholder-event.jpg";

  return (
    <Link
      to={`/agenda/${event.slug}`}
      className="group block w-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-[2.5rem]"
    >
      <div className="relative flex flex-col md:flex-row overflow-hidden rounded-[2.5rem] bg-white text-slate-900 shadow-xl ring-1 ring-slate-100/80 transition-all duration-500 hover:shadow-[0_40px_90px_rgba(15,76,129,0.12)] hover:ring-slate-200">
        {/* Left Side: Image (42% width in desktop) */}
        <div className="relative h-64 md:h-auto md:w-[42%] shrink-0 overflow-hidden bg-slate-100">
          <img
            src={imageUrl}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent opacity-40 transition-opacity duration-500 group-hover:opacity-60" />

          <div className="absolute left-5 top-5 flex flex-wrap gap-2">
            <div className="rounded-full bg-secondary text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] shadow-lg backdrop-blur-md">
              Sugerencia Destacada
            </div>
            {event.is_free ? (
              <div className="rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-900 shadow-sm">
                Entrada Libre
              </div>
            ) : null}
          </div>

          {/* Dynamic remaining-time indicator bubble */}
          <div className="absolute bottom-5 left-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-white shadow-lg">
            <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
            {relativeTime}
          </div>
        </div>

        {/* Right Side: Event Details */}
        <div className="relative flex flex-1 flex-col justify-between p-6 md:p-10">
          {/* Big Floating Calendar Badge */}
          <div className="absolute top-6 right-6 md:top-10 md:right-10 flex flex-col items-center justify-center rounded-[1.25rem] bg-slate-50 border border-slate-100 px-4 py-3 text-primary shadow-sm ring-1 ring-slate-100 transition-transform duration-500 group-hover:-translate-y-2.5">
            <span className="text-3xl font-black leading-none tracking-tight">
              {formatDay(startDate)}
            </span>
            <span className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              {formatMonthShort(startDate)}
            </span>
          </div>

          <div className="space-y-4 max-w-[80%] md:max-w-[75%]">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
              {event.category_name || "Agenda Local"}
            </span>
            <h3 className="text-2xl font-black leading-tight text-slate-900 transition-colors group-hover:text-primary md:text-3xl font-serif">
              {event.title}
            </h3>
            {event.summary || event.description ? (
              <p className="text-sm leading-relaxed text-slate-500 line-clamp-2 md:line-clamp-3">
                {event.summary || event.description}
              </p>
            ) : null}
          </div>

          {/* Details & Location Row */}
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 pt-6 border-t border-slate-100 text-sm font-semibold text-slate-500">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-colors group-hover:bg-primary/5 group-hover:text-primary">
                <MapPin className="h-4.5 w-4.5" />
              </div>
              <span className="truncate max-w-[200px]">
                {event.venue_name ||
                  event.location_text ||
                  "Ubicación por confirmar"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-colors group-hover:bg-primary/5 group-hover:text-primary">
                <Clock className="h-4.5 w-4.5" />
              </div>
              <span>
                {formatTime(startDate)} h{" "}
                {event.occurrences_count > 1
                  ? `(+${event.occurrences_count - 1} sesiones)`
                  : ""}
              </span>
            </div>
          </div>

          {/* Bottom Link Animation */}
          <div className="mt-8 flex items-center gap-2.5 text-sm font-black uppercase tracking-widest text-primary">
            <span className="relative overflow-hidden">
              <span className="block transition-transform duration-500 group-hover:-translate-y-full">
                Ver detalles y reservar
              </span>
              <span className="absolute inset-0 block translate-y-full text-secondary transition-transform duration-500 group-hover:translate-y-0">
                Ver detalles y reservar
              </span>
            </span>
            <ChevronRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5 group-hover:text-secondary" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function HomePage() {
  const { t } = useTranslation();
  const [eventFilter, setEventFilter] = useState<DateRangeFilter>("week");

  const { data: eventsData } = useQuery({
    queryKey: ["events", { is_published: true, limit: 10, upcoming: true }],
    queryFn: () => getEvents({ is_published: true, limit: 10, upcoming: true }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const { data: latestNews = [] } = useQuery({
    queryKey: ["news", "latest"],
    queryFn: async () => {
      const items = await listNewsItems();
      return items?.slice(0, 3) || [];
    },
  });

  const featuredCategories = useMemo(() => {
    const list = Array.isArray(categoriesData)
      ? categoriesData
      : categoriesData?.results || [];
    return list.slice(0, 6);
  }, [categoriesData]);

  const allEvents = useMemo(() => {
    if (!eventsData) return [];
    if (Array.isArray(eventsData)) return eventsData;
    return eventsData.results || [];
  }, [eventsData]);

  const visibleEvents = useMemo(() => {
    const filtered = filterEvents(allEvents, {
      category: "all",
      range: eventFilter,
      query: "",
    });
    return filtered.slice(0, 4);
  }, [allEvents, eventFilter]);

  const nextSuggestedEvent = useMemo(() => {
    if (visibleEvents.length > 0) return null;
    return allEvents[0] || null;
  }, [visibleEvents, allEvents]);

  return (
    <main className="bg-background-light text-[color:var(--color-text-primary)]">
      <HeroVideoFrame />
      <HomeExperienceGrid />

      <HistoricalStoryExplorer />

      <section
        id="categorias"
        className="page-section pt-10 relative overflow-hidden"
      >
        {/* Ilustraciones decorativas flotantes de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
          {/* 1. Iglesia - Esquina superior izquierda */}
          <MotionReveal
            className="absolute top-12 left-4 md:left-12 w-56 md:w-80 max-w-md pointer-events-none select-none"
            delay={0.1}
          >
            <img
              src={iglesiaDeco}
              alt="Ilustración Iglesia"
              className="w-full object-contain filter sepia-[15%] rotate-[-5deg] opacity-[0.06]"
            />
          </MotionReveal>
          {/* 2. Diables - Esquina superior derecha */}
          <MotionReveal
            className="absolute top-20 right-6 md:right-20 w-64 md:w-96 max-w-lg pointer-events-none select-none"
            delay={0.2}
          >
            <img
              src={diablesDeco}
              alt="Ilustración Fiestas Diables"
              className="w-full object-contain filter sepia-[15%] rotate-[6deg] opacity-[0.06]"
            />
          </MotionReveal>
          {/* 3. Esgrima - Zona media derecha */}
          <MotionReveal
            className="absolute top-1/2 -translate-y-1/2 right-12 w-48 md:w-72 max-w-sm pointer-events-none select-none"
            delay={0.3}
          >
            <img
              src={esgrimaDeco}
              alt="Ilustración Esgrima"
              className="w-full object-contain filter sepia-[15%] rotate-[-4deg] opacity-[0.06]"
            />
          </MotionReveal>
          {/* 4. Cabezones Bufones - Esquina inferior izquierda */}
          <MotionReveal
            className="absolute bottom-16 left-6 md:left-24 w-64 md:w-96 max-w-lg pointer-events-none select-none"
            delay={0.4}
          >
            <img
              src={cabezonesBufonesDeco}
              alt="Ilustración Cabezones Bufones"
              className="w-full object-contain filter sepia-[15%] rotate-[5deg] opacity-[0.06]"
            />
          </MotionReveal>
          {/* 5. Camino Playa - Esquina inferior derecha */}
          <MotionReveal
            className="absolute bottom-8 right-8 md:right-28 w-72 md:w-[420px] max-w-xl pointer-events-none select-none"
            delay={0.5}
          >
            <img
              src={caminoPlayaDeco}
              alt="Ilustración Camino Playa"
              className="w-full object-contain filter sepia-[15%] rotate-[-3deg] opacity-[0.06]"
            />
          </MotionReveal>
        </div>

        <div className="page-container relative z-10 space-y-10">
          <MotionReveal>
            <SectionHeader
              eyebrow={t("Experiencias para descubrir")}
              title={t("Un mosaico vivo para recorrer Cabrera de Mar")}
              description={t("category_section_desc")}
              action={
                <Link
                  to="/categorias"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/12 bg-white/80 px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white"
                >
                  {t("Ver todas las categorias")}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              }
            />
          </MotionReveal>

          {!featuredCategories.length ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="card-surface h-[280px] animate-pulse bg-surface-muted lg:col-span-4"
                />
              ))}
            </div>
          ) : (
            <AnimatedCardGrid className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              {featuredCategories.map((category, index) => (
                <HomeMosaicTile
                  key={category.id}
                  category={category}
                  index={index}
                />
              ))}
            </AnimatedCardGrid>
          )}
        </div>
      </section>

      <section
        id="eventos"
        className="page-section sand-section relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(15,76,129,0.04),transparent_60%)] w-[800px] h-[800px] pointer-events-none" />
        <div className="page-container relative z-10 grid gap-10 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
          <MotionReveal className="flex flex-col gap-8 lg:sticky lg:top-32 lg:h-max">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                {t("Agenda Viva")}
              </span>
              <h2 className="text-4xl font-bold leading-tight text-text-primary lg:text-5xl">
                {t("La cultura nunca se detiene.")}
              </h2>
              <p className="text-base leading-relaxed text-text-secondary lg:text-lg">
                {t("agenda_section_desc")}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: "today", label: t("Hoy") },
                { id: "week", label: t("Esta semana") },
                { id: "month", label: t("Este mes") },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setEventFilter(filter.id as DateRangeFilter)}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                    eventFilter === filter.id
                      ? "bg-text-primary text-white shadow-lg shadow-slate-900/20"
                      : "bg-white/60 text-text-secondary hover:bg-white hover:text-text-primary hover:shadow-sm ring-1 ring-slate-200/50"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <Link
                to="/agenda"
                className="group inline-flex items-center gap-3 text-sm font-bold text-primary transition-colors hover:text-secondary"
              >
                {t("Explorar agenda completa")}
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-secondary/10">
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </MotionReveal>

          <div className="min-w-0">
            {visibleEvents.length ? (
              <AnimatedCardGrid className="grid gap-6 xl:gap-8 md:grid-cols-2">
                {visibleEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </AnimatedCardGrid>
            ) : nextSuggestedEvent ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-1.5 text-left border-l-4 border-primary pl-4">
                  <span className="text-xs font-black uppercase tracking-widest text-primary">
                    {t("No hay actividades programadas para esta selección")}
                  </span>
                  <h4 className="text-lg font-extrabold text-text-primary font-serif">
                    {t(
                      "Te recomendamos el próximo evento programado en el municipio:",
                    )}
                  </h4>
                </div>
                <MotionReveal>
                  <HomeNextSuggestedEventCard event={nextSuggestedEvent} />
                </MotionReveal>
              </div>
            ) : (
              <div className="card-surface flex flex-col items-center justify-center gap-6 py-16 px-6 text-center ring-1 ring-slate-100/50">
                <div className="space-y-2">
                  <span className="text-lg font-bold text-text-primary">
                    {t("No hay actividades programadas para esta selección")}
                  </span>
                  <p className="max-w-md text-sm text-text-muted">
                    {t("agenda_empty_p")}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    to="/rutas"
                    className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-white px-4.5 py-2.5 text-xs font-bold text-text-secondary shadow-sm transition-all hover:bg-surface-muted hover:text-text-primary"
                  >
                    🚶 {t("Explorar Rutas")}
                  </Link>
                  <Link
                    to="/categorias/beaches"
                    className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-white px-4.5 py-2.5 text-xs font-bold text-text-secondary shadow-sm transition-all hover:bg-surface-muted hover:text-text-primary"
                  >
                    🏖️ {t("Visitar Playas")}
                  </Link>
                  <Link
                    to="/lugares?category=heritage"
                    className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-white px-4.5 py-2.5 text-xs font-bold text-text-secondary shadow-sm transition-all hover:bg-surface-muted hover:text-text-primary"
                  >
                    🏛️ {t("Patrimonio Histórico")}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="mapa" className="page-section coast-section">
        <div className="page-container space-y-8">
          <MotionReveal>
            <SectionHeader
              eyebrow={t("Territorio en contexto")}
              title={t(
                "Mapa y lugares para orientarte antes y durante la visita",
              )}
              description={t("map_section_desc")}
              action={
                <Link
                  to="/lugares"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/12 bg-white/75 px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white"
                >
                  {t("Abrir explorador completo")}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              }
            />
          </MotionReveal>

          <MotionReveal>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white ring-1 ring-slate-100 shadow-[0_32px_80px_rgba(15,76,129,0.06)] md:rounded-[3rem]">
              <div className="absolute left-4 right-4 top-4 z-10 flex flex-col gap-4 pointer-events-none md:left-6 md:right-6 md:top-6 md:flex-row md:items-start md:justify-between">
                <div className="flex max-w-sm items-start gap-4 rounded-3xl bg-white/95 p-4 ring-1 ring-slate-900/5 backdrop-blur-md shadow-xl transition-transform duration-500 hover:scale-[1.02] pointer-events-auto">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-surface-muted text-primary">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold leading-tight text-text-primary">
                      {t("Explorador Interactivo")}
                    </p>
                    <p className="text-xs font-medium leading-snug text-text-muted">
                      {t(
                        "Zonas naturales, patrimonio y servicios sobre el territorio.",
                      )}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-text-primary px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-xl pointer-events-auto">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  {t("Vista de Pájaro")}
                </div>
              </div>

              <div className="relative h-[600px] w-full bg-surface-muted md:h-[700px]">
                <InteractiveMap />
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section id="noticias" className="page-section">
        <div className="page-container space-y-10">
          <MotionReveal>
            <SectionHeader
              eyebrow={t("Actualidad local")}
              title={t(
                "Noticias, avisos y vida municipal con una lectura mas editorial",
              )}
              description={t("news_section_desc")}
              action={
                <Link
                  to="/noticias"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/12 bg-white/80 px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white"
                >
                  {t("Ver noticias")}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              }
            />
          </MotionReveal>

          <AnimatedCardGrid className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10">
            {latestNews.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </AnimatedCardGrid>
        </div>
      </section>

      <section className="page-section pt-0">
        <div className="page-container">
          <MotionReveal>
            <MunicipalCTA
              eyebrow={t("Planifica la visita")}
              title={t(
                "Turismo luminoso, agenda activa y un municipio reconocible en cada pantalla",
              )}
              description={t("cta_section_desc")}
              actions={
                <>
                  <Link
                    to="/como-llegar"
                    className="group inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-4 text-sm font-bold text-text-primary shadow-xl transition-all hover:scale-105 hover:bg-surface-muted hover:shadow-2xl"
                  >
                    <Navigation className="h-4 w-4 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    {t("Cómo llegar al municipio")}
                  </Link>
                  <Link
                    to="/agenda"
                    className="group inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-7 py-4 text-sm font-bold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/20 hover:shadow-xl"
                  >
                    <CalendarDays className="h-4 w-4 text-white/70 transition-transform group-hover:scale-110" />
                    {t("Visitar la agenda")}
                  </Link>
                </>
              }
            />
          </MotionReveal>
        </div>
      </section>
    </main>
  );
}

function SessionInitializer() {
  const initializeSession = useAuthStore((state) => state.initializeSession);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;
    void initializeSession();
  }, [initializeSession]);

  return null;
}

import { CabritaPremiumMaintenance } from "@/components/feedback/CabritaPremiumMaintenance";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { subscribeToApiErrors, API_BASE_URL } from "@/lib/api";
import { notifications as toast } from "@/lib/notifications";

const FORCED_LOGOUT_TOAST_ID = "forced-logout";

export default function App() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const language = useLanguageStore((state) => state.language);

  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
    document.cookie = `django_language=${language}; path=/; max-age=31536000; SameSite=Lax`;
  }, [language]);

  useEffect(() => {
    // 1. Chequeo inicial rápido al cargar el frontend
    const runHealthCheck = async () => {
      try {
        const resp = await fetch(`${API_BASE_URL}/categories/`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (!resp.ok && (resp.status === 503 || resp.status === 502)) {
          setIsMaintenance(true);
        }
      } catch {
        // Error de conexión de red (backend caído)
        setIsMaintenance(true);
      }
    };

    void runHealthCheck();

    // 2. Suscripción global a errores de la API
    const unsubscribe = subscribeToApiErrors((error) => {
      if (
        error.isNetworkError ||
        error.status === 503 ||
        error.status === 502
      ) {
        setIsMaintenance(true);
        return;
      }

      // Forzar cierre de sesión si el backend rechaza la autenticación
      if (error.status === 401 || error.status === 403) {
        const state = useAuthStore.getState();
        if (state.isAuthenticated) {
          state.logout();
          toast.error("Tu sesión ha expirado. Inicia sesión de nuevo.", {
            id: FORCED_LOGOUT_TOAST_ID,
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (isMaintenance) {
    return <CabritaPremiumMaintenance />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <MainLayout>
          <SessionInitializer />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/agenda/:slug" element={<EventDetailPage />} />
            <Route path="/lugares" element={<PlacesPage />} />
            <Route
              path="/lugares/:slug"
              element={<LegacyBeachPlaceRedirect />}
            />
            <Route path="/playas/:slug" element={<BeachDetailPage />} />
            <Route path="/categorias" element={<CategoriesPage />} />
            <Route path="/categorias/:slug" element={<CategoryDetailPage />} />
            <Route path="/rankings" element={<RankingsPage />} />
            <Route path="/como-llegar" element={<ComoLlegarPage />} />
            <Route path="/noticias/:slug" element={<NewsDetailPage />} />
            <Route path="/historias" element={<StorytellingPage />} />
            <Route path="/historias/:slug" element={<StoryDetailPage />} />
            <Route path="/mis-favoritos" element={<FavoritesPage />} />
            <Route path="/rutas" element={<RoutesPage />} />
            <Route path="/rutas/roadmap" element={<RoadmapPage />} />
            <Route path="/rutas/:slug" element={<RouteDetailPage />} />
            <Route path="/festes" element={<FestesPage />} />
            <Route path="/festes/programacio" element={<ProgrammingPage />} />
            <Route path="/festes/:slug" element={<FestaDetailPage />} />
            <Route path="/noticias" element={<NewsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/password-reset" element={<PasswordResetPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MainLayout>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
