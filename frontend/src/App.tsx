import { useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { InteractiveMap } from "@/components/site/InteractiveMap";
import { HeroVideoFrame } from "@/features/hero/components/HeroVideo";
import { getEvents } from "@/features/events/api";
import { ChevronRight } from "lucide-react";
import { getCategories } from "@/features/categories/api";
import {
  FeaturedCategoryCard,
  CategoryCardProps,
} from "@/features/categories/components/FeaturedCategoryCard";
import { NewsCard } from "@/features/news/components/NewsCard";
import { EventDayGroup } from "@/features/agenda/components/EventDayGroup";
import {
  groupEventsByDay,
  filterEvents,
  DateRangeFilter,
} from "@/features/agenda/utils";
import { DateSelector } from "@/features/agenda/components/DateSelector";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import PasswordResetPage from "@/pages/PasswordResetPage";
import { NewsDetailPage } from "@/features/news/pages/NewsDetailPage";
import { EventDetailPage } from "@/features/agenda/pages/EventDetailPage";
import { AgendaPage } from "@/features/agenda/pages/AgendaPage";
import { PlacesPage } from "@/features/places/pages/PlacesPage";
import { PlaceDetailPage } from "@/features/places/pages/PlaceDetailPage";
import { RankingsPage } from "@/features/gamification/pages/RankingsPage";
import { CategoriesPage } from "@/features/categories/pages/CategoriesPage";
import { CategoryDetailPage } from "@/features/categories/pages/CategoryDetailPage";
import { ComoLlegarPage } from "@/features/site-settings/pages/ComoLlegarPage";
import { FavoritesPage } from "@/features/users/pages/FavoritesPage";
import { VisitUsCTA } from "@/features/site-settings/components/VisitUsCTA";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useAuthStore } from "@/features/auth/store";

// Routes (hiking/cycling)
import { RoutesPage } from "@/features/routes/pages/RoutesPage";
import { RouteDetailPage } from "@/features/routes/pages/RouteDetailPage";
import { RoadmapPage } from "@/features/routes/pages/RoadmapPage";

// Festes (festivals)
import { FestesPage } from "@/features/festes/pages/FestesPage";
import { FestaDetailPage } from "@/features/festes/pages/FestaDetailPage";
import { ProgrammingPage } from "@/features/festes/pages/ProgrammingPage";

// News
import { NewsPage } from "@/features/news/pages/NewsPage";

import { listNewsItems } from "@/features/news/api";
import { Category } from "@/features/categories/types";

