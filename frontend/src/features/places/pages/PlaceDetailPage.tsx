import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Globe,
  Mail,
  ExternalLink,
  ChevronRight,
  Clock,
  Star,
  Utensils,
} from "lucide-react";
import { getPlaceBySlug } from "../api";
import { Place, Restaurant, Accommodation } from "../types";
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
  if (error || !place)
    return <div className="py-40 text-center">Lugar no encontrado</div>;

  const imageUrl =
    place.featured_media?.variant_large ||
    place.featured_media?.file ||
    "/placeholder-place.jpg";
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.title} ${place.location_text}`)}`;

  // Type guards/casts for specialized info
  const isRestaurant = place.template_key === "restaurants";
  const isAccommodation = place.template_key === "accommodations";
  const restaurant = isRestaurant ? (place as Restaurant) : null;
  const accommodation = isAccommodation ? (place as Accommodation) : null;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full overflow-hidden bg-slate-900 md:h-[75vh]">
        <img
          src={imageUrl}
          alt={place.title}
          className="h-full w-full object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Top Nav Overlay */}
        <div className="absolute top-0 left-0 right-0 z-10 pt-48 px-6 md:px-16">
          <div className="container mx-auto">
            <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-12">
              <Link to="/" className="hover:text-white transition-colors">
                Inicio
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link
                to="/lugares"
                className="hover:text-white transition-colors"
              >
                Lugares
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-primary italic truncate">
                {place.title}
              </span>
            </nav>
          </div>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16">
          <div className="container mx-auto">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-primary px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl">
                  {place.template_key || "Interés"}
                </span>
                {isAccommodation && accommodation?.stars && (
                  <div className="flex items-center gap-1 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 border border-white/20">
                    {Array.from({ length: accommodation.stars }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3 w-3 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                )}
              </div>
              <h1 className="text-6xl font-black uppercase leading-[0.85] tracking-tighter text-white md:text-8xl lg:text-9xl max-w-5xl">
                {place.title}
              </h1>
              <div className="flex items-center gap-2 text-white/70">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold italic tracking-tight">
                  {place.location_text}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="container mx-auto grid gap-16 px-6 py-12 md:grid-cols-12 md:py-32">
        <div className="md:col-span-8 space-y-16">
          {/* Description */}
          <div className="prose prose-2xl max-w-none prose-slate">
            <div
              className="text-slate-600 leading-relaxed space-y-8 text-xl first-letter:text-7xl first-letter:font-black first-letter:text-slate-900 first-letter:mr-3 first-letter:float-left"
              dangerouslySetInnerHTML={{ __html: place.description }}
            />
          </div>

          {/* Specialized Info Boxes */}
          {(isRestaurant || isAccommodation) && (
            <div className="grid gap-8 sm:grid-cols-2">
              {isRestaurant && restaurant && (
                <div className="rounded-[3rem] bg-orange-50 p-10 border border-orange-100">
                  <Utensils className="h-10 w-10 text-orange-500 mb-6" />
                  <h3 className="text-xl font-black uppercase tracking-tight text-orange-900 mb-4">
                    Cocina y Servicios
                  </h3>
                  <ul className="space-y-3 text-orange-800/70 font-medium">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" /> Tipo:{" "}
                      {restaurant.cuisine_type}
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" /> Capacidad:{" "}
                      {restaurant.capacity} personas
                    </li>
                  </ul>
                </div>
              )}
              {isAccommodation && accommodation && (
                <div className="rounded-[3rem] bg-blue-50 p-10 border border-blue-100">
                  <Clock className="h-10 w-10 text-blue-500 mb-6" />
                  <h3 className="text-xl font-black uppercase tracking-tight text-blue-900 mb-4">
                    Horarios
                  </h3>
                  <ul className="space-y-3 text-blue-800/70 font-medium">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" /> Check-in:{" "}
                      {accommodation.check_in_time}
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" /> Check-out:{" "}
                      {accommodation.check_out_time}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Gallery placeholder if needed */}
        </div>

        {/* Sidebar */}
        <div className="md:col-span-4 space-y-8">
          <div className="rounded-[4rem] border border-slate-100 bg-white p-12 shadow-3xl shadow-slate-200/50 sticky top-32">
            <h3 className="mb-12 text-3xl font-black uppercase italic tracking-tighter text-slate-900">
              Contacto
            </h3>

            <div className="space-y-10">
              {place.phone && (
                <div className="flex gap-6 items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-primary">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Teléfono
                    </p>
                    <a
                      href={`tel:${place.phone}`}
                      className="text-lg font-black text-slate-900 hover:text-primary transition-colors"
                    >
                      {place.phone}
                    </a>
                  </div>
                </div>
              )}
              {place.email && (
                <div className="flex gap-6 items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-primary">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Email
                    </p>
                    <a
                      href={`mailto:${place.email}`}
                      className="text-lg font-black text-slate-900 hover:text-primary transition-colors truncate block max-w-[200px]"
                    >
                      {place.email}
                    </a>
                  </div>
                </div>
              )}
              {place.website && (
                <div className="flex gap-6 items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-primary">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Web oficial
                    </p>
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-lg font-black text-slate-900 hover:text-primary transition-colors"
                    >
                      Visitar sitio
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-16 space-y-4">
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-4 rounded-[2rem] bg-slate-950 py-7 text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all hover:bg-primary shadow-xl"
              >
                Cómo llegar <ExternalLink className="h-4 w-4" />
              </a>
              {place.booking_url && (
                <a
                  href={place.booking_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-4 rounded-[2rem] border-2 border-primary py-7 text-[10px] font-black uppercase tracking-[0.3em] text-primary transition-all hover:bg-primary/5"
                >
                  Reservar ahora
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Nearby Places Section */}
      {place.latitude && place.longitude && (
        <div className="container mx-auto px-6 pb-32">
          <NearbyPlaces
            latitude={place.latitude}
            longitude={place.longitude}
            currentPlaceId={place.id}
          />
        </div>
      )}
    </main>
  );
};

const PlaceDetailSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-[70vh] bg-slate-200" />
    <div className="container mx-auto py-20 px-6">
      <div className="h-10 w-1/2 bg-slate-100 rounded-full mb-10" />
      <div className="h-40 w-full bg-slate-50 rounded-[3rem]" />
    </div>
  </div>
);
