/**
 * ActivityCard - Visual card for Festa programming activities.
 */

import { CalendarDays, MapPin, Tag, Ticket } from "lucide-react";
import { Link } from "react-router-dom";

import { Activity } from "../types";

interface ActivityCardProps {
  activity: Activity;
}

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString("ca-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const ActivityCard = ({ activity }: ActivityCardProps) => {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
          {activity.category || "Activitat"}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
            activity.is_free
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {activity.is_free ? "Gratuita" : activity.price_text || "De pagament"}
        </span>
      </div>

      <h3 className="text-xl font-black leading-tight tracking-tight text-slate-900">
        {activity.title}
      </h3>

      {activity.summary && (
        <p className="mt-3 line-clamp-3 text-sm font-medium text-slate-600">
          {activity.summary}
        </p>
      )}

      <div className="mt-6 space-y-2 text-sm text-slate-600">
        <p className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span className="font-semibold">{formatDateTime(activity.start_at)}</span>
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{activity.location || activity.venue_name || "Ubicació per confirmar"}</span>
        </p>
        {!activity.is_free && activity.price_text && (
          <p className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" />
            <span>{activity.price_text}</span>
          </p>
        )}
        {activity.program_slug && (
          <p className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <span className="font-semibold">Programa: {activity.program_slug}</span>
          </p>
        )}
      </div>

      {activity.ticket_url && (
        <a
          href={activity.ticket_url}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex h-10 items-center rounded-xl bg-slate-900 px-4 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-primary"
        >
          Comprar entrada
        </a>
      )}

      <div className="mt-4">
        <Link
          to={`/festes/activitats/${activity.slug}`}
          className="inline-flex h-10 items-center rounded-xl border border-slate-300 px-4 text-[10px] font-black uppercase tracking-widest text-slate-700 transition-colors hover:bg-slate-100"
          aria-label={`Veure detall de ${activity.title}`}
        >
          Veure detall
        </Link>
      </div>
    </article>
  );
};
