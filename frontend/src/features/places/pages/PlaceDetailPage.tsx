import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  Star,
} from "lucide-react";

import { MotionReveal } from "@/components/animated/MotionReveal";
import { PageHero, SectionHeader } from "@/components/site/primitives";
import { getPlaceBySlug } from "../api";
import { Accommodation, Restaurant } from "../types";
import { NearbyPlaces } from "../components/NearbyPlaces";

export const PlaceDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const {
    data: place,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["place", slug],
    queryFn: () => getPlaceBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <PlaceDetailSkeleton />;
  if (error || !place) {
    return <div className="page-shell-offset text-center text-lg text-slate-500">Lugar no encontrado</div>;
  }

  const imageUrl =
    place.featured_media?.variant_large ||
    place.featured_media?.file ||
    "/placeholder-place.jpg";
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${place.title} ${place.location_text}`,
  )}`;

  const isRestaurant = place.template_key === "restaurants";
  const isAccommodation = place.template_key === "accommodations";
  const restaurant = isRestaurant ? (place as Restaurant) : null;
  const accommodation = isAccommodation ? (place as Accommodation) : null;

  return (
    <main className="min-h-screen bg-background-light page-shell-offset">
      <PageHero
        eyebrow="Lugar de interes"
        title={place.title}
        description={place.location_text}
        tone="immersive"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Lugares", href: "/lugares" },
          { label: place.title },
        ]}
        metrics={[
          { label: "Categoria", value: place.template_key || "Lugar" },
          { label: "Ubicacion", value: place.location_text },
          {
            label: "Caracter",
            value:
              isAccommodation && accommodation?.stars
                ? `${accommodation.stars} estrellas`
                : isRestaurant && restaurant?.cuisine_type
                  ? restaurant.cuisine_type
                  : "Descubre el entorno",
          },
        ]}
      />

      <div className="page-container space-y-10 py-10">
        <MotionReveal>
          <div className="card-surface overflow-hidden md:rounded-[2.5rem]">
            <div className="aspect-[21/9] overflow-hidden bg-slate-200">
              <img src={imageUrl} alt={place.title} className="h-full w-full object-cover" />
            </div>
          </div>
        </MotionReveal>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-10">
            <MotionReveal>
              <div className="card-surface p-8 md:p-12 md:rounded-[2.5rem]">
                <SectionHeader
                  eyebrow="Descripción"
                  title="Información general"
                  description="Contenido descriptivo y datos útiles del recurso municipal."
                />
                <div
                  className="prose prose-slate prose-lg mt-8 max-w-none prose-a:text-primary hover:prose-a:text-secondary"
                  dangerouslySetInnerHTML={{ __html: place.description }}
                />
              </div>
            </MotionReveal>

            {(isRestaurant || isAccommodation) && (
              <AnimatedInfoGrid
                isRestaurant={isRestaurant}
                isAccommodation={isAccommodation}
                restaurant={restaurant}
                accommodation={accommodation}
              />
            )}
          </div>

          <MotionReveal>
            <aside className="space-y-8">
              <div className="card-surface p-8 md:rounded-[2.5rem]">
                <h3 className="text-2xl font-semibold tracking-tight text-slate-900">Contacto y accesos</h3>
                <div className="mt-6 space-y-5 text-base text-slate-700">
                  <p className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {place.location_text}
                  </p>
                  {place.phone ? (
                    <a href={`tel:${place.phone}`} className="flex items-center gap-3 hover:text-primary">
                      <Phone className="h-4 w-4 text-primary" />
                      {place.phone}
                    </a>
                  ) : null}
                  {place.email ? (
                    <a href={`mailto:${place.email}`} className="flex items-center gap-3 hover:text-primary">
                      <Mail className="h-4 w-4 text-primary" />
                      {place.email}
                    </a>
                  ) : null}
                  {place.website ? (
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 hover:text-primary"
                    >
                      <Globe className="h-4 w-4 text-primary" />
                      Web oficial
                    </a>
                  ) : null}
                </div>

                {isAccommodation && accommodation?.stars ? (
                  <div className="mt-6 flex items-center gap-1">
                    {Array.from({ length: accommodation.stars }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                ) : null}

                <div className="mt-6 space-y-3">
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary"
                  >
                    Como llegar
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  {place.booking_url ? (
                    <a
                      href={place.booking_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center rounded-2xl border border-primary/12 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                    >
                      Reservar
                    </a>
                  ) : null}
                </div>
              </div>
            </aside>
          </MotionReveal>
        </div>

        {place.latitude && place.longitude ? (
          <MotionReveal>
            <div className="card-surface p-6">
              <NearbyPlaces
                latitude={place.latitude}
                longitude={place.longitude}
                currentPlaceId={place.id}
              />
            </div>
          </MotionReveal>
        ) : null}
      </div>
    </main>
  );
};

function AnimatedInfoGrid({
  isRestaurant,
  isAccommodation,
  restaurant,
  accommodation,
}: {
  isRestaurant: boolean;
  isAccommodation: boolean;
  restaurant: Restaurant | null;
  accommodation: Accommodation | null;
}) {
  return (
    <MotionReveal>
      <div className="grid gap-6 md:grid-cols-2">
        {isRestaurant && restaurant ? (
          <div className="card-surface-muted p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Restauracion
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-900">
              Tipo de cocina: {restaurant.cuisine_type}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Capacidad estimada: {restaurant.capacity} personas.
            </p>
          </div>
        ) : null}
        {isAccommodation && accommodation ? (
          <div className="card-surface-muted p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Alojamiento
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-900">
              Check-in: {accommodation.check_in_time}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Check-out: {accommodation.check_out_time}
            </p>
          </div>
        ) : null}
      </div>
    </MotionReveal>
  );
}

const PlaceDetailSkeleton = () => (
  <div className="min-h-screen bg-background-light page-shell-offset">
    <div className="page-container space-y-8 py-10">
      <div className="card-surface h-[320px] animate-pulse bg-slate-100" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="card-surface h-[360px] animate-pulse bg-slate-100" />
        <div className="card-surface h-[240px] animate-pulse bg-slate-100" />
      </div>
    </div>
  </div>
);
