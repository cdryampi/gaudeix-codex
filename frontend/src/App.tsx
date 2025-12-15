import { useEffect, useMemo, useState } from "react";

import { Button } from "flowbite-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { apiGet } from "@/lib/api";

type SiteSettings = {
  site_name: string;
  tagline: string;
};

export default function App() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

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

  const featuredEvents = useMemo(
    () => [
      {
        title: "Festival de Música de Verano",
        desc: "Disfruta de conciertos al aire libre con artistas locales e internacionales.",
        img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Exposición de Arte Contemporáneo",
        desc: "Descubre las últimas tendencias en arte contemporáneo en un entorno único.",
        img: "https://images.unsplash.com/photo-1520694478161-5e30f1b4b3ad?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Mercado de Productos Locales",
        desc: "Sabor a producto fresco y artesanía de la comarca del Maresme.",
        img: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <SiteHeader siteName={settings?.site_name} />

      <main>
        <section id="inicio" className="py-10">
          <div className="container">
            <div className="relative h-[520px] overflow-hidden rounded-3xl bg-gray-200 shadow-sm ring-1 ring-gray-200">
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
                      color="success"
                      size="lg"
                      href="#categorias"
                      className="!bg-emerald-500 hover:!bg-emerald-600"
                    >
                      Explorar
                    </Button>
                    <Button
                      color="light"
                      size="lg"
                      outline
                      href="#eventos"
                      className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    >
                      Ver agenda
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="categorias" className="py-16">
          <div className="container">
            <h2 className="text-center text-2xl font-semibold tracking-tight">Categorías destacadas</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredCategories.map((c) => (
                <a
                  key={c.title}
                  href="#categorias"
                  className="group block overflow-hidden rounded-2xl bg-gray-100 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={c.img}
                      alt={c.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent p-4">
                      <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-900 shadow-sm">
                        {c.title}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="eventos" className="bg-gray-50 py-16">
          <div className="container">
            <h2 className="text-center text-2xl font-semibold tracking-tight">Eventos destacados</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {featuredEvents.map((e) => (
                <a
                  key={e.title}
                  href="#eventos"
                  className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                    <img
                      src={e.img}
                      alt={e.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-2 p-5">
                    <p className="text-sm font-semibold text-gray-900">{e.title}</p>
                    <p className="text-sm text-gray-600">{e.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="mapa" className="py-16">
          <div className="container">
            <h2 className="text-center text-2xl font-semibold tracking-tight">Mapa interactivo</h2>
            <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <iframe
                title="Mapa de Cabrera de Mar"
                className="h-[360px] w-full"
                src="https://www.openstreetmap.org/export/embed.html?bbox=2.375%2C41.51%2C2.43%2C41.55&layer=mapnik&marker=41.525%2C2.397"
              />
            </div>
          </div>
        </section>

        <section id="newsletter" className="bg-gray-50 py-16">
          <div className="container">
            <h2 className="text-center text-2xl font-semibold tracking-tight">Suscríbete a nuestra newsletter</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-gray-600">
              Recibe las últimas noticias, eventos y ofertas exclusivas directamente en tu bandeja de entrada.
            </p>
            <form className="mx-auto mt-8 flex max-w-xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <input
                className="h-11 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-gray-500"
                placeholder="Tu correo electrónico"
                type="email"
              />
              <button
                className="h-11 bg-emerald-500 px-6 text-sm font-medium text-white hover:bg-emerald-600"
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
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm outline-none placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Tu ubicación (opcional)"
              />
              <Button color="success" size="xl" className="w-full !bg-emerald-500 hover:!bg-emerald-600">
                Obtener indicaciones
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white py-10">
        <div className="container grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-gray-900">{settings?.site_name || "Gaudeix Cabrera de Mar"}</p>
            <p className="mt-1 text-sm text-gray-600">{settings?.tagline || "Turisme i cultura a Cabrera de Mar"}</p>
            <p className="mt-3 text-xs text-gray-500">© {new Date().getFullYear()} Ajuntament de Cabrera de Mar</p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 md:justify-end">
            <a className="no-underline hover:text-gray-900" href="#page-privacy">
              Política de privacidad
            </a>
            <a className="no-underline hover:text-gray-900" href="#page-cookies">
              Cookies
            </a>
            <a className="no-underline hover:text-gray-900" href="#page-legal_notice">
              Aviso legal
            </a>
            <a className="no-underline hover:text-gray-900" href="#page-contact">
              Contacto
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
