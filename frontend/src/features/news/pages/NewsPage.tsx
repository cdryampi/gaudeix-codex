import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Newspaper } from "lucide-react";

import { listNewsItems } from "@/features/news/api";
import { NewsCard } from "@/features/news/components/NewsCard";
import type { NewsItem, NewsCategory } from "@/features/news/types";

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

    // Filter by category
    if (category !== "all") {
      result = result.filter((n) => n.category === category);
    }

    // Filter by search query
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.excerpt?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [newsItems, category, query]);

  return (
    <main className="min-h-screen bg-background-light text-slate-900 selection:bg-primary/20 selection:text-slate-900">
      {/* High-Impact Hero Header */}
      <section className="min-h-[64vh] flex flex-col justify-center px-6 md:px-20 py-24 bg-[color:var(--color-background-dark)] relative overflow-hidden">
        {/* Background Accent Blur */}
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/90 mb-6 block">
            Información Municipal
          </span>
          <h1 className="text-[clamp(2.4rem,8vw,5.75rem)] font-semibold leading-tight tracking-tight text-white mb-8">
            Noticias <br />
            <span className="text-accent">oficiales</span>
          </h1>

          <p className="text-base md:text-xl font-medium leading-relaxed text-slate-300 max-w-3xl mb-12">
            Las últimas noticias y crónicas oficiales de Cabrera de Mar.
            Actualidad, cultura, deportes y más.
          </p>

          {/* Filters */}
          <div className="flex flex-col gap-8">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setCategory("all")}
                className={`h-10 px-5 rounded-xl text-[11px] font-medium uppercase tracking-[0.08em] transition-colors ${
                  category === "all"
                    ? "bg-accent text-slate-900"
                    : "bg-white/10 text-white/90 hover:bg-white/20"
                }`}
              >
                Todas
              </button>
              {NEWS_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`h-10 px-5 rounded-xl text-[11px] font-medium uppercase tracking-[0.08em] transition-colors ${
                    category === cat
                      ? "bg-accent text-slate-900 shadow-lg"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar noticias..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:border-accent transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <div className="container mx-auto px-6 pb-28 pt-12">
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
            <p className="mt-8 text-xl font-black uppercase tracking-widest text-slate-500">
              Cargando noticias...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border-2 border-dashed border-red-500/30 bg-red-500/5 p-16 text-center">
            <p className="text-4xl font-black uppercase tracking-tighter text-red-500">
              Error en el sistema
            </p>
            <p className="mt-4 text-xl font-bold text-slate-400">
              No hemos podido conectar con las noticias.
            </p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed border-slate-300 rounded-3xl bg-white">
            <Newspaper className="h-16 w-16 text-slate-300 mx-auto mb-6" />
            <span className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-500">
              Sin noticias para esta selección
            </span>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Results Count */}
            <div className="flex items-center gap-6">
              <h2 className="text-xl font-semibold tracking-tight text-primary">
                {filteredNews.length}{" "}
                {filteredNews.length === 1 ? "Noticia" : "Noticias"}
              </h2>
              <div className="h-px flex-1 bg-slate-300" />
            </div>

            {/* Grid */}
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
              {filteredNews.map((news) => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
