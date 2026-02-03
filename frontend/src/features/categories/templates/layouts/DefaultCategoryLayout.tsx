/**
 * DefaultCategoryLayout - Fallback layout for categories without specialized templates.
 *
 * Renders the standard category landing page with:
 * - Hero section with featured image
 * - Places grid section
 * - Events grid section
 * - Empty state when no content
 */

import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar } from "lucide-react";
import { PlaceCard } from "@/features/places/components/PlaceCard";
import { EventCard } from "@/features/agenda/components/EventCard";
import { CategoryLayoutProps } from "../types";
import { Place } from "@/features/places/types";
import { Event } from "@/features/events/types";

export default function DefaultCategoryLayout({
  category,
  places,
  events,
  isLoadingPlaces,
  isLoadingEvents,
}: CategoryLayoutProps) {
  const image =
    category?.featured_media?.variant_large || category?.featured_media?.file;

  return (
    <div
      className="bg-slate-50 min-h-screen pb-24"
      data-testid="category-layout-default"
    >
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] overflow-hidden group">
        {image && (
          <img
            src={image}
            alt={category.nombre}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-20">
          <Link
            to="/categorias"
            className="text-white/80 hover:text-white flex items-center gap-2 mb-8 uppercase tracking-widest text-xs font-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a categorías
          </Link>
          <h1 className="text-[clamp(3rem,6vw,6rem)] font-black text-white uppercase tracking-tighter mb-6 leading-none">
            {category.nombre}
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 max-w-3xl font-medium leading-relaxed text-balance">
            {category.descripcion}
          </p>
        </div>
      </div>

      {/* Places Section */}
      {places.length > 0 && (
        <section className="py-24 px-6 md:px-20 container mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-2 block">
                Descubre
              </span>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                Lugares en{" "}
                <span className="text-primary">{category.nombre}</span>
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {places.map((place: Place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </section>
      )}

      {/* Events Section */}
      {events.length > 0 && (
        <section className="py-24 px-6 md:px-20 container mx-auto border-t border-slate-200">
          <div className="flex items-center gap-4 mb-16">
            <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center text-slate-900 shadow-xl">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-[0.4em] text-accent mb-2 block">
                Agenda
              </span>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                Eventos en{" "}
                <span className="text-accent">{category.nombre}</span>
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event: Event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {places.length === 0 &&
        events.length === 0 &&
        !isLoadingPlaces &&
        !isLoadingEvents && (
          <div className="py-32 text-center container mx-auto px-6">
            <p className="text-2xl font-bold text-slate-400">
              No hay contenido disponible en esta categoría todavía.
            </p>
          </div>
        )}
    </div>
  );
}
