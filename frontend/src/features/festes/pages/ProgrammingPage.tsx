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

import { getEvents } from "@/features/events/api";
import { EventCard } from "@/features/agenda/components/EventCard";
import { ProgrammingCalendar } from "../components/ProgrammingCalendar";
import { ProgrammingMap } from "../components/ProgrammingMap";
import {
  ProgrammingFilters,
  ProgrammingFiltersState,
} from "../components/ProgrammingFilters";

type ProgrammingView = "list" | "calendar" | "map";

const publicAsset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

const posterOne = publicAsset("festa_cryptic_poster_1.png");
const posterTwo = publicAsset("festa_cryptic_poster_2.png");

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

  const apiFilters = useMemo<Record<string, unknown>>(() => {
    return {
      is_published: true,
      ordering: "start_at",
      page: filters.page,
      start_from: filters.dateFrom ? `${filters.dateFrom}T00:00:00` : undefined,
      start_to: filters.dateTo ? `${filters.dateTo}T23:59:59` : undefined,
      category: filters.category || undefined,
      is_free: filters.isFree === "all" ? undefined : filters.isFree,
      search: filters.query || undefined,
    };
  }, [filters]);

  const {
    data: eventsData,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["events", apiFilters],
    queryFn: () => getEvents(apiFilters),
  });

  const paginated = useMemo(() => {
    if (!eventsData) {
      return { count: 0, next: null, previous: null, results: [] };
    }

    if (Array.isArray(eventsData)) {
      return {
        count: eventsData.length,
        next: null,
        previous: null,
        results: eventsData,
      };
    }

    return eventsData;
  }, [eventsData]);

  const events = useMemo(() => {
    const items = paginated.results || [];
    const location = filters.location.trim().toLowerCase();
    if (!location) return items;

    return items.filter((event) => {
      const venue = (event.venue_name || "").toLowerCase();
      const locationText = (event.location_text || "").toLowerCase();
      return venue.includes(location) || locationText.includes(location);
    });
  }, [filters.location, paginated.results]);

  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-accent selection:text-slate-950">
      <section className="relative overflow-hidden px-6 py-24 md:px-20 md:py-32">
        <div className="pointer-events-none absolute -right-48 -top-48 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <Link
            to="/festes"
            className="group mb-12 inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-accent"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 transition-colors group-hover:border-accent/20 group-hover:bg-accent/5">
              <ArrowLeft className="h-3.5 w-3.5" />
            </div>
            Tornar a Festes
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-accent/80">
                  La Nostra Agenda
                </span>
                <div className="flex gap-2">
                  <div className="w-12 h-16 rounded-lg bg-white/5 border border-white/10 overflow-hidden shadow-2xl transition-transform hover:scale-110">
                    <img
                      src={posterOne}
                      alt="Poster 1"
                      className="w-full h-full object-cover grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                    />
                  </div>
                  <div className="w-12 h-16 rounded-lg bg-white/5 border border-white/10 overflow-hidden shadow-2xl transition-transform hover:scale-110">
                    <img
                      src={posterTwo}
                      alt="Poster 2"
                      className="w-full h-full object-cover grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                    />
                  </div>
                </div>
              </div>
              <h1 className="text-[clamp(3rem,10vw,8rem)] font-black uppercase tracking-tighter leading-[0.85]">
                PROGRAMA <br />
                <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-accent to-white/90">
                  DE FESTES
                </span>
              </h1>
            </div>
            <div className="lg:pb-4">
              <p className="max-w-xl text-xl font-medium leading-relaxed text-slate-400">
                Explora tots els esdeveniments previstos. Filtra per data,
                categoria o ubicacio per trobar el teu pla ideal.
              </p>
            </div>
          </div>

          <div className="mt-20">
            <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 md:p-10 backdrop-blur-sm shadow-2xl shadow-black/40">
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
        </div>
      </section>

      <section className="container mx-auto px-6 pb-32">
        {(isLoading || isFetching) && !eventsData ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-96 animate-pulse rounded-[2.5rem] border border-white/5 bg-white/[0.02]"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[3.5rem] border border-red-500/20 bg-red-500/5 p-20 text-center backdrop-blur-sm">
            <p className="text-4xl font-black uppercase tracking-tighter text-red-400">
              Error de carrega
            </p>
            <p className="mt-4 text-slate-400 max-w-md mx-auto">
              No hem pogut recuperar els esdeveniments en aquest moment. Si us
              plau, torna-ho a provar mes tard.
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center gap-10 rounded-[4rem] border border-white/5 bg-white/[0.02] p-24 text-center backdrop-blur-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-white/20">
              <Calendar className="h-8 w-8" />
            </div>
            <div>
              <p className="text-3xl font-black uppercase tracking-tighter text-white/40">
                Sense esdeveniments
              </p>
              <p className="mt-2 text-slate-500 max-w-sm mx-auto">
                No hi ha esdeveniments per a la seleccio actual. Prova de
                canviar els filtres.
              </p>
            </div>
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
              className="h-12 rounded-xl bg-accent px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-accent/10"
            >
              Netejar filtres
            </button>
          </div>
        ) : (
          <>
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-white/5 pb-8">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
                <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
                  {filters.location
                    ? events.length
                    : paginated.count || events.length}{" "}
                  esdeveniments{" "}
                  <span className="text-white/20 ml-2">Trobats</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="inline-flex rounded-2xl border border-white/10 bg-white/[0.02] p-1.5 backdrop-blur-md">
                  <button
                    onClick={() => setView("list")}
                    className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                      view === "list"
                        ? "bg-white text-slate-900 shadow-xl"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                    Llista
                  </button>
                  <button
                    onClick={() => setView("calendar")}
                    className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                      view === "calendar"
                        ? "bg-white text-slate-900 shadow-xl"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    Calendari
                  </button>
                  <button
                    onClick={() => setView("map")}
                    className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                      view === "map"
                        ? "bg-white text-slate-900 shadow-xl"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    <Map className="h-3.5 w-3.5" />
                    Mapa
                  </button>
                </div>

                {isFetching && (
                  <div className="flex items-center gap-2 px-3">
                    <div className="h-1 w-1 rounded-full bg-white/40 animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-1 w-1 rounded-full bg-white/40 animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-1 w-1 rounded-full bg-white/40 animate-bounce" />
                  </div>
                )}
              </div>
            </div>

            <div className="relative min-h-[400px]">
              <div className="pointer-events-none absolute left-0 top-0 -translate-x-1/2 opacity-5 mix-blend-screen overflow-hidden">
                <img
                  src={posterOne}
                  alt=""
                  className="w-[60vw] max-w-4xl rotate-12"
                />
              </div>
              <div className="pointer-events-none absolute right-0 bottom-0 translate-x-1/4 opacity-5 mix-blend-screen overflow-hidden">
                <img
                  src={posterTwo}
                  alt=""
                  className="w-[50vw] max-w-3xl -rotate-12"
                />
              </div>

              {view === "list" && (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}

              {view === "calendar" && <ProgrammingCalendar events={events} />}

              {view === "map" && <ProgrammingMap events={events} />}
            </div>

            {(paginated.previous || paginated.next) && (
              <div className="mt-20 flex flex-wrap items-center justify-center gap-6">
                <button
                  disabled={!paginated.previous}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      page: Math.max(1, filters.page - 1),
                      view,
                    })
                  }
                  className="group inline-flex h-14 items-center gap-3 rounded-2xl border border-white/10 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-white/5 hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-20"
                >
                  <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Anterior
                </button>

                <div className="flex items-center justify-center min-w-[120px]">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    Pagina{" "}
                    <span className="text-white text-sm ml-1">
                      {filters.page}
                    </span>
                  </span>
                </div>

                <button
                  disabled={!paginated.next}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      page: filters.page + 1,
                      view,
                    })
                  }
                  className="group inline-flex h-14 items-center gap-3 rounded-2xl border border-white/10 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-white/5 hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-20"
                >
                  Seguent
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
};
