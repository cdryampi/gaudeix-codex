import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Star, ChevronRight, X } from "lucide-react";
import { useState, useEffect } from "react";
import { getFestes } from "@/features/festes/api";
import { Festa } from "@/features/festes/types";

export function FestaAnnouncementBar() {
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
      className={`relative w-full bg-accent text-slate-950 px-4 py-2 sm:px-8 flex items-center justify-center gap-3 overflow-hidden ${
        shouldAnimate ? "animate-in slide-in-from-top fade-in duration-500" : ""
      }`}
    >
      {/* Decorative Stars */}
      <Star className="hidden sm:block h-3 w-3 animate-pulse" />

      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center">
        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-950 text-accent px-2 py-0.5 rounded">
          {festa.is_current ? "Festa Actual" : "Recente / Destacada"}
        </span>
        <p className="text-[11px] sm:text-xs font-bold leading-tight">
          Ja pots consultar el programa de la{" "}
          <span className="font-black underline decoration-2 underline-offset-2">
            {festa.title}
          </span>
        </p>
      </div>

      <Link
        to={`/festes/${festa.slug}`}
        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest pl-2 hover:translate-x-1 transition-transform group outline-none focus-visible:ring-2 focus-visible:ring-slate-950 rounded-lg p-1"
        aria-label={`Veure programa de ${festa.title}`}
      >
        Veure Programa
        <ChevronRight className="h-4 w-4" />
      </Link>

      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 sm:right-4 p-1 hover:bg-slate-950/10 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
        aria-label="Tancar anunci"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
