/**
 * NewsCard component
 *
 * Displays a news article card with image, title, excerpt, date and category.
 * Consistent design with EventCard for the Home Page.
 */

import { useMemo } from "react";
import { ArrowRight, Clock, Tag } from "lucide-react";

import type { NewsItem } from "@/data/mockNews";
import { AnimatedCard } from "@/components/animated/AnimatedCard";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { formatDateTime } from "@/features/agenda/dateUtils";

function clampLinesStyle(lines: number) {
  return {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  };
}

export function NewsCard({ news }: { news: NewsItem }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const dateLabel = useMemo(() => formatDateTime(news.publishedAt), [news.publishedAt]);
  
  // Simulated read time based on excerpt length
  const readTime = useMemo(() => {
    const words = news.excerpt.split(" ").length;
    const minutes = Math.max(1, Math.ceil(words / 20)); // ~20 words per "segment"
    return `${minutes} min de lectura`;
  }, [news.excerpt]);

  const onNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Navigate to", `/noticias/${news.slug}`);
  };

  return (
    <AnimatedCard
      as="a"
      href={`/noticias/${news.slug}`}
      onClick={onNavigate}
      className={[
        "group flex flex-col h-full overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200 transition-all",
        "hover:shadow-xl hover:ring-puerto-rico-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-puerto-rico-300 focus-visible:ring-offset-2",
      ].join(" ")}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <img
          src={news.imageUrl}
          alt={news.title}
          loading="lazy"
          decoding="async"
          className={[
            "h-full w-full object-cover transition-transform duration-700",
            prefersReducedMotion ? "" : "group-hover:scale-110",
          ].join(" ")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        
        {news.featured && (
          <div className="absolute left-4 top-4">
            <span className="inline-flex items-center rounded-full bg-puerto-rico-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
              Destacado
            </span>
          </div>
        )}
        
        <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white">
            <Clock className="h-3.5 w-3.5" />
            {readTime}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-puerto-rico-50 px-2.5 py-1 text-xs font-semibold text-puerto-rico-700 ring-1 ring-inset ring-puerto-rico-600/10">
            <Tag className="h-3 w-3" aria-hidden="true" />
            {news.category}
          </span>
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">
            {dateLabel}
          </span>
        </div>

        <h3 className="mb-3 text-xl font-bold leading-tight text-gray-900 transition-colors group-hover:text-puerto-rico-600" style={clampLinesStyle(2)}>
          {news.title}
        </h3>

        {news.excerpt ? (
          <p className="mb-6 text-sm leading-relaxed text-gray-600" style={clampLinesStyle(3)}>
            {news.excerpt}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-100 ring-2 ring-white">
              <img src="https://ui-avatars.com/api/?name=Ajuntament&background=3E9124&color=fff" alt="Autor" />
            </div>
            <span className="text-xs font-semibold text-gray-700">Ajuntament</span>
          </div>
          
          <span
            className={[
              "inline-flex items-center gap-1.5 text-sm font-bold text-puerto-rico-600 transition-all",
              prefersReducedMotion ? "" : "group-hover:gap-2.5",
            ].join(" ")}
          >
            Leer más
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </AnimatedCard>
  );
}
