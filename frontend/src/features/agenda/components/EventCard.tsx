import { useMemo } from "react";
import { MapPin, Tag, Ticket } from "lucide-react";

import type { EventItem } from "@/data/mockEvents";
import { AnimatedCard } from "@/components/animated/AnimatedCard";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { formatDay, formatMonthShort, formatTime, getWhenLabel } from "@/features/agenda/dateUtils";
import { useImageModeCache } from "@/features/agenda/useImageModeCache";

function clampLinesStyle(lines: number) {
  return {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  };
}

export function EventCard({ event }: { event: EventItem }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const startDate = useMemo(() => new Date(event.startAt), [event.startAt]);
  const whenLabel = useMemo(() => getWhenLabel(startDate), [startDate]);
  const dateLabel = useMemo(
    () => `${formatDay(startDate)} ${formatMonthShort(startDate)} · ${formatTime(startDate)}`,
    [startDate]
  );
  const description = event.descriptionShort?.trim();

  const { mode, onImageLoad } = useImageModeCache(event.imageUrl);

  const onNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: integrar con router real (/agenda/:slug)
    console.log("Navigate to", `/agenda/${event.slug}`);
  };

  return (
    <AnimatedCard
      as="a"
      href={`/agenda/${event.slug}`}
      onClick={onNavigate}
      className={[
        "group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-puerto-rico-300 focus-visible:ring-offset-2",
      ].join(" ")}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-[220px] w-full shrink-0 overflow-hidden bg-gray-100 sm:h-auto sm:w-52">
          {mode === "poster" ? (
            <>
              <img
                src={event.imageUrl}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
              />
              <div className="absolute inset-0 bg-black/20" />
              <img
                src={event.imageUrl}
                alt={event.title}
                loading="lazy"
                decoding="async"
                className="relative z-10 h-full w-full object-cover"
                onLoad={(e) => onImageLoad(e.currentTarget)}
              />
            </>
          ) : (
            <img
              src={event.imageUrl}
              alt={event.title}
              loading="lazy"
              decoding="async"
              className={[
                "h-full w-full object-cover",
                prefersReducedMotion ? "" : "transition-transform duration-500 group-hover:scale-[1.03]",
              ].join(" ")}
              onLoad={(e) => onImageLoad(e.currentTarget)}
            />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              {dateLabel}
            </span>
          </div>

          <div className="min-w-0 space-y-2">
            <p className="text-base font-semibold text-gray-900" style={clampLinesStyle(2)}>
              {event.title}
            </p>

            <p className="text-sm text-gray-600" style={clampLinesStyle(1)}>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-puerto-rico-500" aria-hidden="true" />
                {event.venueName} · {event.locationText}
              </span>
            </p>

            {description ? (
              <p className="text-sm text-gray-600" style={clampLinesStyle(2)}>
                {description}
              </p>
            ) : null}
          </div>

          <footer className="mt-auto space-y-3 border-t border-gray-100 pt-4">
            <div className="flex w-full flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200/70">
                <Tag className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
                {event.category}
              </span>

              {whenLabel ? (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  {whenLabel}
                </span>
              ) : event.isFree ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-puerto-rico-100/70 px-3 py-1 text-xs font-semibold text-puerto-rico-800">
                  <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
                  Gratis
                </span>
              ) : null}
            </div>

            <div className="flex justify-end">
              <span
                className={[
                  "inline-flex shrink-0 items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900",
                  "transition hover:bg-gray-50",
                  prefersReducedMotion ? "" : "group-hover:-translate-y-0.5",
                ].join(" ")}
              >
                Ver más
              </span>
            </div>
          </footer>
        </div>
      </div>
    </AnimatedCard>
  );
}
