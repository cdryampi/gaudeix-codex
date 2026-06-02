import { useMemo } from "react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ArrowLeft } from "lucide-react";

import { getFavorites } from "@/features/events/api";
import { useAuthStore } from "@/features/auth/store";
import { EventCard } from "@/features/agenda/components/EventCard";
import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";

export function FavoritesPage() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
    }
  }, [accessToken, navigate]);

  const {
    data: favoritesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["events", "favorites"],
    queryFn: () => {
      if (!accessToken) throw new Error("No access token");
      return getFavorites(accessToken);
    },
    enabled: !!accessToken,
    retry: (failureCount, error: any) => {
      // If 401, don't retry and logout
      if (error?.status === 401) {
        logout();
        navigate("/login");
        return false;
      }
      return failureCount < 3;
    },
  });

  const favorites = useMemo(() => {
    if (!favoritesData) return [];
    return Array.isArray(favoritesData) ? favoritesData : [];
  }, [favoritesData]);

  return (
    <main className="min-h-screen bg-white selection:bg-primary selection:text-white">
      {/* Header Section */}
      <section className="bg-slate-50 border-b border-slate-100 pt-32 pb-20 px-6 md:px-20">
        <div className="container mx-auto">
          <Link
            to="/agenda"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-primary transition-colors mb-12"
          >
            <ArrowLeft className="h-3 w-3" />
            Volver a la agenda
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-rose-500">
                <Heart className="h-3 w-3 fill-rose-500" />
                Tu selección personal
              </div>
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-slate-950 italic leading-[0.85]">
                Mis <br />
                <span className="text-primary not-italic">Favoritos</span>
              </h1>
            </div>
            <p className="text-xl text-slate-500 font-bold max-w-md leading-tight tracking-tight">
              Guarda las experiencias que no te quieres perder y organiza tu
              propia agenda cultural.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="container mx-auto px-6 py-32">
        {isLoading ? (
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-6">
                <SkeletonBlock
                  className="h-80 w-full opacity-10"
                  rounded="3xl"
                />
                <SkeletonBlock className="h-8 w-3/4 opacity-10" rounded="xl" />
                <SkeletonBlock className="h-4 w-1/2 opacity-10" rounded="xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[3rem] border-4 border-dashed border-red-100 bg-red-50/30 p-24 text-center">
            <p className="text-3xl font-black uppercase tracking-tighter text-red-500">
              Error de conexión
            </p>
            <p className="mt-4 text-lg font-bold text-slate-400">
              No hemos podido cargar tus favoritos. Por favor, inténtalo de
              nuevo.
            </p>
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="py-48 text-center border-4 border-dashed border-slate-100 rounded-[4rem] flex flex-col items-center gap-12">
            <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center">
              <Heart className="h-10 w-10 text-slate-200" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-200">
                Aún no tienes favoritos
              </h2>
              <p className="text-slate-400 font-bold text-lg">
                Explora la agenda y pulsa el corazón en los eventos que te
                interesen.
              </p>
            </div>
            <Link
              to="/agenda"
              className="px-10 py-5 rounded-full bg-slate-950 text-white font-black uppercase tracking-widest hover:bg-primary hover:scale-105 transition-all shadow-2xl"
            >
              Explorar Agenda
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
