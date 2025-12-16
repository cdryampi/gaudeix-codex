import { useState } from "react";
import { CalendarClock, MapPin } from "lucide-react";

import type { FeaturedEvent } from "@/features/events/types";
import { AnimatedCard } from "@/components/animated/AnimatedCard";
import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const dateFmt = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short" });
  const timeFmt = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" });
  return `${dateFmt.format(d)} · ${timeFmt.format(d)}`;
}

export function FeaturedEventCard({ event }: { event: FeaturedEvent }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <AnimatedCard
      as="a"
      href={event.href || "#eventos"}
      className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {!loaded ? (
          <div className="absolute inset-0">
            <SkeletonBlock className="h-full w-full" rounded="2xl" />
          </div>
        ) : null}

        <img
          src={event.image_url}
          alt={event.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          onLoad={() => setLoaded(true)}
        />
      </div>

      <div className="space-y-2 p-5">
        <p className="text-sm font-semibold text-gray-900">{event.title}</p>
        <p className="text-sm text-gray-600">{event.description}</p>
        <div className="flex flex-col gap-1 text-sm text-gray-600">
          <span className="inline-flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-puerto-rico-500" aria-hidden="true" />
            <span>{formatDateTime(event.starts_at)}</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-puerto-rico-500" aria-hidden="true" />
            <span>{event.location}</span>
          </span>
        </div>
        <div className="pt-1">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-puerto-rico-300 focus-visible:ring-offset-2">
            Ver detalles
          </span>
        </div>
      </div>
    </AnimatedCard>
  );
}

