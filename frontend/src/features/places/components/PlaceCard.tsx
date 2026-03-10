import { ExternalLink, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import { Place } from "../types";
import { getCategoryData } from "../constants";
import { AnimatedCard } from "@/components/animated/AnimatedCard";
import { getPlaceDetailPath } from "../utils";

interface PlaceCardProps {
  place: Place;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const PlaceCard = ({
  place,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: PlaceCardProps) => {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${place.title} ${place.location_text}`,
  )}`;
  const categoryData = getCategoryData(place.template_key);
  const Icon = categoryData?.icon || MapPin;

  return (
    <AnimatedCard
      as="div"
      className={`card-surface group flex h-full flex-col overflow-hidden transition ${
        isHovered
          ? "border-primary/30 shadow-[0_24px_48px_rgba(17,37,53,0.12)]"
          : ""
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative aspect-[16/11] overflow-hidden bg-slate-200">
        <img
          src={
            place.featured_media?.variant_medium ||
            place.featured_media?.file ||
            "/placeholder-place.jpg"
          }
          alt={place.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,24,37,0),rgba(8,24,37,0.22)_100%)]" />

        <div className="absolute left-4 top-4">
          <div
            className={`flex items-center gap-2 rounded-full bg-white/92 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] shadow-sm ${categoryData?.text || "text-slate-900"}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {categoryData?.label || place.template_key || "Lugar"}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-2">
          <h3 className="card-title">{place.title}</h3>
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{place.location_text}</span>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3">
          <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--color-border-soft)] bg-slate-50 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            <ExternalLink className="h-4 w-4" />
            Llegar
          </a>
          <Link
            to={getPlaceDetailPath(place)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary"
          >
            Detalles
          </Link>
        </div>
      </div>
    </AnimatedCard>
  );
};
