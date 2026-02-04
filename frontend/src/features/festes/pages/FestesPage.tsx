/**
 * FestesPage - List page for festivals by year.
 */

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, PartyPopper, Calendar } from "lucide-react";

import { getFestes, getCurrentFesta } from "../api";
import { Festa } from "../types";
import { FestaCard } from "../components/FestaCard";

export const FestesPage = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");

  // Fetch all festes
  const { data: festesData, isLoading } = useQuery({
    queryKey: ["festes", { is_published: true }],
    queryFn: () => getFestes({ is_published: true }),
  });

  // Fetch current festa
  const { data: currentFesta } = useQuery({
    queryKey: ["festes", "current"],
    queryFn: getCurrentFesta,
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
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary to-primary/80 text-white">
        <div className="min-h-[60vh] flex flex-col justify-center px-6 md:px-20 py-24">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white mb-12 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <span className="text-sm font-black uppercase tracking-[0.5em] text-white/80 mb-8">
            Celebraciones
          </span>
          <h1 className="text-[clamp(3rem,12vw,14rem)] font-black leading-[0.75] tracking-tighter uppercase">
            FESTES <br />
            <span className="italic text-accent">MAJORS</span>
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-white/70 mt-12 max-w-3xl tracking-tight">
            Las celebraciones más importantes de nuestro pueblo, donde la
            tradición y la alegría se unen.
          </p>

          {/* Current Festa Highlight */}
          {currentFesta && (
            <div className="mt-16 p-6 rounded-3xl bg-white/10 backdrop-blur-lg border border-white/20 max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <PartyPopper className="h-6 w-6 text-accent" />
                <span className="text-sm font-black uppercase tracking-widest text-accent">
                  Festa Actual
                </span>
              </div>
              <h2 className="text-2xl font-black mb-2">{currentFesta.title}</h2>
              {currentFesta.subtitle && (
                <p className="text-white/70 text-sm">{currentFesta.subtitle}</p>
              )}
              <Link
                to={`/festes/${currentFesta.slug}`}
                className="inline-flex items-center gap-2 mt-4 h-12 px-6 rounded-xl bg-accent text-slate-900 text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
              >
                Ver programa
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Filters Section */}
      <section className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Año
              </span>
            </div>

            {/* Year Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedYear("all")}
                className={`h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedYear === "all"
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Todas
              </button>
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedYear === year
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Festes Grid */}
      <section className="container mx-auto px-6 py-20">
        {isLoading ? (
          // Loading Skeleton
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-[2.5rem] bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : festes.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-32 border-4 border-dashed border-slate-100 rounded-[4rem]">
            <PartyPopper className="h-16 w-16 text-slate-200 mb-6" />
            <p className="text-2xl font-bold text-slate-300 uppercase tracking-widest text-center">
              No hay festes disponibles
            </p>
            <p className="text-slate-400 mt-2">
              {selectedYear !== "all"
                ? `No hay celebraciones registradas para ${selectedYear}`
                : "Próximamente más celebraciones"}
            </p>
          </div>
        ) : (
          // Festes Grid
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            {festes.map((festa: Festa) => (
              <FestaCard key={festa.id} festa={festa} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
