import { Event } from "@/features/events/types";
import { FeaturedEventsGrid } from "@/features/agenda/components/FeaturedEventsGrid";

export function FeaturedEvents({ items }: { items: Event[] }) {
  if (!items.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">
          Próximo destacado
        </h2>
        <span className="text-sm text-gray-500">Selección municipal</span>
      </div>
      <FeaturedEventsGrid items={items} />
    </section>
  );
}
