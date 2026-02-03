/**
 * NatureCategoryLayout - Specialized layout for nature, heritage, beaches, culture categories.
 *
 * Features:
 * - Photo gallery with lightbox effect
 * - Map preview / CTA
 * - Difficulty/type indicators
 * - Seasonal recommendations
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Map,
  Camera,
  ChevronRight,
  ExternalLink,
  TreePine,
  Sun,
  Snowflake,
  Leaf,
  Flower2,
  Grid3X3,
  LayoutList,
} from "lucide-react";
import { PlaceCard } from "@/features/places/components/PlaceCard";
import { CategoryLayoutProps } from "../types";
import { getCategoryMeta } from "../../constants";
import { Place } from "@/features/places/types";

type ViewMode = "grid" | "gallery";

export default function NatureCategoryLayout({
  category,
  places,
  isLoadingPlaces,
}: CategoryLayoutProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const image =
    category?.featured_media?.variant_large || category?.featured_media?.file;
  const meta = getCategoryMeta(category.slug);
  const accentColor = meta?.text || "text-green-600";
  const accentBg = meta?.bg || "bg-green-50";
  const Icon = meta?.icon || TreePine;

  // Get all images from places for gallery
  const galleryImages = places
    .filter((p) => p.featured_media?.variant_large || p.featured_media?.file)
    .map((p) => ({
      url: p.featured_media?.variant_large || p.featured_media?.file || "",
      title: p.title,
      slug: p.slug,
    }));

  // Season recommendations (static for now)
  const seasons = [
    { icon: Flower2, name: "Primavera", color: "text-pink-500" },
    { icon: Sun, name: "Verano", color: "text-amber-500" },
    { icon: Leaf, name: "Otoño", color: "text-orange-500" },
    { icon: Snowflake, name: "Invierno", color: "text-blue-400" },
  ];

  return (
    <div
      className="bg-slate-50 min-h-screen pb-24"
      data-testid="category-layout-nature"
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
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
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
              <Icon className={`w-7 h-7 ${accentColor}`} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-white/60">
              Explora
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

      {/* Season Recommendations */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-6 md:px-16 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Mejor época:
              </span>
              <div className="flex items-center gap-4">
                {seasons.map((season) => (
                  <div
                    key={season.name}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50"
                  >
                    <season.icon className={`w-4 h-4 ${season.color}`} />
                    <span className="text-sm font-medium text-slate-600">
                      {season.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <Link
              to={`/lugares?category=${category.slug}`}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full ${accentBg} ${accentColor} font-bold text-sm transition-all hover:opacity-80`}
            >
              <Map className="w-4 h-4" />
              Ver en mapa
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* View Toggle & Gallery/Grid */}
      <div className="container mx-auto px-6 md:px-16 py-12">
        {/* View Toggle */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div
              className={`h-12 w-12 rounded-xl ${accentBg} flex items-center justify-center`}
            >
              <MapPin className={`w-6 h-6 ${accentColor}`} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">
                {places.length} lugares
              </h2>
              <p className="text-sm text-slate-500">
                para explorar en {category.nombre}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 rounded-full p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-full transition-all ${
                viewMode === "grid"
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("gallery")}
              className={`p-2.5 rounded-full transition-all ${
                viewMode === "gallery"
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}

        {/* Gallery View */}
        {viewMode === "gallery" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img.url)}
                className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-200"
              >
                <img
                  src={img.url}
                  alt={img.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white font-bold text-sm truncate">
                    {img.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {places.length === 0 && !isLoadingPlaces && (
          <div className="py-24 text-center">
            <TreePine className="w-16 h-16 mx-auto text-slate-300 mb-6" />
            <p className="text-xl font-bold text-slate-400">
              No hay lugares en esta categoría todavía.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-8"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/60 hover:text-white"
            onClick={() => setSelectedImage(null)}
          >
            <span className="text-4xl">×</span>
          </button>
          <img
            src={selectedImage}
            alt=""
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
