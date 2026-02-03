/**
 * EventsCategoryLayout - Specialized layout for events and event subcategories.
 *
 * Features:
 * - Calendar-style date grouping
 * - Upcoming vs past events separation
 * - Category-themed colors from registry
 * - Date filters
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ChevronRight,
  CalendarDays,
  History,
} from "lucide-react";
import { EventCard } from "@/features/agenda/components/EventCard";
import { CategoryLayoutProps } from "../types";
import { getCategoryMeta } from "../../constants";
import { Event } from "@/features/events/types";

type TimeFilter = "upcoming" | "past" | "all";

export default function EventsCategoryLayout({
  category,
  events,
  isLoadingEvents,
}: CategoryLayoutProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("upcoming");

  const image =
    category?.featured_media?.variant_large || category?.featured_media?.file;
  const meta = getCategoryMeta(category.slug);
  const accentColor = meta?.text || "text-amber-600";
  const accentBg = meta?.bg || "bg-amber-50";

  // Separate upcoming and past events
  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();
    const upcoming: Event[] = [];
    const past: Event[] = [];

    events.forEach((event) => {
      const eventDate = event.start_at ? new Date(event.start_at) : null;
      if (eventDate && eventDate >= now) {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    });

    // Sort upcoming by date ascending, past by date descending
    upcoming.sort(
      (a, b) =>
        new Date(a.start_at || 0).getTime() -
        new Date(b.start_at || 0).getTime(),
    );
    past.sort(
      (a, b) =>
        new Date(b.start_at || 0).getTime() -
        new Date(a.start_at || 0).getTime(),
    );

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events]);

  const displayedEvents =
    timeFilter === "upcoming"
      ? upcomingEvents
      : timeFilter === "past"
        ? pastEvents
        : events;

  // Group events by month
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, Event[]> = {};
    displayedEvents.forEach((event) => {
      const date = event.start_at ? new Date(event.start_at) : null;
      const key = date
        ? date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
        : "Sin fecha";
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
    });
    return groups;
  }, [displayedEvents]);

  return (
    <div
      className="bg-slate-50 min-h-screen pb-24"
      data-testid="category-layout-events"
    >
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden group">
        {image && (
          <img
            src={image}
            alt={category.nombre}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-16">
          <Link
            to="/categorias"
            className="text-white/80 hover:text-white flex items-center gap-2 mb-6 uppercase tracking-widest text-xs font-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a categorías
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`h-14 w-14 rounded-2xl ${accentBg} flex items-center justify-center shadow-lg`}
            >
              <Calendar className={`w-7 h-7 ${accentColor}`} />
            </div>
            <span
              className={`text-xs font-black uppercase tracking-[0.3em] ${accentColor.replace("text-", "text-")}`}
            >
              Agenda
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
            {category.nombre}
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-2xl font-medium leading-relaxed">
            {category.descripcion}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 md:px-16 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTimeFilter("upcoming")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                  timeFilter === "upcoming"
                    ? `${accentBg} ${accentColor}`
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                Próximos ({upcomingEvents.length})
              </button>
              <button
                onClick={() => setTimeFilter("past")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                  timeFilter === "past"
                    ? `${accentBg} ${accentColor}`
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <History className="w-4 h-4" />
                Pasados ({pastEvents.length})
              </button>
              <button
                onClick={() => setTimeFilter("all")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                  timeFilter === "all"
                    ? `${accentBg} ${accentColor}`
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Todos ({events.length})
              </button>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              {displayedEvents.length} eventos
            </div>
          </div>
        </div>
      </div>

      {/* Events by Month */}
      <div className="container mx-auto px-6 md:px-16 py-12">
        {Object.keys(groupedByMonth).length > 0 ? (
          Object.entries(groupedByMonth).map(([month, monthEvents]) => (
            <section key={month} className="mb-16">
              <div className="flex items-center gap-4 mb-8">
                <div
                  className={`h-12 w-12 rounded-xl ${accentBg} flex items-center justify-center`}
                >
                  <CalendarDays className={`w-6 h-6 ${accentColor}`} />
                </div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 capitalize">
                  {month}
                </h2>
                <span className="text-sm font-bold text-slate-400">
                  {monthEvents.length} evento{monthEvents.length !== 1 && "s"}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monthEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="py-24 text-center">
            <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-6" />
            <p className="text-xl font-bold text-slate-400">
              {timeFilter === "upcoming"
                ? "No hay eventos próximos en esta categoría."
                : timeFilter === "past"
                  ? "No hay eventos pasados en esta categoría."
                  : "No hay eventos en esta categoría."}
            </p>
            {timeFilter !== "all" && (
              <button
                onClick={() => setTimeFilter("all")}
                className={`mt-6 px-6 py-3 rounded-full ${accentBg} ${accentColor} font-bold text-sm transition-all hover:opacity-80`}
              >
                Ver todos los eventos
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {events.length > 0 && (
        <div className="border-t border-slate-200 bg-white">
          <div className="container mx-auto px-6 md:px-16 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-black text-slate-900">
                  {events.length}
                </div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">
                  Total eventos
                </div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-black ${accentColor}`}>
                  {upcomingEvents.length}
                </div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">
                  Próximos
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-slate-400">
                  {pastEvents.length}
                </div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">
                  Pasados
                </div>
              </div>
              <div className="text-center">
                <Link
                  to="/agenda"
                  className={`inline-flex items-center gap-2 ${accentColor} font-bold hover:underline`}
                >
                  Ver agenda completa
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
