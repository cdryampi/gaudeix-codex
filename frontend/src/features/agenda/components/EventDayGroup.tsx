import type { EventItem } from "@/data/mockEvents";
import { EventCard } from "@/features/agenda/components/EventCard";

export function EventDayGroup({ dayLabel, items }: { dayLabel: string; items: EventItem[] }) {
  return (
    <div className="space-y-16">
      <div className="flex flex-col gap-6 border-l-[12px] border-accent pl-10 max-w-4xl">
        <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-slate-900 leading-[0.85]">
          {dayLabel}
        </h3>
        <div className="flex items-center gap-4">
          <span className="h-3 w-3 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">
            {items.length} {items.length === 1 ? 'Actividad' : 'Actividades'}
          </span>
        </div>
      </div>
      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
        {items.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </div>
  );
}
