import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Newspaper, RadioTower } from "lucide-react";

import { FilterBar, PageHero, SectionHeader } from "@/components/site/primitives";
import { MotionReveal } from "@/components/animated/MotionReveal";
import { AnimatedCardGrid } from "@/components/animated/AnimatedCardGrid";
import { listNewsItems } from "@/features/news/api";
import { NewsCard } from "@/features/news/components/NewsCard";
import type { NewsCategory } from "@/features/news/types";

const NEWS_CATEGORIES: NewsCategory[] = [
  "Actualidad",
  "Cultura",
  "Deportes",
  "Urbanismo",
  "Turismo",
  "Medio ambiente",
  "Educación",
  "Salud",
];

export function NewsPage() {
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  const {
    data: newsItems = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["news", "list"],
    queryFn: listNewsItems,
  });

  const filteredNews = useMemo(() => {
    let result = newsItems;

    if (category !== "all") {
      result = result.filter((item) => item.category === category);
    }

    if (query.trim()) {
      const currentQuery = query.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(currentQuery) ||
          item.excerpt?.toLowerCase().includes(currentQuery),
      );
    }

    return result;
  }, [newsItems, category, query]);

  return (
    <main className="min-h-screen bg-background-light page-shell-offset text-slate-900">
      <PageHero
        eyebrow="Informacion municipal"
        title="Noticias, avisos y comunicacion local con una portada mas viva"
        description="La actualidad del municipio gana una entrada mas visual y periodica, con filtros claros y un archivo de noticias mas facil de consultar."
        tone="immersive"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Noticias" },
        ]}
        metrics={[
          { label: "Publicaciones", value: `${newsItems.length} noticias` },
          { label: "Categoria activa", value: category === "all" ? "Todas" : category },
          { label: "Uso publico", value: "Avisos, cultura y actualidad" },
        ]}
      />

      <div className="page-container space-y-10 py-10">
        <MotionReveal>
          <FilterBar>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setCategory("all")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${category === "all"
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  Todas
                </button>
                {NEWS_CATEGORIES.map((newsCategory) => (
                  <button
                    key={newsCategory}
                    onClick={() => setCategory(newsCategory)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${category === newsCategory
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                  >
                    {newsCategory}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Buscar noticias..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 rounded-2xl border border-[color:var(--color-border-soft)] bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </FilterBar>
        </MotionReveal>

        {loading ? (
          <div className="card-surface flex items-center justify-center py-20 text-center">
            <p className="text-lg font-semibold text-slate-500">Cargando noticias...</p>
          </div>
        ) : error ? (
          <div className="card-surface flex items-center justify-center py-20 text-center">
            <p className="text-lg font-semibold text-red-500">
              No hemos podido conectar con las noticias.
            </p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="card-surface flex flex-col items-center justify-center py-20 text-center">
            <Newspaper className="mb-4 h-12 w-12 text-slate-300" />
            <span className="text-xl font-semibold text-slate-500">
              No hay noticias para esta seleccion.
            </span>
          </div>
        ) : (
          <section className="space-y-6">
            <MotionReveal>
              <SectionHeader
                eyebrow="Archivo municipal"
                title={`${filteredNews.length} noticia${filteredNews.length === 1 ? "" : "s"} disponibles`}
                description="Consulta el detalle completo de cada publicación municipal con una lectura más clara y editorial."
                action={
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/12 bg-white/80 px-4 py-2 text-sm font-semibold text-primary">
                    <RadioTower className="h-4 w-4" />
                    Información actualizada
                  </div>
                }
              />
            </MotionReveal>
            <AnimatedCardGrid className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10">
              {filteredNews.map((news) => (
                <NewsCard key={news.id} news={news} />
              ))}
            </AnimatedCardGrid>
          </section>
        )}
      </div>
    </main>
  );
}
