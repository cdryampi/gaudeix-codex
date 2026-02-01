import { MapPin, ChevronRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Place } from "../types";
import { getCategoryData } from "../constants";

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
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.title} ${place.location_text}`)}`;
  const categoryData = getCategoryData(place.template_key);
  const Icon = categoryData?.icon || MapPin;

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-[2.5rem] border transition-all duration-500 ${
        isHovered
          ? "border-primary/30 bg-primary/5 shadow-2xl shadow-primary/10 -translate-y-2"
          : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-xl"
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Image Section */}
      <div className="relative aspect-[16/11] w-full overflow-hidden">
        <img
          src={
            place.featured_media?.variant_medium ||
            place.featured_media?.file ||
            "/placeholder-place.jpg"
          }
          alt={place.title}
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />

        {/* Category Badge with Icon */}
        <div className="absolute top-4 left-4">
          <div
            className={`flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-md px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-sm ${categoryData?.text || "text-slate-900"}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {categoryData?.label || place.template_key || "Lugar"}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-8">
        <h3 className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-primary transition-colors mb-3 leading-tight">
          {place.title}
        </h3>

        <div className="flex items-start gap-2 text-slate-500 mb-8">
          <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary/40" />
          <span className="text-xs font-bold leading-relaxed">
            {place.location_text}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="mt-auto grid grid-cols-2 gap-4">
          <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-50 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Llegar
          </a>
          <Link
            to={`/lugares/${place.slug}`}
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-primary hover:shadow-lg hover:shadow-primary/20 active:scale-95"
          >
            Detalles
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