function HomePage() {
  const [eventFilter, setEventFilter] = useState<DateRangeFilter>("all");

  // Fetch Events
  const { data: eventsData } = useQuery({
    queryKey: ["events", { is_published: true, limit: 10, upcoming: true }],
    queryFn: () => getEvents({ is_published: true, limit: 10, upcoming: true }),
  });

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const featuredCategories = useMemo(() => {
    const list = Array.isArray(categoriesData)
      ? categoriesData
      : categoriesData?.results || [];
    return list.slice(0, 8);
  }, [categoriesData]);

  const allEvents = useMemo(() => {
    if (!eventsData) return [];
    if (Array.isArray(eventsData)) return eventsData;
    return eventsData.results || [];
  }, [eventsData]);

  // Fetch News
  const { data: latestNews = [] } = useQuery({
    queryKey: ["news", "latest"],
    queryFn: async () => {
      const items = await listNewsItems();
      return items?.slice(0, 3) || [];
    },
  });

  const visibleEvents = useMemo(() => {
    const filtered = filterEvents(allEvents, {
      category: "all",
      range: eventFilter,
      query: "",
    });
    return filtered.slice(0, 10);
  }, [allEvents, eventFilter]);

  const groupedEvents = useMemo(() => {
    return groupEventsByDay(visibleEvents);
  }, [visibleEvents]);

  return (
    <main className="bg-background-light text-[color:var(--color-text-primary)]">
      {/* SECTION 1: VIDEO HERO */}
      <section id="inicio" className="h-screen">
        <HeroVideoFrame />
      </section>

      {/* SECTION 2: CATEGORIES */}
      <section id="categorias">
        <div className="min-h-screen flex flex-col justify-center px-6 md:px-20 py-24 bg-background-light">
          <span className="text-xs font-bold uppercase tracking-[0.32em] text-primary/90 mb-6">
            Municipio
          </span>
          <h2 className="text-[clamp(2.25rem,7vw,6rem)] font-bold tracking-tight leading-[1.02] text-slate-900">
            Explora <br />
            <span className="text-primary">el municipio</span>
          </h2>
          <p className="text-lg md:text-2xl font-medium leading-relaxed text-slate-600 mt-10 max-w-3xl text-balance">
            Descubre la esencia de Cabrera de Mar, donde la historia se funde
            con el Mediterráneo.
          </p>
        </div>

        <div className="container mx-auto px-6 pb-32">
          {!categoriesData && !featuredCategories.length ? (
            // Loading Skeleton
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-[380px] md:h-[500px] rounded-3xl bg-slate-200/70 animate-pulse"
                />
              ))}
            </div>
          ) : featuredCategories.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-300 rounded-3xl bg-white">
              <p className="text-2xl font-bold text-slate-300 uppercase tracking-widest text-center">
                Próximamente más categorías
              </p>
            </div>
          ) : (
            // Categories Grid
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
              {featuredCategories.map((c: Category) => {
                const props: CategoryCardProps = {
                  id: c.id,
                  title: c.nombre,
                  href: `/categorias/${c.slug}`,
                  image:
                    c.featured_media?.variant_medium || c.featured_media?.file,
                  icon: c.icon,
                  description: c.descripcion,
                  taxonomy: c.taxonomy,
                };
                return <FeaturedCategoryCard key={c.id} category={props} />;
              })}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 3: AGENDA */}
      <section id="eventos" className="bg-[color:var(--color-background-dark)] text-white">
        <div className="min-h-screen flex flex-col justify-center px-6 md:px-20 py-24 bg-[color:var(--color-background-dark)]">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent/90 mb-6">
            Agenda Cultural
          </span>
          <h2 className="text-[clamp(2.2rem,8vw,5.5rem)] font-semibold leading-tight tracking-tight text-white">
            Agenda <br />
            <span className="text-accent">municipal</span>
          </h2>

          <div className="mt-20 flex flex-wrap gap-4 items-center mb-12">
            {[
              { id: "all", label: "Todo" },
              { id: "week", label: "Semana" },
              { id: "month", label: "Mes" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setEventFilter(f.id as any)}
                className={`h-11 px-6 rounded-xl text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${eventFilter === f.id
                    ? "bg-accent text-slate-900"
                    : "bg-white/10 text-white/85 hover:bg-white/20"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <DateSelector selected={eventFilter} onSelect={setEventFilter} />
        </div>

        <div className="container mx-auto px-6 pb-48 space-y-32">
          {groupedEvents.length > 0 ? (
            <>
              {groupedEvents.map((group) => (
                <EventDayGroup
                  key={group.dayLabel}
                  dayLabel={group.dayLabel}
                  items={group.items}
                />
              ))}
              <div className="flex justify-center mt-20">
                <Link
                  to="/agenda"
                  className="h-12 px-8 rounded-xl bg-accent text-slate-900 text-[11px] font-semibold uppercase tracking-[0.12em] hover:bg-accent/90 transition-colors flex items-center"
                >
                  Ver calendario completo
                </Link>
              </div>
            </>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-white/20 rounded-3xl">
              <span className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white/20">
                No hay actividades para esta fecha
              </span>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 5: NOTICIAS */}
      <section id="noticias">
        <div className="min-h-screen flex flex-col justify-center px-6 md:px-20 py-24 bg-background-light">
          <span className="text-sm font-black uppercase tracking-[0.5em] text-primary mb-8">
            Información
          </span>
          <h2 className="text-[clamp(2.25rem,7vw,6rem)] font-bold text-slate-900 leading-tight tracking-tight">
            Actual <br />
            <span className="text-primary">municipal</span>
          </h2>
          <p className="text-lg md:text-2xl font-medium leading-relaxed text-slate-600 mt-10 max-w-3xl text-balance">
            Las últimas noticias y crónicas oficiales de nuestra villa.
          </p>
        </div>

        <div className="container mx-auto px-6 pb-48">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-3">
            {latestNews.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: MAPA */}
      <section
        id="mapa"
        className="bg-[color:var(--color-background-dark)] py-24 overflow-hidden relative"
      >
        {/* Background Accents */}
        <div className="absolute -right-64 -top-64 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -left-64 -bottom-64 h-[600px] w-[600px] rounded-full bg-accent/5 blur-[120px]" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="mb-20">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent/90 mb-6 block">
              Explora el Territorio
            </span>
            <h2 className="text-[clamp(2.25rem,6vw,4.8rem)] font-semibold text-white leading-tight tracking-tight mb-8">
              Mapa <br />
              <span className="text-accent">interactivo</span>
            </h2>
            <p className="text-lg md:text-xl font-medium text-slate-300 max-w-3xl leading-relaxed">
              Localiza todos los puntos de interés, desde el patrimonio
              histórico hasta los mejores lugares para comer y dormir.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.35)] h-[700px] border border-white/10 bg-slate-900 relative group">
            <InteractiveMap />

            {/* Map Overlay Button */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
              <Link
                to="/lugares"
                className="flex items-center gap-3 px-7 py-3 rounded-xl bg-white text-slate-900 text-[11px] font-semibold uppercase tracking-[0.12em] shadow-lg hover:bg-slate-100 transition-colors"
              >
                Abrir explorador completo
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: VISIT US CTA */}
      <VisitUsCTA />
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

export default function App() {
  return (
    <MainLayout>
      <SessionInitializer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/agenda/:slug" element={<EventDetailPage />} />
        <Route path="/lugares" element={<PlacesPage />} />
        <Route path="/lugares/:slug" element={<PlaceDetailPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/categorias/:slug" element={<CategoryDetailPage />} />
        <Route path="/rankings" element={<RankingsPage />} />
        <Route path="/como-llegar" element={<ComoLlegarPage />} />
        <Route path="/noticias/:slug" element={<NewsDetailPage />} />

        {/* User Routes */}
        <Route path="/mis-favoritos" element={<FavoritesPage />} />

        {/* Routes (hiking/cycling) */}
        <Route path="/rutas" element={<RoutesPage />} />
        <Route path="/rutas/roadmap" element={<RoadmapPage />} />
        <Route path="/rutas/:slug" element={<RouteDetailPage />} />

        {/* Festes (festivals) */}
        <Route path="/festes" element={<FestesPage />} />
        <Route path="/festes/programacio" element={<ProgrammingPage />} />
        <Route path="/festes/:slug" element={<FestaDetailPage />} />

        {/* News */}
        <Route path="/noticias" element={<NewsPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}
