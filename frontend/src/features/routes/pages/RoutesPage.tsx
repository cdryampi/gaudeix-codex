import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mountain, Filter } from "lucide-react";

import { getRoutes } from "../api";
import { Route, RouteDifficulty, RouteType } from "../types";
import { RouteCard } from "../components/RouteCard";
import { DIFFICULTY_CONFIG, ROUTE_TYPE_CONFIG } from "../constants";
import { useTranslation } from "@/hooks/useTranslation";
import {
  FilterBar,
  PageHero,
  SectionHeader,
} from "@/components/site/primitives";
import { MotionReveal } from "@/components/animated/MotionReveal";
import { AnimatedCardGrid } from "@/components/animated/AnimatedCardGrid";

type DifficultyFilter = RouteDifficulty | "all";
type RouteTypeFilter = RouteType | "all";

export const RoutesPage = () => {
  const { t } = useTranslation();
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("all");
  const [routeTypeFilter, setRouteTypeFilter] =
    useState<RouteTypeFilter>("all");

  // Fetch routes
  const { data: routesData, isLoading } = useQuery({
    queryKey: [
      "routes",
      { difficulty: difficultyFilter, route_type: routeTypeFilter },
    ],
    queryFn: () =>
      getRoutes({
        is_published: true,
        difficulty: difficultyFilter !== "all" ? difficultyFilter : undefined,
        route_type: routeTypeFilter !== "all" ? routeTypeFilter : undefined,
      }),
  });

  const routes = useMemo(() => {
    if (!routesData) return [];
    if (Array.isArray(routesData)) return routesData;
    return routesData.results || [];
  }, [routesData]);

  return (
    <main className="min-h-screen bg-background-light page-shell-offset">
      <PageHero
        eyebrow={t("Rutas y Senderismo")}
        title={t("Explora el territorio")}
        description={t(
          "Descubre rutas de senderismo, ciclismo y paseos guiados por los parajes naturales más impresionantes.",
        )}
        tone="immersive"
        breadcrumbs={[{ label: t("Inicio"), href: "/" }, { label: t("Rutas") }]}
        metrics={[
          { label: t("Resultados"), value: `${routes.length} ${t("rutas")}` },
          {
            label: t("Filtro"),
            value: `${routeTypeFilter === "all" ? t("Todas") : ROUTE_TYPE_CONFIG[routeTypeFilter]?.label} / ${difficultyFilter === "all" ? t("Todas") : DIFFICULTY_CONFIG[difficultyFilter]?.label}`,
          },
          { label: t("Ubicación"), value: t("Cabrera de Mar") },
        ]}
      />

      {/* Filters Section */}
      <div className="page-container py-10">
        <MotionReveal>
          <FilterBar>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Filter className="h-4 w-4 text-primary" />
                {t("Filtra por tipo de ruta y dificultad")}
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                {/* Route Type Filter */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setRouteTypeFilter("all")}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border transition-all duration-200 ${
                      routeTypeFilter === "all"
                        ? "bg-primary text-white border-transparent"
                        : "bg-surface text-text-secondary border-border-soft hover:bg-surface-muted hover:text-text-primary"
                    }`}
                  >
                    {t("Todas")}
                  </button>
                  {(Object.keys(ROUTE_TYPE_CONFIG) as RouteType[]).map(
                    (type) => {
                      const config = ROUTE_TYPE_CONFIG[type];
                      const Icon = config.icon;
                      return (
                        <button
                          key={type}
                          onClick={() => setRouteTypeFilter(type)}
                          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border transition-all duration-200 ${
                            routeTypeFilter === type
                              ? "bg-primary text-white border-transparent"
                              : "bg-surface text-text-secondary border-border-soft hover:bg-surface-muted hover:text-text-primary"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {config.label}
                        </button>
                      );
                    },
                  )}
                </div>

                <div className="hidden md:block w-px h-6 bg-slate-200" />

                {/* Difficulty Filter */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setDifficultyFilter("all")}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border transition-all duration-200 ${
                      difficultyFilter === "all"
                        ? "bg-primary text-white border-transparent"
                        : "bg-surface text-text-secondary border-border-soft hover:bg-surface-muted hover:text-text-primary"
                    }`}
                  >
                    {t("Todas")}
                  </button>
                  {(Object.keys(DIFFICULTY_CONFIG) as RouteDifficulty[]).map(
                    (diff) => {
                      const config = DIFFICULTY_CONFIG[diff];
                      return (
                        <button
                          key={diff}
                          onClick={() => setDifficultyFilter(diff)}
                          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border transition-all duration-200 ${
                            difficultyFilter === diff
                              ? `${config.bgColor} ${config.textColor} border-transparent`
                              : "bg-surface text-text-secondary border-border-soft hover:bg-surface-muted hover:text-text-primary"
                          }`}
                        >
                          {config.label}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          </FilterBar>
        </MotionReveal>
      </div>

      {/* Routes Grid */}
      <section className="page-container space-y-6 pb-20 defer-render">
        <MotionReveal>
          <SectionHeader
            eyebrow={t("Itinerarios")}
            title={t("Rutas activas y senderos")}
            description={t(
              "Selecciona y explora los caminos recomendados en el término municipal.",
            )}
          />
        </MotionReveal>

        {isLoading ? (
          // Loading Skeleton
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[480px] rounded-[2.5rem] bg-surface-muted animate-pulse border border-border-soft"
              />
            ))}
          </div>
        ) : routes.length === 0 ? (
          // Empty State
          <div className="card-surface flex flex-col items-center justify-center py-20 text-center border border-border-soft">
            <Mountain className="h-16 w-16 text-text-secondary/40 mb-6" />
            <p className="text-xl font-bold text-text-secondary uppercase tracking-widest text-center">
              {t("No hay rutas disponibles")}
            </p>
            <p className="text-text-secondary/70 mt-2">
              {t("Prueba a ajustar los filtros")}
            </p>
          </div>
        ) : (
          // Routes Grid
          <AnimatedCardGrid className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10">
            {routes.map((route: Route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </AnimatedCardGrid>
        )}
      </section>
    </main>
  );
};
