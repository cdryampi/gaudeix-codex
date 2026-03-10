import { useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  ChevronRight,
  MapPin,
  Navigation,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { InteractiveMap } from "@/components/site/InteractiveMap";
import {
  MunicipalCTA,
  SectionHeader,
} from "@/components/site/primitives";
import { CategoryBrandIcon } from "@/features/categories/components/CategoryBrandIcon";
import { HeroVideoFrame } from "@/features/hero/components/HeroVideo";
import { HomeExperienceGrid } from "@/features/hero/components/HomeExperienceGrid";
import { getEvents } from "@/features/events/api";
import { getCategories } from "@/features/categories/api";
import { NewsCard } from "@/features/news/components/NewsCard";
import {
  filterEvents,
  DateRangeFilter,
} from "@/features/agenda/utils";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import PasswordResetPage from "@/pages/PasswordResetPage";
import { NewsDetailPage } from "@/features/news/pages/NewsDetailPage";
import { EventDetailPage } from "@/features/agenda/pages/EventDetailPage";
import { AgendaPage } from "@/features/agenda/pages/AgendaPage";
import { PlacesPage } from "@/features/places/pages/PlacesPage";
import { PlaceDetailPage } from "@/features/places/pages/PlaceDetailPage";
import { LegacyBeachPlaceRedirect } from "@/features/places/pages/LegacyBeachPlaceRedirect";
import { RankingsPage } from "@/features/gamification/pages/RankingsPage";
import { CategoriesPage } from "@/features/categories/pages/CategoriesPage";
import { CategoryDetailPage } from "@/features/categories/pages/CategoryDetailPage";
import { ComoLlegarPage } from "@/features/site-settings/pages/ComoLlegarPage";
import { FavoritesPage } from "@/features/users/pages/FavoritesPage";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useAuthStore } from "@/features/auth/store";
import { RoutesPage } from "@/features/routes/pages/RoutesPage";
import { RouteDetailPage } from "@/features/routes/pages/RouteDetailPage";
import { RoadmapPage } from "@/features/routes/pages/RoadmapPage";
import { FestesPage } from "@/features/festes/pages/FestesPage";
import { FestaDetailPage } from "@/features/festes/pages/FestaDetailPage";
import { ProgrammingPage } from "@/features/festes/pages/ProgrammingPage";
import { NewsPage } from "@/features/news/pages/NewsPage";
import { listNewsItems } from "@/features/news/api";
import { Category } from "@/features/categories/types";
import { EventCard } from "@/features/agenda/components/EventCard";
import { AnimatedCardGrid } from "@/components/animated/AnimatedCardGrid";
import { MotionReveal } from "@/components/animated/MotionReveal";

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
  const image = category.featured_media?.variant_large || category.featured_media?.file;
  const isLarge = index === 0;

  return (
    <Link
      to={`/categorias/${category.slug}`}
      data-animated-card
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-slate-900 text-white shadow-xl ring-1 ring-white/10 transition-all duration-500 hover:shadow-2xl hover:ring-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        mosaicPattern[index % mosaicPattern.length],
        isLarge ? "min-h-[400px] md:min-h-[480px]" : "min-h-[280px] md:min-h-[320px]"
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
          <div className="flex h-10 w-10 shrink-0 transform items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:bg-white group-hover:text-slate-900">
            <ChevronRight className="h-5 w-5" />
          </div>
        </div>

        <div className="transform space-y-3 transition-transform duration-500 ease-out group-hover:-translate-y-1">
          <h3 className={cn("font-bold text-white", isLarge ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl")}>{category.nombre}</h3>
          {category.descripcion ? (
            <p className={cn("text-white/80", isLarge ? "max-w-xl text-base md:text-lg" : "text-sm md:text-base line-clamp-2 md:line-clamp-3")}>
              {category.descripcion}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}


function HomePage() {
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
    const list = Array.isArray(categoriesData) ? categoriesData : categoriesData?.results || [];
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

  return (
    <main className="bg-background-light text-[color:var(--color-text-primary)]">
      <HeroVideoFrame />

      <HomeExperienceGrid />

      <section id="categorias" className="page-section pt-6">
        <div className="page-container space-y-10">
          <MotionReveal>
            <SectionHeader
              eyebrow="Experiencias para descubrir"
              title="Un mosaico vivo para recorrer Cabrera de Mar"
              description="La portada se abre ahora con una capa inspiracional mas alegre y visual, mezclando playas, patrimonio, rutas, gastronomia y planes con un orden util."
              action={
                <Link
                  to="/categorias"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/12 bg-white/80 px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white"
                >
                  Ver todas las categorias
                  <ChevronRight className="h-4 w-4" />
                </Link>
              }
            />
          </MotionReveal>

          {!featuredCategories.length ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-surface h-[280px] animate-pulse bg-slate-100 lg:col-span-4" />
              ))}
            </div>
          ) : (
            <AnimatedCardGrid className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              {featuredCategories.map((category, index) => (
                <HomeMosaicTile key={category.id} category={category} index={index} />
              ))}
            </AnimatedCardGrid>
          )}
        </div>
      </section>

      <section id="eventos" className="page-section sand-section relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(15,76,129,0.04),transparent_60%)] w-[800px] h-[800px] pointer-events-none" />
        <div className="page-container relative z-10 grid gap-10 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
          <MotionReveal className="flex flex-col gap-8 lg:sticky lg:top-32 lg:h-max">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Agenda Viva
              </span>
              <h2 className="text-4xl font-bold leading-tight text-slate-900 lg:text-5xl">La cultura nunca se detiene.</h2>
              <p className="text-base leading-relaxed text-slate-600 lg:text-lg">
                Nuestra selección de planes, exposiciones, conciertos y actividades familiares que no te puedes perder.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: "today", label: "Hoy" },
                { id: "week", label: "Esta semana" },
                { id: "month", label: "Este mes" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setEventFilter(filter.id as DateRangeFilter)}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 ${eventFilter === filter.id
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                    : "bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm ring-1 ring-slate-200/50"
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
                Explorar agenda completa
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
            ) : (
              <div className="card-surface flex items-center justify-center py-16 text-center">
                <span className="text-xl font-semibold text-slate-500">
                  No hay actividades para esta seleccion.
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="mapa" className="page-section coast-section">
        <div className="page-container space-y-8">
          <MotionReveal>
            <SectionHeader
              eyebrow="Territorio en contexto"
              title="Mapa y lugares para orientarte antes y durante la visita"
              description="El explorador mantiene la herramienta publica, pero con una envolvente mas contemporanea y amable para residentes y visitantes."
              action={
                <Link
                  to="/lugares"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/12 bg-white/75 px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white"
                >
                  Abrir explorador completo
                  <ChevronRight className="h-4 w-4" />
                </Link>
              }
            />
          </MotionReveal>

          <MotionReveal>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white ring-1 ring-slate-100 shadow-[0_32px_80px_rgba(15,76,129,0.06)] md:rounded-[3rem]">
              <div className="absolute left-4 right-4 top-4 z-10 flex flex-col gap-4 pointer-events-none md:left-6 md:right-6 md:top-6 md:flex-row md:items-start md:justify-between">
                <div className="flex max-w-sm items-start gap-4 rounded-3xl bg-white/95 p-4 ring-1 ring-slate-900/5 backdrop-blur-md shadow-xl transition-transform duration-500 hover:scale-[1.02] pointer-events-auto">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-slate-100 text-primary">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold leading-tight text-slate-900">Explorador Interactivo</p>
                    <p className="text-xs font-medium leading-snug text-slate-500">
                      Zonas naturales, patrimonio y servicios sobre el territorio.
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-xl pointer-events-auto">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  Vista de Pájaro
                </div>
              </div>

              <div className="relative h-[600px] w-full bg-slate-50 md:h-[700px]">
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
              eyebrow="Actualidad local"
              title="Noticias, avisos y vida municipal con una lectura mas editorial"
              description="El bloque informativo gana ritmo visual sin perder claridad, con portada, imagen y acceso directo a cada publicacion."
              action={
                <Link
                  to="/noticias"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/12 bg-white/80 px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white"
                >
                  Ver noticias
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
              eyebrow="Planifica la visita"
              title="Turismo luminoso, agenda activa y un municipio reconocible en cada pantalla"
              description="La nueva capa visual mezcla energia mediterranea y utilidad publica: descubres el pueblo, encuentras la agenda, ubicas los recursos y llegas mejor."
              actions={
                <>
                  <Link
                    to="/como-llegar"
                    className="group inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-4 text-sm font-bold text-slate-900 shadow-xl transition-all hover:scale-105 hover:bg-slate-50 hover:shadow-2xl"
                  >
                    <Navigation className="h-4 w-4 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    Cómo llegar al municipio
                  </Link>
                  <Link
                    to="/agenda"
                    className="group inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-7 py-4 text-sm font-bold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/20 hover:shadow-xl"
                  >
                    <CalendarDays className="h-4 w-4 text-white/70 transition-transform group-hover:scale-110" />
                    Visitar la agenda
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

export default function App() {
  return (
    <MainLayout>
      <SessionInitializer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/agenda/:slug" element={<EventDetailPage />} />
        <Route path="/lugares" element={<PlacesPage />} />
        <Route path="/lugares/:slug" element={<LegacyBeachPlaceRedirect />} />
        <Route path="/playas/:slug" element={<PlaceDetailPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/categorias/:slug" element={<CategoryDetailPage />} />
        <Route path="/rankings" element={<RankingsPage />} />
        <Route path="/como-llegar" element={<ComoLlegarPage />} />
        <Route path="/noticias/:slug" element={<NewsDetailPage />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}
