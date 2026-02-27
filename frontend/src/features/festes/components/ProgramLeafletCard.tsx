import { Clock, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Event } from "@/features/events/types";

interface ProgramLeafletCardProps {
  event: Event;
  image?: string | null;
}

export const ProgramLeafletCard = ({
  event,
  image,
}: ProgramLeafletCardProps) => {
  const startDate = new Date(event.start_at);
  const endDate = event.end_at ? new Date(event.end_at) : null;

  const timeStr = startDate.toLocaleTimeString("ca-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTimeStr = endDate
    ? endDate.toLocaleTimeString("ca-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
      {/* Editorial Header / Image */}
      <div className="relative h-48 sm:h-56 bg-slate-100 overflow-hidden shrink-0">
        <img
          src={image || "/placeholder-event.jpg"}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          {/* Date Badge Top Left */}
          <div className="bg-white rounded-xl shadow-md p-2 flex flex-col items-center justify-center min-w-[50px] border-b-2 border-[#5CAD4A]">
            <span className="text-xl font-black leading-none text-slate-900">
              {startDate.getDate()}
            </span>
            <span className="text-[9px] font-black uppercase text-[#5CAD4A] tracking-widest">
              {startDate.toLocaleString("ca-ES", { month: "short" })}.
            </span>
          </div>

          {/* Category Badge Top Right */}
          {event.category_name && (
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#5CAD4A] text-[9px] font-black uppercase tracking-widest text-white shadow-md">
              {event.category_name}
            </span>
          )}
        </div>
      </div>

      {/* Content Body - Leaflet Style */}
      <div className="flex flex-col flex-1 p-6">
        <h3 className="text-[16px] font-black text-slate-900 leading-tight mb-4 group-hover:text-[#5CAD4A] transition-colors line-clamp-2 uppercase">
          {event.title}
        </h3>

        <div className="flex flex-col gap-2.5 mb-6">
          {(event.venue_name || event.location_text) && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#5CAD4A] shrink-0" />
              <span className="text-[12px] font-bold text-slate-600 line-clamp-1">
                {event.venue_name || event.location_text}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#5CAD4A] shrink-0" />
            <span className="text-[12px] font-bold text-slate-600">
              {timeStr} {endTimeStr && <span>a {endTimeStr}</span>}
            </span>
          </div>
        </div>

        <div className="mt-auto">
          <Link
            to={`/agenda/${event.slug}`}
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#5CAD4A] hover:text-[#4A8B3C] transition-colors group-hover:underline"
          >
            Ver más
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
