import { Event } from "@/features/events/types";
import { EventCard } from "@/features/agenda/components/EventCard";

export function EventDayGroup({
  items,
}: {
  dayLabel?: string;
  items: Event[];
}) {
  return (
    <div className="w-full">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:gap-10">
        {items.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
