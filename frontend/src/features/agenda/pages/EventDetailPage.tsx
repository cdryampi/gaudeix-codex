import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { getEventBySlug, getEvents } from "@/features/events/api";
import { useAuthStore } from "@/features/auth/store";
import { apiPost, apiDelete } from "@/lib/api";
import { EventCard } from "@/features/agenda/components/EventCard";
import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";
import { EventDetailContent } from "@/features/agenda/components/EventDetailContent";

export function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);

  // 1. Fetch main event
  const {
    data: event,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["event", slug],
    queryFn: () => getEventBySlug(slug!),
    enabled: !!slug,
    staleTime: 30_000,
  });

  // 2. Fetch related events (same category)
  const { data: relatedData } = useQuery({
    queryKey: ["events", "related", event?.category_slug],
    queryFn: () => getEvents({ category: event?.category_slug, limit: 4 }),
    enabled: !!event?.category_slug,
  });

  const relatedEvents = (
    Array.isArray(relatedData) ? relatedData : relatedData?.results || []
  )
    .filter((e) => e.slug !== slug)
    .slice(0, 3);

  // 3. Mutation for Favorite
  const favoriteMutation = useMutation({
    mutationFn: () => {
      const authHeaders = accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined;
      if (event?.is_favorited) {
        return apiDelete(`/events/${slug}/favorite/`, { headers: authHeaders });
      }
      return apiPost(`/events/${slug}/favorite/`, {}, { headers: authHeaders });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["event", slug] });
      const previousEvent = queryClient.getQueryData<any>(["event", slug]);
      queryClient.setQueryData(["event", slug], (old: any) =>
        old
          ? {
              ...old,
              is_favorited: !old.is_favorited,
              favorites_count:
                (old.favorites_count ?? 0) + (old.is_favorited ? -1 : 1),
            }
          : old,
      );
      return { previousEvent };
    },
    onSuccess: (_data: any, _vars: any, context: any) => {
      const wasFavorited = context?.previousEvent?.is_favorited;
      toast.success(
        wasFavorited ? "Eliminado de favoritos" : "Añadido a favoritos",
      );
    },
    onError: (_err: any, _vars: any, context: any) => {
      if (context?.previousEvent) {
        queryClient.setQueryData(["event", slug], context.previousEvent);
      }
      toast.error("Error al procesar favoritos");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["event", slug] });
    },
  });

  // 4. Mutation for Check-in
  const checkinMutation = useMutation({
    mutationFn: () => {
      const authHeaders = accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined;
      return apiPost(`/events/${slug}/checkin/`, {}, { headers: authHeaders });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["event", slug] });
      toast.success(
        `¡Check-in realizado! Has ganado ${data.checkin?.points_awarded || 20} puntos.`,
      );
    },
    onError: (err: any) => {
      toast.error(err.detail || "No se ha podido realizar el check-in");
    },
  });

  // Social Share Logic
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.summary,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  // Calendar Logic
  const handleAddToCalendar = () => {
    if (!event) return;
    const start = new Date(event.start_at)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");
    const end = event.end_at
      ? new Date(event.end_at).toISOString().replace(/-|:|\.\d\d\d/g, "")
      : new Date(new Date(event.start_at).getTime() + 2 * 60 * 60 * 1000)
          .toISOString()
          .replace(/-|:|\.\d\d\d/g, "");

    const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.summary)}&location=${encodeURIComponent(event.venue_name)}&sf=true&output=xml`;
    window.open(googleUrl, "_blank");
  };

  if (loading) return <EventDetailSkeleton />;

  if (error || !event) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-gray-50 p-4">
        <p className="text-lg text-gray-600">
          No se ha podido cargar el evento o no existe.
        </p>
        <Link to="/agenda" className="mt-4 text-primary hover:underline">
          Volver a la agenda
        </Link>
      </div>
    );
  }

  return (
    <main>
      <EventDetailContent
        event={event}
        isAuthenticated={isAuthenticated}
        isFavoritePending={favoriteMutation.isPending}
        isCheckinPending={checkinMutation.isPending}
        onFavorite={() =>
          isAuthenticated
            ? favoriteMutation.mutate(undefined)
            : toast.error("Inicia sesión para guardar favoritos")
        }
        onCheckin={() =>
          isAuthenticated
            ? checkinMutation.mutate(undefined)
            : toast.error("Inicia sesión para realizar check-in")
        }
        onShare={handleShare}
        onAddToCalendar={handleAddToCalendar}
      />

      {/* Related Events */}
      {relatedEvents.length > 0 && (
        <section className="container mx-auto px-6 mt-24 border-t border-slate-100 pt-32 pb-24">
          <div className="flex items-baseline justify-between mb-20 px-4">
            <h2 className="text-6xl font-black uppercase tracking-tighter text-slate-950">
              Más <span className="text-primary italic">Actividades</span>
            </h2>
            <Link
              to="/agenda"
              className="text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:underline underline-offset-8"
            >
              Explorar toda la agenda
            </Link>
          </div>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {relatedEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function EventDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-[70vh] w-full bg-slate-900 animate-pulse" />
      <div className="container mx-auto grid gap-16 px-6 py-12 md:grid-cols-12 md:py-32">
        <div className="md:col-span-8 space-y-12">
          <SkeletonBlock className="h-40 w-full opacity-10" rounded="3xl" />
          <SkeletonBlock className="h-80 w-full opacity-10" rounded="3xl" />
          <SkeletonBlock className="h-60 w-full opacity-10" rounded="3xl" />
        </div>
        <div className="md:col-span-4">
          <SkeletonBlock
            className="h-[600px] w-full opacity-10"
            rounded="3xl"
          />
        </div>
      </div>
    </div>
  );
}
