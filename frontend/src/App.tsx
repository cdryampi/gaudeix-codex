import { useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { InteractiveMap } from "@/components/site/InteractiveMap";
import { HeroVideoFrame } from "@/features/hero/components/HeroVideo";
import { getEvents } from "@/features/events/api";
import { FEATURED_CATEGORIES } from "@/features/categories/categoriesData";
import { FeaturedCategoryCard } from "@/features/categories/components/FeaturedCategoryCard";
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
import NewsDetailPage from "@/pages/NewsDetailPage";
import { EventDetailPage } from "@/features/agenda/pages/EventDetailPage";
import { AgendaPage } from "@/features/agenda/pages/AgendaPage";
import { MainLayout } from "@/components/layouts/MainLayout";

import { listNewsItems } from "@/features/news/api";

function HomePage() {
  const [eventFilter, setEventFilter] = useState<DateRangeFilter>("all");

  // Fetch Events
  const { data: eventsData } = useQuery({
    queryKey: ["events", { is_published: true, limit: 100 }],
    queryFn: () => getEvents({ is_published: true, limit: 100 }),
  });

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
    return filterEvents(allEvents, {
      category: "all",
      range: eventFilter,
      query: "",
    });
  }, [allEvents, eventFilter]);

  const groupedEvents = useMemo(() => {
    return groupEventsByDay(visibleEvents);
  }, [visibleEvents]);

  return (
    <>
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
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_CATEGORIES.map((c) => (
              <FeaturedCategoryCard key={c.id} category={c} />
            ))}
          </div>
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
            groupedEvents.map((group) => (
              <EventDayGroup
                key={group.dayLabel}
                dayLabel={group.dayLabel}
                items={group.items}
              />
            ))
          ) : (
            <div className="py-24 text-center border-4 border-dashed border-white/10 rounded-[4rem]">
              <span className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white/20">
                No hay actividades para esta fecha
              </span>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4: NOTICIAS */}
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

      {/* SECTION 5: MAPA */}
      <section id="mapa" className="bg-slate-50 py-24">
        <div className="container mx-auto px-6">
          <div className="overflow-hidden rounded-[3rem] shadow-2xl">
            <InteractiveMap />
          </div>
        </div>
      </section>
    </>
  );
}

export default function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/agenda/:slug" element={<EventDetailPage />} />
        <Route path="/noticias/:slug" element={<NewsDetailPage />} />

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
