/**
 * FestaDetailPage - Detailed view for a single festival with program, sponsors, and events.
 */

import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  FileText,
  Image,
  PartyPopper,
  Star,
  Users,
  ChevronRight,
} from "lucide-react";

import { getFestaBySlug } from "../api";
import { SponsorGrid } from "../components/SponsorGrid";
import { EventCard } from "@/features/agenda/components/EventCard";

export const FestaDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const {
    data: festa,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["festa", slug],
    queryFn: () => getFestaBySlug(slug!),
    enabled: !!slug,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ca-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="h-[70vh] bg-slate-100 animate-pulse" />
        <div className="container mx-auto px-6 py-20">
          <div className="h-12 w-1/2 bg-slate-100 animate-pulse rounded-xl mb-8" />
          <div className="h-6 w-3/4 bg-slate-100 animate-pulse rounded-lg" />
        </div>
      </main>
    );
  }

  if (error || !festa) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <PartyPopper className="h-20 w-20 text-slate-200 mx-auto mb-8" />
          <h1 className="text-4xl font-black text-slate-900 mb-4">
            Festa no encontrada
          </h1>
          <p className="text-slate-500 mb-8">
            La festa que buscas no existe o ha sido eliminada.
          </p>
          <Link
            to="/festes"
            className="inline-flex items-center gap-2 h-14 px-8 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Ver todas las festes
          </Link>
        </div>
      </main>
    );
  }

  const dateRange =
    festa.start_date && festa.end_date
      ? `${formatDate(festa.start_date)} - ${formatDate(festa.end_date)}`
      : festa.start_date
        ? formatDate(festa.start_date)
        : "";

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section with Poster */}
      <section className="relative min-h-[70vh] overflow-hidden">
        <img
          src={
            festa.poster?.variant_large ||
            festa.poster?.file ||
            festa.featured_media?.variant_large ||
            festa.featured_media?.file ||
            festa.image_url ||
            "/placeholder-festa.jpg"
          }
          alt={festa.title}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/20" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-20">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 md:top-12 md:left-20 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>

          {/* Badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            {festa.is_current && (
              <div className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                <Star className="h-3 w-3" />
                Festa Actual
              </div>
            )}
            <div className="rounded-full bg-white/20 backdrop-blur-md px-4 py-2 text-sm font-black text-white">
              {festa.year}
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight max-w-4xl">
            {festa.title}
          </h1>

          {festa.subtitle && (
            <p className="text-xl md:text-2xl text-white/70 mt-4 max-w-2xl font-medium italic">
              {festa.subtitle}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap gap-6 mt-8">
            {dateRange && (
              <div className="flex items-center gap-2 text-white/80">
                <CalendarDays className="h-5 w-5" />
                <span className="text-sm font-bold">{dateRange}</span>
              </div>
            )}
            {festa.duration_days > 0 && (
              <div className="text-sm font-bold text-white/60">
                {festa.duration_days} días de celebración
              </div>
            )}
            {festa.events && festa.events.length > 0 && (
              <div className="flex items-center gap-2 text-white/60">
                <Users className="h-4 w-4" />
                <span className="text-sm font-bold">
                  {festa.events.length} eventos
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Summary Bar */}
      {festa.summary && (
        <section className="bg-primary py-8">
          <div className="container mx-auto px-6">
            <p className="text-xl md:text-2xl text-white/90 text-center font-medium max-w-4xl mx-auto">
              {festa.summary}
            </p>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            {/* Description */}
            {festa.description && (
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-6">
                  Sobre la Festa
                </h2>
                <div
                  className="prose prose-lg max-w-none text-slate-600"
                  dangerouslySetInnerHTML={{ __html: festa.description }}
                />
              </div>
            )}

            {/* Program Text */}
            {festa.program_text && (
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-6">
                  Programa
                </h2>
                <div
                  className="prose prose-lg max-w-none text-slate-600"
                  dangerouslySetInnerHTML={{ __html: festa.program_text }}
                />
              </div>
            )}

            {/* Events */}
            {festa.events && festa.events.length > 0 && (
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-6">
                  Eventos ({festa.events.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {festa.events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {festa.gallery && festa.gallery.length > 0 && (
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-6">
                  Galería ({festa.gallery.length} fotos)
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {festa.gallery.map((image) => (
                    <a
                      key={image.id}
                      href={image.variant_large || image.file}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100"
                    >
                      <img
                        src={image.variant_medium || image.file}
                        alt={image.title || "Foto de la festa"}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Image className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            {festa.program_pdf && (
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">
                  Programa Oficial
                </h3>
                <a
                  href={festa.program_pdf.file}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </a>
              </div>
            )}

            {/* Tags */}
            {festa.tags && festa.tags.length > 0 && (
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">
                  Etiquetas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {festa.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      {festa.sponsors && festa.sponsors.length > 0 && (
        <section className="bg-slate-50 py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-2 text-center">
              Gracias a nuestros
            </h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 text-center mb-16">
              Patrocinadores
            </h3>
            <SponsorGrid sponsors={festa.sponsors} />
          </div>
        </section>
      )}

      {/* Back to Festes CTA */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-8">
            ¿Quieres ver más celebraciones?
          </h2>
          <Link
            to="/festes"
            className="inline-flex items-center gap-3 h-16 px-12 rounded-[2rem] bg-accent text-slate-900 text-xs font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform"
          >
            Ver todas las festes
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
};
