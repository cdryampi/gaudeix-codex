/**
 * RoutesPage - List page for hiking/cycling routes with filters.
 */

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, Mountain, Filter } from "lucide-react";

import { getRoutes } from "../api";
import { Route, RouteDifficulty, RouteType } from "../types";
import { RouteCard } from "../components/RouteCard";
import { DIFFICULTY_CONFIG, ROUTE_TYPE_CONFIG } from "../constants";

type DifficultyFilter = RouteDifficulty | "all";
type RouteTypeFilter = RouteType | "all";

export const RoutesPage = () => {
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
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-slate-950 text-white">
        <div className="min-h-[60vh] flex flex-col justify-center px-6 md:px-20 py-24">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white mb-12 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <span className="text-sm font-black uppercase tracking-[0.5em] text-accent mb-8">
            Rutas y Senderismo
          </span>
          <h1 className="text-[clamp(3rem,12vw,14rem)] font-black leading-[0.75] tracking-tighter uppercase">
            EXPLORA <br />
            <span className="italic text-accent">el Territorio</span>
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-slate-400 mt-12 max-w-3xl tracking-tight">
            Descubre rutas de senderismo, ciclismo y paseos guiados por los
            parajes naturales más impresionantes.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Filter className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Filtros
              </span>
            </div>

            {/* Route Type Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setRouteTypeFilter("all")}
                className={`h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  routeTypeFilter === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Todas
              </button>
              {(Object.keys(ROUTE_TYPE_CONFIG) as RouteType[]).map((type) => {
                const config = ROUTE_TYPE_CONFIG[type];
                const Icon = config.icon;
                return (
                  <button
                    key={type}
                    onClick={() => setRouteTypeFilter(type)}
                    className={`h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                      routeTypeFilter === type
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {config.label}
                  </button>
                );
              })}
            </div>

            <div className="hidden md:block w-px h-8 bg-slate-200" />

            {/* Difficulty Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setDifficultyFilter("all")}
                className={`h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  difficultyFilter === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Todas
              </button>
              {(Object.keys(DIFFICULTY_CONFIG) as RouteDifficulty[]).map(
                (diff) => {
                  const config = DIFFICULTY_CONFIG[diff];
                  return (
                    <button
                      key={diff}
                      onClick={() => setDifficultyFilter(diff)}
                      className={`h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        difficultyFilter === diff
                          ? `${config.bgColor} ${config.textColor}`
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
      </section>

      {/* Routes Grid */}
      <section className="container mx-auto px-6 py-20">
        {isLoading ? (
          // Loading Skeleton
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[500px] rounded-[2.5rem] bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : routes.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-32 border-4 border-dashed border-slate-100 rounded-[4rem]">
            <Mountain className="h-16 w-16 text-slate-200 mb-6" />
            <p className="text-2xl font-bold text-slate-300 uppercase tracking-widest text-center">
              No hay rutas disponibles
            </p>
            <p className="text-slate-400 mt-2">Prueba a ajustar los filtros</p>
          </div>
        ) : (
          // Routes Grid
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            {routes.map((route: Route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
