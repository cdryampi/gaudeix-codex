import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Filter,
  RefreshCw,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";

import { AnimatedCardGrid } from "@/components/animated/AnimatedCardGrid";
import { MotionReveal } from "@/components/animated/MotionReveal";
import {
  FilterBar,
  PageHero,
  SectionHeader,
} from "@/components/site/primitives";
import { listStories } from "@/features/storytelling/api";
import { StoryCard } from "@/features/storytelling/components/StoryCard";

const PERIODS = ["Iberian", "Roman", "Medieval", "Modern", "Legend", "Natural"];
const DIFFICULTIES = [
  { value: "easy", label: "Fácil" },
  { value: "medium", label: "Media" },
  { value: "hard", label: "Alta" },
];

export function StorytellingPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [period, setPeriod] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const {
    data: stories = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["stories", "public"],
    queryFn: () => listStories(),
    retry: false,
  });

  const filteredStories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return stories.filter((story) => {
      if (period !== "all" && story.historical_period !== period) return false;
      if (difficulty !== "all" && story.difficulty !== difficulty) return false;
      if (!normalizedQuery) return true;
      const haystack =
        `${story.title} ${story.summary} ${story.content} ${story.source_name || ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [stories, query, period, difficulty]);

  const activeFiltersCount =
    (period !== "all" ? 1 : 0) + (difficulty !== "all" ? 1 : 0);

  const clearFilters = () => {
    setPeriod("all");
    setDifficulty("all");
    setQuery("");
  };

  const featuredStory = stories[0];

  return (
    <main className="min-h-screen overflow-x-hidden bg-background-light page-shell-offset text-text-primary">
      <PageHero
        eyebrow="Relatos de Cabrera"
        title="Historias, memoria y patrimonio para leer el municipio con otra mirada"
        description="Una colección editorial de relatos sobre Cabrera de Mar: arqueología, leyendas, paisaje, fiestas y memoria oral."
        tone="immersive"
        breadcrumbs={[{ label: "Inicio", href: "/" }, { label: "Historias" }]}
        metrics={[
          { label: "Archivo", value: `${stories.length} historias publicadas` },
          {
            label: "Periodo activo",
            value: period === "all" ? "Todos" : period,
          },
          {
            label: "Dificultad",
            value:
              difficulty === "all"
                ? "Todas"
                : DIFFICULTIES.find((d) => d.value === difficulty)?.label ||
                  difficulty,
          },
        ]}
        aside={
          <div className="space-y-4">
            <BookOpen className="h-8 w-8 text-accent" />
            <p className="text-sm leading-6 text-white/80">
              Cada relato funciona como pieza narrativa: contexto histórico,
              lectura breve y transcripción de audioguía cuando está disponible.
            </p>
          </div>
        }
      />

      <div className="page-container space-y-10 py-10">
        <MotionReveal>
          <FilterBar>
            <div className="space-y-4">
              {/* Search */}
              <label className="relative block">
                <span className="sr-only">Buscar historias</span>
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="search"
                  placeholder="Buscar historias..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-border-soft bg-white pl-11 pr-4 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>

              {/* Chips filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-muted">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filtrar</span>
                </div>

                {/* Period chips */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPeriod("all")}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                      period === "all"
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-surface-muted text-text-secondary hover:bg-border-soft"
                    }`}
                  >
                    Todos
                  </button>
                  {PERIODS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriod(p === period ? "all" : p)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                        period === p
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "bg-surface-muted text-text-secondary hover:bg-border-soft"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Difficulty chips */}
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() =>
                        setDifficulty(d.value === difficulty ? "all" : d.value)
                      }
                      className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                        difficulty === d.value
                          ? "bg-secondary text-white shadow-md shadow-secondary/20"
                          : "bg-surface-muted text-text-secondary hover:bg-border-soft"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 rounded-full border border-border-soft bg-white px-3 py-1.5 text-xs font-bold text-text-secondary transition-all hover:bg-surface-muted"
                  >
                    <X className="h-3 w-3" />
                    Limpiar ({activeFiltersCount})
                  </button>
                )}
              </div>
            </div>
          </FilterBar>
        </MotionReveal>

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-3xl border border-border-soft bg-white/70"
              />
            ))}
          </div>
        ) : error ? (
          <div className="card-surface flex flex-col items-center justify-center gap-5 py-20 text-center">
            <TriangleAlert className="h-12 w-12 text-warning" />
            <div className="space-y-2">
              <p className="text-xl font-semibold text-text-primary">
                No hemos podido cargar las historias.
              </p>
              <p className="max-w-xl text-sm leading-relaxed text-text-muted">
                Comprueba la conexión con el backend y vuelve a intentarlo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </button>
          </div>
        ) : stories.length === 0 ? (
          <div className="card-surface flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="mb-4 h-12 w-12 text-text-muted" />
            <span className="text-xl font-semibold text-text-secondary">
              Todavía no hay historias publicadas.
            </span>
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="card-surface flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="mb-4 h-12 w-12 text-text-muted" />
            <span className="text-xl font-semibold text-text-muted">
              No hay historias para esta selección.
            </span>
          </div>
        ) : (
          <section className="space-y-8">
            {/* Featured story if no search/filters active */}
            {featuredStory &&
              !query &&
              period === "all" &&
              difficulty === "all" && (
                <MotionReveal>
                  <StoryCard story={featuredStory} featured />
                </MotionReveal>
              )}

            <MotionReveal>
              <SectionHeader
                eyebrow="Archivo narrativo"
                title={`${filteredStories.length} historia${filteredStories.length === 1 ? "" : "s"} disponibles`}
                description="Relatos pensados para preparar la visita, leer en calma o escuchar como audioguía."
              />
            </MotionReveal>
            <AnimatedCardGrid className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </AnimatedCardGrid>
          </section>
        )}
      </div>
    </main>
  );
}

export default StorytellingPage;
