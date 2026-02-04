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
    <main className="min-h-screen bg-slate-950 text-white selection:bg-accent selection:text-slate-950">
      {/* High-Impact Hero Header */}
      <section className="min-h-[80vh] flex flex-col justify-center px-6 md:px-20 py-32 bg-slate-950 uppercase relative overflow-hidden">
        {/* Background Accent Blur */}
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <span className="text-base font-black uppercase tracking-[0.5em] text-accent mb-8 block">
            Información Municipal
          </span>
          <h1 className="text-[clamp(4rem,15vw,15rem)] font-black leading-[0.8] tracking-tighter text-white mb-16">
            NOTI <br />
            <span className="italic text-accent">CIAS</span>
          </h1>

          <p className="text-xl md:text-3xl font-bold leading-tight text-slate-400 max-w-4xl tracking-tight mb-20 normal-case">
            Las últimas noticias y crónicas oficiales de Cabrera de Mar.
            Actualidad, cultura, deportes y más.
          </p>

          {/* Filters */}
          <div className="flex flex-col gap-8">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setCategory("all")}
                className={`h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  category === "all"
                    ? "bg-accent text-slate-900 shadow-lg"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                Todas
              </button>
              {NEWS_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
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
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar noticias..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-14 pl-16 pr-6 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <div className="container mx-auto px-6 pb-48">
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
            <p className="mt-8 text-xl font-black uppercase tracking-widest text-slate-500">
              Cargando noticias...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-[4rem] border-4 border-dashed border-red-500/20 bg-red-500/5 p-24 text-center">
            <p className="text-4xl font-black uppercase tracking-tighter text-red-500">
              Error en el sistema
            </p>
            <p className="mt-4 text-xl font-bold text-slate-400">
              No hemos podido conectar con las noticias.
            </p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="py-48 text-center border-4 border-dashed border-white/10 rounded-[4rem]">
            <Newspaper className="h-24 w-24 text-white/10 mx-auto mb-8" />
            <span className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white/10">
              Sin noticias para esta selección
            </span>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Results Count */}
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-accent">
                {filteredNews.length}{" "}
                {filteredNews.length === 1 ? "Noticia" : "Noticias"}
              </h2>
              <div className="h-px flex-1 bg-white/10" />
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
