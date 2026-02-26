/**
 * FestaCard component for displaying festa summaries in a grid.
 * Shows poster/image, title, dates, and current status.
 */

import { Link } from "react-router-dom";
import { ChevronRight, CalendarDays, Star, Users } from "lucide-react";
import { Festa } from "../types";

interface FestaCardProps {
  festa: Festa;
}

export const FestaCard = ({ festa }: FestaCardProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ca-ES", {
      day: "numeric",
      month: "short",
    });
  };

  const dateRange =
    festa.start_date && festa.end_date
      ? `${formatDate(festa.start_date)} - ${formatDate(festa.end_date)}`
      : festa.start_date
        ? formatDate(festa.start_date)
        : "";

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-[2.5rem] border transition-all duration-500 ${
        festa.is_current
          ? "border-primary/30 bg-primary/5 shadow-xl shadow-primary/10"
          : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-xl"
      }`}
    >
      {/* Image Section */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <img
          src={
            festa.posters?.[0]?.variant_medium ||
            festa.posters?.[0]?.file ||
            festa.featured_media?.variant_medium ||
            festa.featured_media?.file ||
            festa.image_url ||
            "/placeholder-festa.jpg"
          }
          alt={festa.title}
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Current Badge */}
        {festa.is_current && (
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
              <Star className="h-3 w-3" />
              Festa Actual
            </div>
          </div>
        )}

        {/* Year Badge */}
        <div className="absolute top-4 right-4">
          <div className="rounded-full bg-white/20 backdrop-blur-md px-4 py-2 text-sm font-black text-white">
            {festa.year}
          </div>
        </div>

        {/* Content at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">
            {festa.title}
          </h3>

          {festa.subtitle && (
            <p className="text-sm text-white/70 mb-4 line-clamp-2">
              {festa.subtitle}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 mb-6">
            {dateRange && (
              <div className="flex items-center gap-2 text-white/80">
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs font-bold">{dateRange}</span>
              </div>
            )}
            {festa.duration_days > 0 && (
              <div className="text-xs font-bold text-white/60">
                {festa.duration_days} días
              </div>
            )}
            {festa.events_count > 0 && (
              <div className="flex items-center gap-1.5 text-white/60">
                <Users className="h-3.5 w-3.5" />
                <span className="text-xs font-bold">
                  {festa.events_count} eventos
                </span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <Link
            to={`/festes/${festa.slug}`}
            className="flex items-center justify-center gap-2 rounded-2xl bg-white py-4 text-[10px] font-black uppercase tracking-widest text-slate-900 transition-all hover:bg-primary hover:text-white active:scale-95 w-full"
          >
            Ver programa
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
