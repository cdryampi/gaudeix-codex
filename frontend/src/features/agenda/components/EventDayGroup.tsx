import type { EventItem } from "@/data/mockEvents";
import { EventCard } from "@/features/agenda/components/EventCard";
import { AnimatedCardGrid } from "@/components/animated/AnimatedCardGrid";

export function EventDayGroup({ dayLabel, items }: { dayLabel: string; items: EventItem[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight text-gray-900">{dayLabel}</h3>
        <span className="text-sm text-gray-500">{items.length} eventos</span>
      </div>
      <AnimatedCardGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </AnimatedCardGrid>
    </section>
  );
}

