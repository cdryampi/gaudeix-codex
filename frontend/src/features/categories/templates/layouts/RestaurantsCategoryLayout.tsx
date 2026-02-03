/**
 * RestaurantsCategoryLayout - Specialized layout for restaurants category.
 *
 * Features:
 * - Cuisine type filters
 * - Price range display
 * - Hours of operation
 * - Menu highlights
 * - Booking CTAs
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Utensils,
  Clock,
  MapPin,
  Phone,
  ExternalLink,
  Filter,
  ChevronDown,
  DollarSign,
  Users,
} from "lucide-react";
import { PlaceCard } from "@/features/places/components/PlaceCard";
import { CategoryLayoutProps } from "../types";
import { getCategoryMeta } from "../../constants";
import { Restaurant } from "@/features/places/types";

type CuisineFilter = "all" | string;

export default function RestaurantsCategoryLayout({
  category,
  places,
  isLoadingPlaces,
}: CategoryLayoutProps) {
  const [cuisineFilter, setCuisineFilter] = useState<CuisineFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  const image =
    category?.featured_media?.variant_large || category?.featured_media?.file;
  const meta = getCategoryMeta(category.slug);
  const accentColor = meta?.text || "text-orange-600";
  const accentBg = meta?.bg || "bg-orange-50";

  // Cast places to restaurants
  const restaurants = places as Restaurant[];

  // Get unique cuisine types
  const cuisineTypes = useMemo(() => {
    const types = new Set<string>();
    restaurants.forEach((r) => {
      if (r.cuisine_type) types.add(r.cuisine_type);
    });
    return Array.from(types).sort();
  }, [restaurants]);

  // Filter restaurants
  const filteredPlaces =
    cuisineFilter === "all"
      ? restaurants
      : restaurants.filter((r) => r.cuisine_type === cuisineFilter);

  // Count by cuisine
  const cuisineCounts = restaurants.reduce(
    (acc, r) => {
      if (r.cuisine_type) acc[r.cuisine_type] = (acc[r.cuisine_type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div
      className="bg-slate-50 min-h-screen pb-24"
      data-testid="category-layout-restaurants"
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
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
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
              <Utensils className={`w-7 h-7 ${accentColor}`} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-white/60">
              Gastronomía
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-medium text-sm hover:bg-slate-200 transition-colors md:hidden"
              >
                <Filter className="w-4 h-4" />
                Tipo de cocina
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </button>
              <div className="hidden md:flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setCuisineFilter("all")}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    cuisineFilter === "all"
                      ? `${accentBg} ${accentColor}`
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  Todos ({places.length})
                </button>
                {cuisineTypes.map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => setCuisineFilter(cuisine)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all capitalize ${
                      cuisineFilter === cuisine
                        ? `${accentBg} ${accentColor}`
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {cuisine}
                    <span className="text-slate-400 ml-1">
                      ({cuisineCounts[cuisine]})
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="text-sm text-slate-500 font-medium">
              {filteredPlaces.length} restaurante
              {filteredPlaces.length !== 1 && "s"}
            </div>
          </div>

          {/* Mobile filters dropdown */}
          {showFilters && (
            <div className="md:hidden mt-4 pt-4 border-t border-slate-100">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setCuisineFilter("all");
                    setShowFilters(false);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-bold ${
                    cuisineFilter === "all"
                      ? `${accentBg} ${accentColor}`
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Todos
                </button>
                {cuisineTypes.map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => {
                      setCuisineFilter(cuisine);
                      setShowFilters(false);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-bold capitalize ${
                      cuisineFilter === cuisine
                        ? `${accentBg} ${accentColor}`
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="container mx-auto px-6 md:px-16 py-12">
        {filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlaces.map((place) => {
              const restaurant = place as Restaurant;
              return (
                <div key={place.id} className="relative">
                  <PlaceCard place={place} />
                  {/* Cuisine tag overlay */}
                  {restaurant.cuisine_type && (
                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg">
                      <span
                        className={`text-xs font-bold ${accentColor} uppercase tracking-wider`}
                      >
                        {restaurant.cuisine_type}
                      </span>
                    </div>
                  )}
                  {/* Capacity badge */}
                  {restaurant.capacity && (
                    <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-white">
                      <Users className="w-3 h-3" />
                      <span className="text-xs font-bold">
                        {restaurant.capacity}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center">
            <Utensils className="w-16 h-16 mx-auto text-slate-300 mb-6" />
            <p className="text-xl font-bold text-slate-400">
              {cuisineFilter !== "all"
                ? `No hay restaurantes de cocina ${cuisineFilter}.`
                : "No hay restaurantes disponibles."}
            </p>
            {cuisineFilter !== "all" && (
              <button
                onClick={() => setCuisineFilter("all")}
                className={`mt-6 px-6 py-3 rounded-full ${accentBg} ${accentColor} font-bold text-sm`}
              >
                Ver todos
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info Section */}
      {places.length > 0 && (
        <div className="border-t border-slate-200 bg-white">
          <div className="container mx-auto px-6 md:px-16 py-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div
                className={`p-8 rounded-3xl ${accentBg} border ${meta?.border || "border-orange-100"}`}
              >
                <Clock className={`w-8 h-8 ${accentColor} mb-4`} />
                <h3 className="text-lg font-black text-slate-900 mb-2">
                  Horarios típicos
                </h3>
                <p className="text-slate-600">
                  Comidas: 13:00 - 16:00
                  <br />
                  Cenas: 20:00 - 23:00
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                <Phone className="w-8 h-8 text-slate-500 mb-4" />
                <h3 className="text-lg font-black text-slate-900 mb-2">
                  Reservas
                </h3>
                <p className="text-slate-600">
                  Recomendamos reservar con antelación, especialmente fines de
                  semana y festivos.
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                <DollarSign className="w-8 h-8 text-slate-500 mb-4" />
                <h3 className="text-lg font-black text-slate-900 mb-2">
                  Precios orientativos
                </h3>
                <p className="text-slate-600">
                  € Económico • €€ Medio • €€€ Alto
                  <br />
                  Consulta cada establecimiento
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
