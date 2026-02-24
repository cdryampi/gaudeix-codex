// FavoritesKPI: Top 5 events by favorites_count with refresh button.
// Used in the backoffice dashboard to show popularity metrics.

import { useQuery } from "@tanstack/react-query";
import { Heart, RefreshCw, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { eventsApi } from "@/features/events/api/events";
import { Event } from "@/features/events/types";

const TOP_EVENTS_LIMIT = 5;

export function FavoritesKPI() {
  const {
    data: topEvents,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<Event[]>({
    queryKey: ["events", "top-favorites"],
    queryFn: () => eventsApi.getTopFavorites(TOP_EVENTS_LIMIT),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Heart className="h-5 w-5 text-rose-500" />
          Top 5 Eventos Favoritos
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Actualizar favoritos"
        >
          <RefreshCw
            className={`h-4 w-4 text-muted-foreground ${isFetching ? "animate-spin" : ""}`}
          />
        </Button>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: TOP_EVENTS_LIMIT }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : isError ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No se han podido cargar los favoritos.
          </p>
        ) : !topEvents || topEvents.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Aún no hay eventos con favoritos.
          </p>
        ) : (
          <ol className="space-y-3">
            {topEvents.map((event, index) => (
              <li
                key={event.id}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/40"
              >
                {/* Rank badge */}
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    index === 0
                      ? "bg-amber-100 text-amber-700"
                      : index === 1
                        ? "bg-slate-100 text-slate-600"
                        : index === 2
                          ? "bg-orange-100 text-orange-700"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index === 0 ? <Trophy className="h-3.5 w-3.5" /> : index + 1}
                </span>

                {/* Event title */}
                <span className="flex-1 truncate text-sm font-medium text-foreground">
                  {event.title}
                </span>

                {/* Favorites count */}
                <span className="flex items-center gap-1 text-sm font-semibold text-rose-500">
                  <Heart className="h-3.5 w-3.5 fill-rose-400" />
                  {event.favorites_count ?? 0}
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
