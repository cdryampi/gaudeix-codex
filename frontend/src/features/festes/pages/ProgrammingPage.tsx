/**
 * ProgrammingPage - Public Festa programming list with filters and search.
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  List,
  Map,
} from "lucide-react";

import { getActivities } from "../api";
import { ActivityFilters } from "../types";
import { ActivityCard } from "../components/ActivityCard";
import { ProgrammingCalendar } from "../components/ProgrammingCalendar";
import { ProgrammingMap } from "../components/ProgrammingMap";
import {
  ProgrammingFilters,
  ProgrammingFiltersState,
} from "../components/ProgrammingFilters";

type ProgrammingView = "list" | "calendar" | "map";

const parseView = (value: string | null): ProgrammingView => {
  if (value === "calendar" || value === "map") {
    return value;
  }
  return "list";
};

const parsePage = (value: string | null) => {
  const parsed = Number(value || "1");
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
};

export const ProgrammingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<ProgrammingFiltersState & { page: number }>(() => {
    return {
      dateFrom: searchParams.get("date_from") || "",
      dateTo: searchParams.get("date_to") || "",
      category: searchParams.get("category") || "",
      location: searchParams.get("location") || "",
      isFree:
        (searchParams.get("is_free") as ProgrammingFiltersState["isFree"]) ||
        "all",
      query: searchParams.get("search") || searchParams.get("q") || "",
      page: parsePage(searchParams.get("page")),
    };
  }, [searchParams]);

  const view = useMemo<ProgrammingView>(() => {
    return parseView(searchParams.get("view"));
  }, [searchParams]);

  const setFilters = (
    next: ProgrammingFiltersState & { page?: number; view?: ProgrammingView },
  ) => {
    const params = new URLSearchParams();

    if (next.dateFrom) params.set("date_from", next.dateFrom);
    if (next.dateTo) params.set("date_to", next.dateTo);
    if (next.category.trim()) params.set("category", next.category.trim());
    if (next.location.trim()) params.set("location", next.location.trim());
    if (next.isFree !== "all") params.set("is_free", next.isFree);
    if (next.query.trim()) params.set("search", next.query.trim());
    if (next.page && next.page > 1) params.set("page", String(next.page));
    if (next.view && next.view !== "list") params.set("view", next.view);

    setSearchParams(params);
  };

  const setView = (nextView: ProgrammingView) => {
    setFilters({ ...filters, view: nextView, page: 1 });
  };

  const apiFilters = useMemo<ActivityFilters & Record<string, unknown>>(() => {
    return {
      is_published: true,
      ordering: "start_at",
      page: filters.page,
      date_from: filters.dateFrom || undefined,
      date_to: filters.dateTo || undefined,
      category: filters.category || undefined,
      location: filters.location || undefined,
      is_free: filters.isFree === "all" ? undefined : filters.isFree,
      search: filters.query || undefined,
    };
  }, [filters]);

  const {
    data: activitiesData,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["activities", apiFilters],
    queryFn: () => getActivities(apiFilters),
  });

  const activities = activitiesData?.results || [];

  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-accent selection:text-slate-950">
      <section className="relative overflow-hidden px-6 py-20 md:px-20 md:py-24">
        <div className="pointer-events-none absolute -right-48 -top-48 h-[520px] w-[520px] rounded-full bg-primary/25 blur-[120px]" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-[360px] w-[360px] rounded-full bg-accent/10 blur-[100px]" />

        <div className="relative z-10">
          <Link
            to="/festes"
            className="mb-10 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Festes
          </Link>

          <span className="mb-6 block text-sm font-black uppercase tracking-[0.45em] text-accent">
            Programació
          </span>
          <h1 className="text-[clamp(2.5rem,10vw,8rem)] font-black uppercase tracking-tighter leading-[0.85]">
            Agenda de <span className="italic text-accent">Festes</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg font-semibold text-slate-300 md:text-2xl">
            Consulta totes les activitats previstes, filtra per dates i troba
            plans segons categoria, ubicació o si són gratuits.
          </p>

          <div className="mt-12">
            <ProgrammingFilters
              value={filters}
              onChange={(next) => setFilters({ ...next, page: 1, view })}
              onReset={() =>
                setFilters({
                  dateFrom: "",
                  dateTo: "",
                  category: "",
                  location: "",
                  isFree: "all",
                  query: "",
                  page: 1,
                  view,
                })
              }
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-24">
        {(isLoading || isFetching) && !activitiesData ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-3xl border border-white/10 bg-white/5"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[3rem] border-4 border-dashed border-red-500/20 bg-red-500/5 p-12 text-center">
            <p className="text-3xl font-black uppercase tracking-tighter text-red-400">
              Error cargando la programación
            </p>
            <p className="mt-2 text-slate-300">
              No hemos podido recuperar las actividades en este momento.
            </p>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center gap-8 rounded-[3rem] border-4 border-dashed border-white/10 p-16 text-center">
            <Calendar className="h-14 w-14 text-white/30" />
            <p className="text-3xl font-black uppercase tracking-tighter text-white/40">
              No hay actividades para esta selección
            </p>
            <button
              onClick={() =>
                setFilters({
                  dateFrom: "",
                  dateTo: "",
                  category: "",
                  location: "",
                  isFree: "all",
                  query: "",
                  page: 1,
                  view,
                })
              }
              className="h-12 rounded-xl bg-accent px-6 text-[10px] font-black uppercase tracking-widest text-slate-900 transition-transform hover:scale-105"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm font-bold text-slate-300">
                {activitiesData?.count ?? activities.length} actividades encontradas
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-xl border border-white/20 bg-white/[0.03] p-1">
                  <button
                    onClick={() => setView("list")}
                    className={`inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                      view === "list"
                        ? "bg-white text-slate-900"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                    Llista
                  </button>
                  <button
                    onClick={() => setView("calendar")}
                    className={`inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                      view === "calendar"
                        ? "bg-white text-slate-900"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    Calendari
                  </button>
                  <button
                    onClick={() => setView("map")}
                    className={`inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                      view === "map"
                        ? "bg-white text-slate-900"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    <Map className="h-3.5 w-3.5" />
                    Mapa
                  </button>
                </div>

                {isFetching && (
                  <span className="text-xs font-bold uppercase tracking-widest text-white/50">
                    Actualizando...
                  </span>
                )}
              </div>
            </div>

            {view === "list" && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            )}

            {view === "calendar" && <ProgrammingCalendar activities={activities} />}

            {view === "map" && <ProgrammingMap activities={activities} />}

            {(activitiesData?.previous || activitiesData?.next) && (
              <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                <button
                  disabled={!activitiesData.previous}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      page: Math.max(1, filters.page - 1),
                      view,
                    })
                  }
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 px-5 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>

                <span className="text-xs font-black uppercase tracking-widest text-white/70">
                  Página {filters.page}
                </span>

                <button
                  disabled={!activitiesData.next}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      page: filters.page + 1,
                      view,
                    })
                  }
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 px-5 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
};
