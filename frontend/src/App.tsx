import { useMemo, useState } from "react";
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

// Routes (hiking/cycling)
import { RoutesPage } from "@/features/routes/pages/RoutesPage";
import { RouteDetailPage } from "@/features/routes/pages/RouteDetailPage";

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
    <main>
      {/* SECTION 1: VIDEO HERO */}
      <section id="inicio" className="h-screen">
        <HeroVideoFrame />
      </section>

      {/* SECTION 2: CATEGORIES */}
      <section id="categorias">
        <div className="min-h-screen flex flex-col justify-center px-6 md:px-20 py-24 bg-white">
          <span className="text-sm font-black uppercase tracking-[0.5em] text-primary mb-8">
            Municipio
          </span>
          <h2 className="text-[clamp(4rem,15vw,18rem)] font-black uppercase tracking-tighter leading-[0.75] text-slate-900">
            Explora <br />
            <span className="text-primary">el Pueblo</span>
          </h2>
          <p className="text-3xl md:text-5xl font-bold leading-tight text-slate-400 mt-16 max-w-4xl tracking-tight text-balance">
            Descubre la esencia de Cabrera de Mar, donde la historia se funde
            con el Mediterráneo.
          </p>
        </div>

        <div className="container mx-auto px-6 pb-48">
          {!categoriesData && !featuredCategories.length ? (
            // Loading Skeleton
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-[400px] md:h-[540px] rounded-[4rem] bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : featuredCategories.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-20 border-4 border-dashed border-slate-100 rounded-[4rem]">
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
      <section id="eventos" className="bg-slate-950 text-white">
        <div className="min-h-screen flex flex-col justify-center px-6 md:px-20 py-24 bg-slate-950 uppercase">
          <span className="text-base font-black uppercase tracking-[0.5em] text-accent mb-8">
            Agenda Cultural
          </span>
          <h2 className="text-[clamp(4rem,15vw,18rem)] font-black leading-[0.75] tracking-tighter text-white">
            AGENDA <br />
            <span className="italic text-accent">VIVA</span>
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
                className={`h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  eventFilter === f.id
                    ? "bg-accent text-slate-900 shadow-lg"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
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
                  className="h-16 px-12 rounded-[2rem] bg-accent text-slate-900 text-xs font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform flex items-center shadow-2xl"
                >
                  Ver calendario completo
                </Link>
              </div>
            </>
          ) : (
            <div className="py-24 text-center border-4 border-dashed border-white/10 rounded-[4rem]">
              <span className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white/20">
                No hay actividades para esta fecha
              </span>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 5: NOTICIAS */}
      <section id="noticias">
        <div className="min-h-screen flex flex-col justify-center px-6 md:px-20 py-24 bg-white">
          <span className="text-sm font-black uppercase tracking-[0.5em] text-primary mb-8">
            Información
          </span>
          <h2 className="text-[clamp(4rem,15vw,18rem)] font-black text-slate-900 leading-[0.75] tracking-tighter uppercase">
            Actual <br />
            <span className="text-primary italic">idad</span>
          </h2>
          <p className="text-3xl md:text-5xl font-bold leading-tight text-slate-400 mt-16 max-w-4xl tracking-tight text-balance">
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
        className="bg-slate-950 py-32 overflow-hidden relative"
      >
        {/* Background Accents */}
        <div className="absolute -right-64 -top-64 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -left-64 -bottom-64 h-[600px] w-[600px] rounded-full bg-accent/5 blur-[120px]" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="mb-20">
            <span className="text-sm font-black uppercase tracking-[0.5em] text-accent mb-8 block">
              Explora el Territorio
            </span>
            <h2 className="text-[clamp(4rem,10vw,12rem)] font-black text-white leading-[0.75] tracking-tighter uppercase mb-12">
              MAPA <br />
              <span className="italic text-accent">INTERACTIVO</span>
            </h2>
            <p className="text-2xl md:text-3xl font-bold text-slate-400 max-w-3xl leading-snug tracking-tight">
              Localiza todos los puntos de interés, desde el patrimonio
              histórico hasta los mejores lugares para comer y dormir.
            </p>
          </div>

          <div className="overflow-hidden rounded-[4rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] h-[700px] border border-white/5 bg-slate-900 relative group">
            <InteractiveMap />

            {/* Map Overlay Button */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
              <Link
                to="/lugares"
                className="flex items-center gap-4 px-10 py-5 rounded-full bg-white text-slate-900 text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-transform"
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

export default function App() {
  return (
    <MainLayout>
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
