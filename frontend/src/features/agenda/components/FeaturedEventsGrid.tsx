import type { EventItem } from "@/data/mockEvents";
import { AnimatedCardGrid } from "@/components/animated/AnimatedCardGrid";
import { EventCard } from "@/features/agenda/components/EventCard";

export function FeaturedEventsGrid({ items }: { items: EventItem[] }) {
  return (
    <AnimatedCardGrid className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((e) => (
        <EventCard key={e.id} event={e} />
      ))}
    </AnimatedCardGrid>
  );
}
