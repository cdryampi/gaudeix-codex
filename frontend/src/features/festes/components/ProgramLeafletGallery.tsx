import { CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

import { Festa } from "../types";
import { ProgramLeafletCard } from "./ProgramLeafletCard";

interface ProgramLeafletGalleryProps {
  festa: Festa;
}

export const ProgramLeafletGallery = ({
  festa,
}: ProgramLeafletGalleryProps) => {
  const events = festa.events || [];

  const getFallbackImage = (index: number) => {
    if (festa.gallery && festa.gallery.length > 0) {
      const img = festa.gallery[index % festa.gallery.length];
      return img?.variant_medium || img?.file;
    }
    return (
      festa.featured_media?.variant_medium ||
      festa.featured_media?.file ||
      festa.image_url
    );
  };

  if (events.length === 0) {
    return (
      <div className="p-12 rounded-3xl bg-slate-50 border border-slate-100 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
          <CalendarDays className="w-6 h-6 text-slate-300" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">Proximamente</h3>
        <p className="text-slate-500 mb-6 max-w-md">
          Aun no se han publicado eventos para esta festa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {events.map((event, index) => (
          <ProgramLeafletCard
            key={event.id}
            event={event}
            image={getFallbackImage(index)}
          />
        ))}
      </div>

      {events.length > 6 && (
        <div className="flex justify-center pt-8 border-t border-slate-100">
          <Link
            to="/festes/programacio"
            className="inline-flex items-center gap-2 h-14 px-8 rounded-2xl bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-colors"
          >
            Ver todos los eventos ({events.length})
          </Link>
        </div>
      )}
    </div>
  );
};
