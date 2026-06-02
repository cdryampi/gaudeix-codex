import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Star, ChevronRight, X } from "lucide-react";
import { useState, useEffect } from "react";
import { getFestes } from "@/features/festes/api";
import { Festa } from "@/features/festes/types";
import { useTranslation } from "@/hooks/useTranslation";

export function FestaAnnouncementBar() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  const { data: festes } = useQuery({
    queryKey: ["festes", "announcement"],
    queryFn: async () => {
      // First try current
      const current = await getFestes({ is_current: true, is_published: true });
      const currentList = Array.isArray(current) ? current : current.results;
      if (currentList.length > 0) return currentList[0];

      // Then try featured
      const featured = await getFestes({
        is_featured: true,
        is_published: true,
      });
      const featuredList = Array.isArray(featured)
        ? featured
        : featured.results;
      if (featuredList.length > 0) return featuredList[0];

      return null;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Handle prefers-reduced-motion
  const [shouldAnimate, setShouldAnimate] = useState(true);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldAnimate(!mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setShouldAnimate(!e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  if (!festes || !isVisible) return null;

  const festa = festes as Festa;

  return (
    <div
      role="banner"
      className={`relative w-full bg-text-primary text-white px-4 py-2 sm:px-8 flex items-center justify-center gap-3 overflow-hidden border-b border-white/5 ${
        shouldAnimate ? "animate-in slide-in-from-top fade-in duration-500" : ""
      }`}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 pointer-events-none" />

      {/* Decorative Star */}
      <Star className="hidden sm:block h-3.5 w-3.5 text-accent fill-accent/20 animate-pulse shrink-0 relative z-10" />

      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center relative z-10">
        <span className="text-[9px] font-black uppercase tracking-[0.15em] bg-accent text-slate-950 px-2.5 py-0.5 rounded-full shadow-sm shrink-0">
          {festa.is_current ? t("Festa Actual") : t("Recente / Destacada")}
        </span>
        <p className="text-[11px] sm:text-xs font-semibold leading-tight text-white/90">
          {t("announcement_prefix")}{" "}
          <span className="font-extrabold text-white underline decoration-accent decoration-2 underline-offset-2">
            {festa.title}
          </span>
        </p>
      </div>

      <Link
        to={`/festes/${festa.slug}`}
        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest pl-2 text-accent hover:text-white transition-colors group outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg p-1 relative z-10"
        aria-label={`${t("Veure programa de ")}${festa.title}`}
      >
        {t("Veure Programa")}
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>

      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 sm:right-4 p-1 hover:bg-white/10 text-white/60 hover:text-white rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white z-10"
        aria-label={t("Tancar anunci")}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
