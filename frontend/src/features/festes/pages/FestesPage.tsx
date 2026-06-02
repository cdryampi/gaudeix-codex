/**
 * FestesPage - List page for festivals by year.
 */

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PartyPopper, Calendar, Filter } from "lucide-react";

import { getFestes } from "../api";
import { Festa } from "../types";
import { FestaCard } from "../components/FestaCard";
import { useTranslation } from "@/hooks/useTranslation";
import {
  FilterBar,
  PageHero,
  SectionHeader,
} from "@/components/site/primitives";
import { MotionReveal } from "@/components/animated/MotionReveal";
import { AnimatedCardGrid } from "@/components/animated/AnimatedCardGrid";

export const FestesPage = () => {
  const { t } = useTranslation();
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
    <main className="min-h-screen bg-background-light page-shell-offset">
      <PageHero
        eyebrow={t("Celebracions i Tradició")}
        title={t("Festes Majors")}
        description={t(
          "Descobreix les celebracions més emblemàtiques del nostre municipi, on la tradició, la cultura i la convivència s'uneixen.",
        )}
        tone="immersive"
        breadcrumbs={[
          { label: t("Inicio"), href: "/" },
          { label: t("Festes") },
        ]}
        metrics={[
          {
            label: t("Resultados"),
            value: `${festes.length} ${t("celebraciones")}`,
          },
          {
            label: t("Filtro"),
            value: selectedYear === "all" ? t("Todas") : `${selectedYear}`,
          },
          { label: t("Ubicación"), value: t("Cabrera de Mar") },
        ]}
      />

      <div className="page-container space-y-10 py-10">
        <MotionReveal>
          <FilterBar>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Filter className="h-4 w-4 text-primary" />
                {t("Filtra por año")}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  id="btn-festes-filter-all"
                  onClick={() => setSelectedYear("all")}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border border-border-soft transition-all duration-200 ${
                    selectedYear === "all"
                      ? "bg-primary text-white border-transparent"
                      : "bg-surface text-text-secondary border-border-soft hover:bg-surface-muted hover:text-text-primary"
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  {t("Todas")}
                </button>
                {availableYears.map((year) => (
                  <button
                    key={year}
                    id={`btn-festes-filter-${year}`}
                    onClick={() => setSelectedYear(year)}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border border-border-soft transition-all duration-200 ${
                      selectedYear === year
                        ? "bg-primary text-white border-transparent"
                        : "bg-surface text-text-secondary border-border-soft hover:bg-surface-muted hover:text-text-primary"
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </FilterBar>
        </MotionReveal>

        <section className="space-y-6 defer-render">
          <MotionReveal>
            <SectionHeader
              eyebrow={t("Celebracions i Tradició")}
              title={`${festes.length} ${t("celebraciones")}`}
              description={t(
                "Descobreix les celebracions més emblemàtiques del nostre municipi, on la tradició, la cultura i la convivència s'uneixen.",
              )}
            />
          </MotionReveal>

          {isLoading ? (
            // Loading Skeleton
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/5] rounded-[2.5rem] bg-surface border border-border-soft animate-pulse shadow-sm"
                />
              ))}
            </div>
          ) : festes.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-24 rounded-[3rem] border border-border-soft bg-surface-muted/30">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-muted text-text-muted">
                <PartyPopper className="h-10 w-10" />
              </div>
              <p className="text-xl font-bold text-text-primary text-center">
                {t("Sin resultados")}
              </p>
              <p className="mt-2 text-text-secondary">
                {t("No se han encontrado celebraciones para estos criterios.")}
              </p>
            </div>
          ) : (
            // Festes Grid
            <AnimatedCardGrid className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10">
              {festes.map((festa: Festa) => (
                <FestaCard key={festa.id} festa={festa} />
              ))}
            </AnimatedCardGrid>
          )}
        </section>
      </div>
    </main>
  );
};
