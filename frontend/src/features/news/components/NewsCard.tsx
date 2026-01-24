import { useMemo } from "react";
import { ArrowRight, Tag } from "lucide-react";
import type { NewsItem } from "../types";
import { formatDateTime } from "@/features/agenda/dateUtils";

export function NewsCard({ news }: { news: NewsItem }) {
  const dateLabel = useMemo(() => formatDateTime(news.publishedAt), [news.publishedAt]);

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-[4rem] bg-white text-slate-900 transition-all hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] h-full"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-200">
        <img
          src={news.imageUrl}
          alt={news.title}
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/5" />
      </div>

      <div className="flex flex-1 flex-col p-10">
        <div className="mb-6 flex items-center justify-between">
          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
            <Tag className="h-4 w-4" />
            {news.category}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {dateLabel}
          </span>
        </div>

        <h3 className="mb-6 text-3xl font-black leading-[1.1] tracking-tighter uppercase">
          {news.title}
        </h3>

        {news.excerpt && (
          <p className="mb-8 line-clamp-3 text-xl text-slate-500 font-medium leading-relaxed">
            {news.excerpt}
          </p>
        )}

        <div className="mt-auto pt-8 border-t border-slate-100 flex items-center justify-between">
          <a
            href={`/noticias/${news.slug}`}
            className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-primary transition-colors"
          >
            Leer más
          </a>
          <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-900 group-hover:bg-primary group-hover:text-white transition-all">
            <ArrowRight className="h-7 w-7" />
          </div>
        </div>
      </div>
    </div>
  );
}
