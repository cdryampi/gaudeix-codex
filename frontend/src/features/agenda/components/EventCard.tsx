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
        "group block rounded-2xl bg-white shadow-sm ring-1 ring-gray-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-puerto-rico-300 focus-visible:ring-offset-2",
      ].join(" ")}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-gray-100 sm:aspect-[4/5] sm:w-40 md:w-44">
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
              <div className="absolute inset-0 bg-black/35" />
              <img
                src={event.imageUrl}
                alt={event.title}
                loading="lazy"
                decoding="async"
                className="relative z-10 h-full w-full object-contain p-3"
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
                prefersReducedMotion ? "" : "transition-transform duration-500 group-hover:scale-[1.02]",
              ].join(" ")}
              onLoad={(e) => onImageLoad(e.currentTarget)}
            />
          )}

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 shadow-sm">
              <Tag className="h-3.5 w-3.5 text-puerto-rico-600" aria-hidden="true" />
              {event.category}
            </span>
            {event.isFree ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-puerto-rico-100 px-3 py-1 text-xs font-semibold text-puerto-rico-800 shadow-sm">
                <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
                Gratis
              </span>
            ) : null}
            {whenLabel ? (
              <span className="rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                {whenLabel}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 gap-4 p-5 sm:items-start">
          <div className="shrink-0">
            <div className="flex w-[78px] flex-col items-center justify-center rounded-2xl bg-gray-900 px-3 py-2 text-white shadow-sm">
              <span className="text-2xl font-semibold leading-none">{formatDay(startDate)}</span>
              <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-white/90">
                {formatMonthShort(startDate)}
              </span>
              <span className="mt-2 text-xs font-semibold text-white/90">{formatTime(startDate)}</span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-gray-900" style={clampLinesStyle(2)}>
              {event.title}
            </p>
            <p className="mt-2 text-sm text-gray-600" style={clampLinesStyle(1)}>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-puerto-rico-500" aria-hidden="true" />
                {event.venueName} · {event.locationText}
              </span>
            </p>

            <div className="mt-4 flex items-center justify-between gap-3">
              {!event.isFree && event.priceText ? (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                  {event.priceText}
                </span>
              ) : (
                <span className="text-xs text-gray-500">{event.descriptionShort}</span>
              )}

              <span
                className={[
                  "inline-flex shrink-0 items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900",
                  "transition hover:bg-gray-50",
                  prefersReducedMotion ? "" : "group-hover:-translate-y-1",
                ].join(" ")}
              >
                Ver detalls
              </span>
            </div>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}

