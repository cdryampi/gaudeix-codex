import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Tag } from "lucide-react";
import type { NewsItem } from "../types";
import { formatDateTime } from "@/features/agenda/dateUtils";

export function NewsCard({ news }: { news: NewsItem }) {
  const dateLabel = useMemo(
    () => formatDateTime(news.publishedAt),
    [news.publishedAt],
  );

  return (
    <Link
      to={`/noticias/${news.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(15,23,42,0.12)]"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-200">
        <img
          src={news.imageUrl}
          alt={news.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/5" />
      </div>

      <div className="flex flex-1 flex-col p-7 md:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
            <Tag className="h-4 w-4" />
            {news.category}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">
            {dateLabel}
          </span>
        </div>

        <h3 className="mb-4 text-2xl font-semibold leading-snug tracking-tight">
          {news.title}
        </h3>

        {news.excerpt && (
          <p className="mb-6 line-clamp-3 text-base text-slate-600 leading-relaxed">
            {news.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-6">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 group-hover:text-primary transition-colors">
            Leer más
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-primary group-hover:text-white transition-colors">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
