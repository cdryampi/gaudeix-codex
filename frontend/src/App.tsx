import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { Facebook, Instagram, X, Youtube } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { InteractiveMap } from "@/components/site/InteractiveMap";
import { HeroVideoFrame } from "@/features/hero/components/HeroVideo";
import { apiGet } from "@/lib/api";
import { listEventItems } from "@/features/events/api";
import { FEATURED_CATEGORIES } from "@/features/categories/categoriesData";
import { FeaturedCategoryCard } from "@/features/categories/components/FeaturedCategoryCard";
import { AnimatedCardGrid } from "@/components/animated/AnimatedCardGrid";
import { EventCard } from "@/features/agenda/components/EventCard";
import { NewsCard } from "@/features/news/components/NewsCard";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import PasswordResetPage from "@/pages/PasswordResetPage";
import { events as mockEvents, type EventItem } from "@/data/mockEvents";
import { news as mockNews, type NewsItem } from "@/data/mockNews";

// Re-export X as Twitter for clarity
const Twitter = X;

type SiteSettings = {
  site_name: string;
  tagline: string;
};

export default function App() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [featuredEvents, setFeaturedEvents] = useState<EventItem[]>(() =>
    mockEvents.filter((e) => e.featured).slice(0, 6)
  );
  const [latestNews, setLatestNews] = useState<NewsItem[]>(() =>
    mockNews.slice(0, 3)
  );

  useEffect(() => {
    const load = async () => {
      try {
        const site = await apiGet<SiteSettings>("/site-settings/");
        setSettings(site);
      } catch (err) {
        console.warn("Landing running in mock mode (API not available).", err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const items = await listEventItems({ upcoming: true, featured: true, limit: 6, isPublished: true });
        setFeaturedEvents(items);
      } catch (err) {
        console.warn("Featured events running in mock mode (API not available).", err);
      }
    };

    load();
  }, []);

  const featuredCategories = useMemo(
    () => [
      {
        title: "Rutas y senderismo",
        img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Playas y calas",
        img: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Patrimonio histórico",
        img: "https://images.unsplash.com/photo-1526481280695-3c687fd5432c?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Gastronomía local",
        img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Eventos culturales",
        img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Deportes acuáticos",
        img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Alojamientos con encanto",
        img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Artesanía y tradiciones",
        img: "https://images.unsplash.com/photo-1520975676386-2f6fddcfa3c0?auto=format&fit=crop&w=900&q=80",
      },
    ],
    []
  );
  const featuredCategoriesFromData = FEATURED_CATEGORIES;

  function HomePage() {
    return (
      <div className="min-h-screen bg-background-light text-text-primary">
        <SiteHeader siteName={settings?.site_name} />

        <main>
          <section id="inicio">
            <HeroVideoFrame />

            <div className="hidden relative h-[520px] overflow-hidden rounded-3xl bg-gray-200 shadow-sm ring-1 ring-gray-200">
              <img
                src="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=2400&q=80"
                alt="Costa de Cabrera de Mar"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/20" />

              <div className="relative flex h-full items-center justify-center px-6">
                <div className="max-w-3xl text-center text-white">
                  <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight drop-shadow md:text-5xl">
                    Descubre la magia de Cabrera de Mar
                  </h1>
                  <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm/6 text-white/90 md:text-base">
                    Explora la belleza de Cabrera de Mar, un destino que combina historia, cultura y naturaleza en un
                    entorno mediterráneo único.
                  </p>
                  <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                    <Button
                      variant="success"
                      size="lg"
                      asChild
                    >
                      <a href="#categorias">Explorar</a>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      asChild
                      className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    >
                      <a href="#eventos">Ver agenda</a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="categorias" className="py-16">
            <div className="container">
              <h2 className="text-center text-2xl font-semibold tracking-tight">Categorías destacadas</h2>
              <AnimatedCardGrid className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featuredCategoriesFromData.map((c) => (
                  <FeaturedCategoryCard key={c.id} category={c} />
                ))}
              </AnimatedCardGrid>
            </div>
          </section>

          <section id="eventos" className="bg-gray-50 py-16">
            <div className="container">
              <h2 className="text-center text-2xl font-semibold tracking-tight">Eventos destacados</h2>
              <AnimatedCardGrid className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {featuredEvents.slice(0, 6).map((evt) => (
                  <EventCard key={evt.id} event={evt} />
                ))}
              </AnimatedCardGrid>


            </div>
          </section>

          <section id="noticias" className="py-16">
            <div className="container">
              <div className="mb-10 flex items-end justify-between px-4">
                <div className="space-y-1">
                  <h2 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">Últimas noticias</h2>
                  <p className="text-sm text-text-secondary">Mantente informado sobre todo lo que sucede en el municipio.</p>
                </div>
                <a href="/noticias" className="hidden text-sm font-bold text-primary hover:text-primary/80 sm:block">
                  Ver todas las noticias →
                </a>
              </div>

              <AnimatedCardGrid className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {latestNews.slice(0, 3).map((news) => (
                  <NewsCard key={news.id} news={news} />
                ))}
              </AnimatedCardGrid>

              <div className="mt-10 flex justify-center sm:hidden">
                <Button variant="outline" className="w-full" asChild>
                  <a href="/noticias">Ver todas las noticias</a>
                </Button>
              </div>
            </div>
          </section>

          <section id="mapa" className="py-16">
            <div className="container">
              <h2 className="text-center text-2xl font-semibold tracking-tight">Mapa interactivo</h2>
              <div className="mx-auto mt-10 max-w-5xl">
                <InteractiveMap />
              </div>
            </div>
          </section>

          <section id="newsletter" className="bg-gray-50 py-16">
            <div className="container">
              <h2 className="text-center text-2xl font-semibold tracking-tight">Suscríbete a nuestra newsletter</h2>
              <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-text-secondary">
                Recibe las últimas noticias, eventos y ofertas exclusivas directamente en tu bandeja de entrada.
              </p>
              <form className="mx-auto mt-8 flex max-w-xl overflow-hidden rounded-lg border border-border-light bg-white shadow-sm">
                <input
                  className="h-11 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-text-tertiary"
                  placeholder="Tu correo electrónico"
                  type="email"
                />
                <button
                  className="h-11 bg-primary px-6 text-sm font-medium text-white hover:bg-primary/90"
                  type="button"
                >
                  Suscribirse
                </button>
              </form>
            </div>
          </section>

          <section id="como-llegar" className="py-16">
            <div className="container">
              <h2 className="text-center text-2xl font-semibold tracking-tight">Cómo llegar</h2>
              <div className="mx-auto mt-8 max-w-xl space-y-3">
                <input
                  className="h-11 w-full rounded-lg border border-border-light bg-white px-4 text-sm outline-none placeholder:text-text-tertiary focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Tu ubicación (opcional)"
                />
                <Button variant="success" size="xl" className="w-full">
                  Obtener indicaciones
                </Button>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-border-light bg-white py-10">
          <div className="container grid gap-8 md:grid-cols-3">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-text-primary">{settings?.site_name || "Gaudeix Cabrera de Mar"}</p>
              <p className="text-sm text-text-secondary">{settings?.tagline || "Turisme i cultura a Cabrera de Mar"}</p>
              <p className="mt-3 text-xs text-text-tertiary">© {new Date().getFullYear()} Ajuntament de Cabrera de Mar</p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-secondary md:justify-end">
              <a className="no-underline hover:text-text-primary" href="#page-privacy">
                Política de privacidad
              </a>
              <a className="no-underline hover:text-text-primary" href="#page-cookies">
                Cookies
              </a>
              <a className="no-underline hover:text-text-primary" href="#page-legal_notice">
                Aviso legal
              </a>
              <a className="no-underline hover:text-text-primary" href="#page-contact">
                Contacto
              </a>
            </div>
            <div className="flex items-center gap-4 md:justify-end">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-text-secondary transition hover:bg-gray-200 hover:text-text-primary"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-text-secondary transition hover:bg-gray-200 hover:text-text-primary"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-text-secondary transition hover:bg-gray-200 hover:text-text-primary"
                aria-label="Twitter / X"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-text-secondary transition hover:bg-gray-200 hover:text-text-primary"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/password-reset" element={<PasswordResetPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
