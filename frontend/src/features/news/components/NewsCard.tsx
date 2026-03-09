import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Tag, Clock } from "lucide-react";

import type { NewsItem } from "../types";

function formatDateCustom(isoString: string) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date).replace('.', '');
}

export function NewsCard({ news }: { news: NewsItem }) {
  const dateLabel = useMemo(() => formatDateCustom(news.publishedAt), [news.publishedAt]);

  return (
    <Link
      to={`/noticias/${news.slug}`}
      data-animated-card
      className="group block h-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-[2.5rem]"
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-500 hover:shadow-[0_32px_80px_rgba(15,76,129,0.08)] hover:ring-slate-200">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
          <img
            src={news.imageUrl}
            alt={news.title}
            className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="absolute left-5 top-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary shadow-sm backdrop-blur-md border border-white/20">
              <Tag className="h-3 w-3" />
              {news.category}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6 md:p-8">
          <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>{dateLabel}</span>
          </div>

          <h3 className="mb-4 line-clamp-3 text-xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-primary md:text-2xl">
            {news.title}
          </h3>

          {news.excerpt ? (
            <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-slate-500">
              {news.excerpt}
            </p>
          ) : null}

          <div className="mt-auto flex items-center gap-2 text-sm font-bold text-primary border-t border-slate-100/80 pt-6">
            <span className="relative overflow-hidden">
              <span className="block transition-transform duration-500 group-hover:-translate-y-full">Leer Noticia completa</span>
              <span className="absolute inset-0 block translate-y-full text-secondary transition-transform duration-500 group-hover:translate-y-0">Leer Noticia completa</span>
            </span>
            <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:text-secondary" />
          </div>
        </div>
      </div>
    </Link>
  );
}
