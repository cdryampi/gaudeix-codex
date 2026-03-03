/**
 * FestaDetailPage - Detailed view for a single festival with program, sponsors, and events.
 */

import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Image,
  PartyPopper,
  Users,
  ChevronRight,
} from "lucide-react";

import { getFestaBySlug } from "../api";
import { SponsorGrid } from "../components/SponsorGrid";
import { ProgramTriptychSection } from "../components/ProgramTriptychSection";
import { ProgramLeafletGallery } from "../components/ProgramLeafletGallery";
import { ProgramAtAGlance } from "../components/ProgramAtAGlance";
import { ProgramImageGallery } from "../components/ProgramImageGallery";

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
    <main className="min-h-screen bg-white selection:bg-accent selection:text-slate-900">
      {/* Hero Section with Poster - Editorial Style */}
      <section className="relative min-h-[75vh] md:min-h-[85vh] overflow-hidden flex flex-col">
        <img
          src={
            festa.featured_media?.variant_large ||
            festa.featured_media?.file ||
            festa.posters?.[0]?.variant_large ||
            festa.posters?.[0]?.file ||
            festa.image_url ||
            "/placeholder-festa.jpg"
          }
          alt={festa.title}
          className="absolute inset-0 h-full w-full object-cover scale-105"
        />

        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-slate-900/20" />

        <button
          onClick={() => navigate(-1)}
          className="absolute z-20 top-6 left-6 md:top-12 md:left-20 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-accent transition-colors backdrop-blur-md bg-black/20 px-4 py-2 rounded-full border border-white/10"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Tornar
        </button>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end flex-1 p-6 md:p-20 container mx-auto mb-20 md:mb-24">
          {/* Badges */}
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="rounded-full bg-white/10 border border-white/20 backdrop-blur-md px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white">
              {festa.year}
            </div>
            {festa.category_name && (
              <div className="rounded-full bg-white/10 border border-white/20 backdrop-blur-md px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white">
                {festa.category_name}
              </div>
            )}
          </div>

          <h1 className="text-[clamp(3rem,8vw,6rem)] font-black text-white leading-[0.9] tracking-tighter max-w-5xl uppercase drop-shadow-2xl">
            {festa.title}
          </h1>

          {festa.subtitle && (
            <p className="text-xl md:text-3xl text-white/80 mt-6 max-w-3xl font-medium leading-snug">
              {festa.subtitle}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-8 mt-12 bg-black/30 backdrop-blur-sm p-6 rounded-3xl border border-white/10 w-fit">
            {dateRange && (
              <div className="flex items-center gap-3 text-white">
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <CalendarDays className="h-5 w-5 text-accent" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                    Quan
                  </span>
                  <span className="text-sm font-bold">{dateRange}</span>
                </div>
              </div>
            )}

            {(festa.duration_days > 0 ||
              (festa.events && festa.events.length > 0)) && (
                <div className="w-px h-10 bg-white/10 hidden sm:block" />
              )}

            {festa.duration_days > 0 && (
              <div className="flex items-center gap-3 text-white">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                    Duració
                  </span>
                  <span className="text-sm font-bold">
                    {festa.duration_days} dies
                  </span>
                </div>
              </div>
            )}

            {festa.events && festa.events.length > 0 && (
              <>
                <div className="w-px h-10 bg-white/10 hidden sm:block" />
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2.5 bg-white/10 rounded-xl">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                      Agenda
                    </span>
                    <span className="text-sm font-bold">
                      {festa.events.length} actes
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* At A Glance Section */}
      <ProgramAtAGlance festa={festa} />

      {/* Content */}
      <section className="container mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-20">
            {/* Description and Program Text combined for editorial flow */}
            {(festa.description || festa.program_text) && (
              <div className="prose prose-lg md:prose-xl max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-primary hover:prose-a:text-accent prose-strong:text-slate-900">
                {festa.summary && (
                  <p className="text-2xl text-slate-900 font-medium leading-relaxed mb-10 border-l-4 border-accent pl-6 py-2">
                    {festa.summary}
                  </p>
                )}

                {festa.description && (
                  <div
                    dangerouslySetInnerHTML={{ __html: festa.description }}
                  />
                )}

                {festa.program_text && (
                  <div className="mt-12 bg-slate-50 p-8 md:p-12 rounded-[2rem] border border-slate-100">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6 !mt-0">
                      Notes del Programa
                    </h2>
                    <div
                      dangerouslySetInnerHTML={{ __html: festa.program_text }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Program Triptych Section component injected here */}
            {/* It's self-contained and styled appropriately */}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Tags */}
            {festa.tags && festa.tags.length > 0 && (
              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                  Categoria i Etiquetes
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 rounded-full bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white">
                    {festa.category_name}
                  </span>
                  {festa.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-4 py-2 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider"
                    >
                      {tag.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Official Posters Mini-Gallery inside Sidebar */}
            {festa.posters && festa.posters.length > 0 && (
              <div className="p-8 rounded-[2rem] bg-slate-950 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Image className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                    Cartells Oficials
                  </h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                    {festa.posters.map((img, index) => (
                      <a
                        key={img.id}
                        href={img.variant_large || img.file}
                        target="_blank"
                        rel="noreferrer"
                        className="snap-start shrink-0 w-4/5 flex flex-col group"
                      >
                        <div className="aspect-[1/1.414] rounded-xl overflow-hidden shadow-lg">
                          <img
                            src={img.variant_medium || img.file}
                            alt={`Cartel ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tríptico Program Section */}
      <ProgramTriptychSection festa={festa} />

      {/* Leaflet Gallery for Events */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">
                Agenda
              </h2>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                Actes Destacats
              </h3>
            </div>
            <Link
              to="/festes/programacio"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 text-xs font-black uppercase tracking-widest hover:border-slate-300 hover:bg-slate-100 transition-colors"
            >
              Veure tota l'agenda
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <ProgramLeafletGallery festa={festa} />
        </div>
      </section>

      {/* Gallery Section */}
      <ProgramImageGallery images={festa.gallery} />

      {/* Sponsors Section */}
      {festa.sponsors && festa.sponsors.length > 0 && (
        <section className="bg-white py-24">
          <div className="container mx-auto px-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 text-center">
              Amb el suport de
            </h2>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 text-center mb-16">
              Patrocinadors oficials
            </h3>
            <SponsorGrid sponsors={festa.sponsors} />
          </div>
        </section>
      )}

      {/* Back to Festes CTA */}
      <section className="bg-primary py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-dark/20" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-black text-white mb-10 tracking-tighter">
            Descobreix més festes
          </h2>
          <Link
            to="/festes"
            className="inline-flex items-center gap-3 h-16 px-12 rounded-2xl bg-accent text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 hover:shadow-2xl hover:shadow-accent/20 transition-all"
          >
            Tornar al llistat principal
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
};
