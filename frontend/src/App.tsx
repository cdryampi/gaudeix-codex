import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Facebook, Instagram, X, Youtube, ArrowRight, Calendar, Newspaper, LayoutGrid, MapPin, ChevronRight, Filter } from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { InteractiveMap } from "@/components/site/InteractiveMap";
import { HeroVideoFrame } from "@/features/hero/components/HeroVideo";
import { apiGet } from "@/lib/api";
import { listEventItems } from "@/features/events/api";
import { FEATURED_CATEGORIES } from "@/features/categories/categoriesData";
import { FeaturedCategoryCard } from "@/features/categories/components/FeaturedCategoryCard";
import { EventCard } from "@/features/agenda/components/EventCard";
import { NewsCard } from "@/features/news/components/NewsCard";
import { EventDayGroup } from "@/features/agenda/components/EventDayGroup";
import { groupEventsByDay, filterEvents, DateRangeFilter } from "@/features/agenda/utils";
import { DateSelector } from "@/features/agenda/components/DateSelector";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import PasswordResetPage from "@/pages/PasswordResetPage";
import NewsDetailPage from "@/pages/NewsDetailPage";

import { events as mockEvents, type EventItem } from "@/data/mockEvents";
import { news as mockNews } from "@/data/mockNews";
import { listNewsItems } from "@/features/news/api";
import type { NewsItem } from "@/features/news/types";

import logoCabrera from "@/assets/logo/logo-cabrera-white.png";

export default function App() {
  const [settings, setSettings] = useState<{ site_name: string; tagline: string } | null>(null);
  const [allEvents, setAllEvents] = useState<EventItem[]>(() => mockEvents);

  const [eventFilter, setEventFilter] = useState<DateRangeFilter>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const [latestNews, setLatestNews] = useState<NewsItem[]>(() =>
    mockNews.slice(0, 3)
  );

  useEffect(() => {
    const load = async () => {
      try {
        const site = await apiGet<{ site_name: string; tagline: string }>("/site-settings/");
        setSettings(site);
      } catch (err) {
        console.warn("API not available, using mock mode.", err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const items = await listEventItems({ upcoming: true, isPublished: true });
        if (items && items.length > 0) {
          setAllEvents(items);
        }
      } catch (err) {
        console.warn("Using mock events.", err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const items = await listNewsItems();
        if (items && items.length > 0) {
          setLatestNews(items.slice(0, 3));
        }
      } catch (err) {
        console.warn("Using mock news.", err);
      }
    };
    loadNews();
  }, []);

  const visibleEvents = useMemo(() => {
    return filterEvents(allEvents, { category: "all", range: eventFilter, query: "" });
  }, [allEvents, eventFilter]);

  const groupedEvents = useMemo(() => {
    return groupEventsByDay(visibleEvents);
  }, [visibleEvents]);

  function HomePage() {
    return (
      <div className="min-h-screen bg-white text-slate-900 selection:bg-accent selection:text-slate-950">
        <SiteHeader siteName={settings?.site_name} />

        <main className="relative">
          {/* SECTION 1: VIDEO HERO */}
          <section id="inicio" className="h-screen">
            <HeroVideoFrame />
          </section>

          {/* SECTION 2: CATEGORIES */}
          <section id="categorias">
            <div className="min-h-screen flex flex-col justify-center px-6 md:px-20 py-24 bg-white">
              <span className="text-sm font-black uppercase tracking-[0.5em] text-primary mb-8">Municipio</span>
              <h2 className="text-[clamp(4rem,15vw,18rem)] font-black uppercase tracking-tighter leading-[0.75] text-slate-900">
                Explora <br />
                <span className="text-primary">el Pueblo</span>
              </h2>
              <p className="text-3xl md:text-5xl font-bold leading-tight text-slate-400 mt-16 max-w-4xl tracking-tight text-balance">
                Descubre la esencia de Cabrera de Mar, donde la historia se funde con el Mediterráneo.
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
              <span className="text-base font-black uppercase tracking-[0.5em] text-accent mb-8">Agenda Cultural</span>
              <h2 className="text-[clamp(4rem,15vw,18rem)] font-black leading-[0.75] tracking-tighter text-white">
                AGENDA <br />
                <span className="italic text-accent">VIVA</span>
              </h2>

              <div className="mt-20 flex flex-wrap gap-4 items-center mb-12">
                {[
                  { id: "all", label: "Todo" },
                  { id: "week", label: "Semana" },
                  { id: "month", label: "Mes" }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setEventFilter(f.id as any)}
                    className={`h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${eventFilter === f.id ? 'bg-accent text-slate-900 shadow-lg' : 'bg-white/5 text-white/60 hover:bg-white/10'
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
                  <EventDayGroup key={group.dayLabel} dayLabel={group.dayLabel} items={group.items} />
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
              <span className="text-sm font-black uppercase tracking-[0.5em] text-primary mb-8">Información</span>
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
          <section id="mapa" className="bg-slate-50">
            <div className="min-h-screen flex flex-col justify-center px-6 md:px-20 py-24 bg-slate-50 items-center text-center">
              <span className="text-base font-black uppercase tracking-[0.5em] text-slate-400 mb-8">Equipamientos</span>
              <h2 className="text-[clamp(4rem,15vw,18rem)] font-black text-slate-900 tracking-tighter leading-[0.75] uppercase">EL MAPA</h2>
              <div className="mt-12 h-2 w-48 bg-accent mx-auto" />
            </div>

            <div className="container mx-auto px-6 pb-48">
              <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[80px] border-[16px] border-white shadow-2xl">
                <InteractiveMap />
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="bg-[#0A0C10] py-48 text-white">
            <div className="container mx-auto px-6 lg:px-20 text-center lg:text-left">
              <div className="grid gap-32 lg:grid-cols-2">
                <div className="space-y-16">
                  <div className="flex flex-col items-center lg:items-start">
                    <img src={logoCabrera} alt="Logo Cabrera" className="h-32 w-auto mb-8" />
                    <div>
                      <h3 className="text-4xl font-black tracking-tighter uppercase">{settings?.site_name || "AYUNTAMIENTO DE CABRERA DE MAR"}</h3>
                      <p className="text-xl font-bold uppercase tracking-[0.6em] text-accent mt-2">LA ESENCIA DEL MARESME</p>
                    </div>
                  </div>
                  <div className="flex gap-10 justify-center lg:justify-start">
                    {[Facebook, Instagram, X, Youtube].map((Icon, idx) => (
                      <a key={idx} href="#" className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 border border-white/10 text-white transition hover:bg-white hover:text-slate-950">
                        <Icon className="h-8 w-8" />
                      </a>
                    ))}
                  </div>
                </div>
                <div className="grid gap-20 sm:grid-cols-2">
                  <div className="space-y-10">
                    <h4 className="text-xs font-black uppercase tracking-[0.6em] text-white/30">INFORMACIÓN</h4>
                    <nav className="flex flex-col gap-6 text-2xl font-bold">
                      <a href="#" className="hover:text-accent">Privacidad</a>
                      <a href="#" className="hover:text-accent">Cookies</a>
                      <a href="#" className="hover:text-accent">Aviso Legal</a>
                    </nav>
                  </div>
                  <div className="space-y-10">
                    <h4 className="text-xs font-black uppercase tracking-[0.6em] text-white/30">CONTACTO</h4>
                    <p className="text-2xl font-bold leading-relaxed">Plaça de la Vila, 1 <br /> 08349 Cabrera de Mar <br /> 93 759 00 91</p>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/noticias/:slug" element={<NewsDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/password-reset" element={<PasswordResetPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
