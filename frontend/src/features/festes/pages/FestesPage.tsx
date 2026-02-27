/**
 * FestesPage - List page for festivals by year.
 */

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, PartyPopper, Calendar } from "lucide-react";

import { getFestes } from "../api";
import { Festa } from "../types";
import { FestaCard } from "../components/FestaCard";

export const FestesPage = () => {
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");

  // Fetch all festes
  const { data: festesData, isLoading } = useQuery({
    queryKey: ["festes", { is_published: true }],
    queryFn: () => getFestes({ is_published: true }),
  });

  const festes = useMemo(() => {
    if (!festesData) return [];
    const list = Array.isArray(festesData)
      ? festesData
      : festesData.results || [];

    // Filter by year if selected
    if (selectedYear !== "all") {
      return list.filter((f) => f.year === selectedYear);
    }
    return list;
  }, [festesData, selectedYear]);

  // Get unique years for filter
  const availableYears = useMemo(() => {
    if (!festesData) return [];
    const list = Array.isArray(festesData)
      ? festesData
      : festesData.results || [];
    const years = [...new Set(list.map((f) => f.year))].sort((a, b) => b - a);
    return years;
  }, [festesData]);

  return (
    <main className="min-h-screen bg-slate-50/50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pb-16 pt-32 md:pb-32 md:pt-48">
        {/* Subtle decorative elements */}
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-[500px] w-[500px] rounded-full bg-slate-50" />
        <div className="absolute left-0 top-1/2 -ml-12 h-64 w-64 -translate-y-1/2 rounded-full bg-slate-50/50 blur-3xl" />

        <div className="container relative z-10 mx-auto px-6">
          <Link
            to="/"
            className="group mb-16 inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-primary"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 transition-colors group-hover:border-primary/20 group-hover:bg-primary/5">
              <ArrowLeft className="h-3.5 w-3.5" />
            </div>
            Inici
          </Link>

          <div className="max-w-5xl">
            <span className="mb-6 block text-[11px] font-black uppercase tracking-[0.5em] text-primary/60">
              Celebracions i Tradició
            </span>
            <h1 className="text-[clamp(3.5rem,12vw,10rem)] font-black leading-[0.85] tracking-tighter text-slate-950 uppercase">
              FESTES <br />
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                MAJORS
              </span>
            </h1>

            <div className="mt-12 flex flex-col md:flex-row md:items-end justify-between gap-12">
              <p className="max-w-xl text-xl font-medium leading-relaxed text-slate-500 md:text-2xl">
                Descobreix les celebracions més emblemàtiques del nostre
                municipi, on la tradició, la cultura i la convivència s'uneixen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="sticky top-0 z-40 border-y border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                <Calendar className="h-4 w-4" />
              </div>

              {/* Year Filter */}
              <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100/50 p-1.5">
                <button
                  onClick={() => setSelectedYear("all")}
                  className={`h-9 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedYear === "all"
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Totes
                </button>
                {availableYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`h-9 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedYear === year
                        ? "bg-white text-primary shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {festes.length} celebracions trobades
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Festes Grid */}
      <section className="container mx-auto px-6 py-24">
        {isLoading ? (
          // Loading Skeleton
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[4/5] rounded-[3rem] bg-white border border-slate-100 animate-pulse shadow-sm"
              />
            ))}
          </div>
        ) : festes.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-40 rounded-[4rem] border border-slate-200 bg-white/50">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-300">
              <PartyPopper className="h-10 w-10" />
            </div>
            <p className="text-2xl font-black uppercase tracking-tighter text-slate-400 text-center">
              Sense resultats
            </p>
            <p className="mt-2 font-medium text-slate-400">
              No s'han trobat celebracions per a aquests criteris.
            </p>
          </div>
        ) : (
          // Festes Grid
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {festes.map((festa: Festa) => (
              <FestaCard key={festa.id} festa={festa} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
