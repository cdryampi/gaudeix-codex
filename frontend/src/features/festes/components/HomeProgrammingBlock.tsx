/**
 * HomeProgrammingBlock - Highlights current Festa programming on the home page.
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight, Download, Sparkles } from "lucide-react";

import { getActivities, getCurrentFesta, getPrograms } from "../api";
import { Program } from "../types";
import { API_BASE_URL } from "@/lib/api";

const formatDate = (value: string | null) => {
  if (!value) return "Data pendent";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data pendent";
  return date.toLocaleDateString("ca-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export function HomeProgrammingBlock() {
  const { data: currentFesta, isLoading: isLoadingFesta } = useQuery({
    queryKey: ["festes", "current"],
    queryFn: () => getCurrentFesta(),
  });

  const { data: programsData, isLoading: isLoadingPrograms } = useQuery({
    queryKey: ["programs", { festa: currentFesta?.slug, is_published: true }],
    queryFn: () =>
      getPrograms({
        festa: currentFesta?.slug,
        is_published: true,
        ordering: "start_date",
      }),
    enabled: !!currentFesta?.slug,
  });

  const { data: activitiesData, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["activities", { festa: currentFesta?.slug, is_published: true }],
    queryFn: () =>
      getActivities({
        festa: currentFesta?.slug,
        is_published: true,
        ordering: "start_at",
      }),
    enabled: !!currentFesta?.slug,
  });

  const currentProgram = useMemo<Program | null>(() => {
    if (!programsData?.results?.length) return null;
    return programsData.results[0] ?? null;
  }, [programsData]);

  const featuredActivitySlug = useMemo(() => {
    if (!activitiesData?.results?.length) return null;
    return activitiesData.results[0]?.slug || null;
  }, [activitiesData]);

  const iCalUrl = featuredActivitySlug
    ? `${API_BASE_URL}/activities/${featuredActivitySlug}/ical/`
    : null;

  const isLoading =
    isLoadingFesta ||
    (!!currentFesta?.slug && (isLoadingPrograms || isLoadingActivities));

  if (isLoading) {
    return (
      <section id="programacion-festes" className="bg-slate-900 px-6 py-24 md:px-20">
        <div className="mx-auto max-w-6xl animate-pulse rounded-[2.5rem] border border-white/10 bg-white/5 p-10">
          <div className="h-5 w-48 rounded-full bg-white/10" />
          <div className="mt-6 h-16 w-3/4 rounded-2xl bg-white/10" />
          <div className="mt-6 h-6 w-full rounded-xl bg-white/10" />
          <div className="mt-10 flex gap-3">
            <div className="h-12 w-44 rounded-xl bg-white/10" />
            <div className="h-12 w-44 rounded-xl bg-white/10" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="programacion-festes" className="bg-slate-900 px-6 py-24 md:px-20">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-10 text-white md:p-14">
        <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-accent">
          <Sparkles className="h-3.5 w-3.5" />
          Programacio destacada
        </div>

        {currentFesta && currentProgram ? (
          <>
            <h2 className="text-[clamp(2rem,6vw,4.5rem)] font-black uppercase leading-[0.9] tracking-tighter">
              {currentProgram.title || currentFesta.title}
            </h2>
            <p className="mt-6 max-w-4xl text-lg font-semibold text-slate-300 md:text-2xl">
              {currentProgram.subtitle ||
                currentProgram.description ||
                currentFesta.summary ||
                "Ja pots consultar les activitats confirmades de la festa actual."}
            </p>

            <div className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-200">
              <CalendarDays className="h-4 w-4 text-accent" />
              {formatDate(currentProgram.start_date)} - {formatDate(currentProgram.end_date)}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/festes/programacio"
                data-testid="home-programming-cta"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 transition-transform hover:scale-[1.02]"
              >
                Ver programacion completa
                <ChevronRight className="h-4 w-4" />
              </Link>

              {iCalUrl ? (
                <a
                  href={iCalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/10"
                >
                  <Download className="h-4 w-4" />
                  Descargar iCal
                </a>
              ) : null}
            </div>
          </>
        ) : (
          <div data-testid="home-programming-empty" className="max-w-4xl">
            <h2 className="text-[clamp(2rem,6vw,4.2rem)] font-black uppercase leading-[0.9] tracking-tighter text-white/90">
              La nueva programacion llega pronto
            </h2>
            <p className="mt-6 text-lg font-semibold text-slate-300 md:text-2xl">
              Estamos preparando nuevas actividades para la proxima edicion. Mientras
              tanto, puedes explorar toda la agenda cultural del municipio.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/festes/programacio"
                data-testid="home-programming-cta"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 transition-transform hover:scale-[1.02]"
              >
                Ver programacion
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
