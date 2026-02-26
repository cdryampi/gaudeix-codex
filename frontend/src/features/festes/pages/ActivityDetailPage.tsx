/**
 * ActivityDetailPage - Detailed view for a single activity within a festival program.
 *
 * Features:
 * - Detailed activity information display
 * - SEO: dynamic title and meta description
 * - Schema.org: Event structured data (JSON-LD)
 * - Accessibility: semantic HTML, ARIA labels, keyboard navigation
 * - CTAs: ticket purchase and iCal download
 */

import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Ticket,
  Download,
  Share2,
  ChevronRight,
  Euro,
  Building2,
} from "lucide-react";

import DOMPurify from "dompurify";
import { getActivityBySlug } from "../api";
import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";
import { API_BASE_URL } from "@/lib/api";

export const ActivityDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const {
    data: activity,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["activity", slug],
    queryFn: () => getActivityBySlug(slug!),
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

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("ca-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("ca-ES", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle ticket purchase
  const handleTicketPurchase = () => {
    if (!activity?.ticket_url) return;
    window.open(activity.ticket_url, "_blank");
  };

  // Handle share
  const handleShare = async () => {
    if (!activity) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: activity.title,
          text: activity.summary,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const seoTitle = useMemo(() => {
    if (!activity) return "Activitat | Gaudeix Codex";
    return `${activity.title} | Programacio de Festes | Gaudeix Codex`;
  }, [activity]);

  const seoDescription = useMemo(() => {
    if (!activity) {
      return "Consulta el detall de l'activitat dins de la programacio de festes.";
    }

    const base =
      activity.summary ||
      activity.description ||
      "Activitat de la programacio de festes.";
    const plainText = base
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return plainText.slice(0, 160);
  }, [activity]);

  useEffect(() => {
    document.title = seoTitle;

    let descriptionTag = document.querySelector('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement("meta");
      descriptionTag.setAttribute("name", "description");
      document.head.appendChild(descriptionTag);
    }

    descriptionTag.setAttribute("content", seoDescription);
  }, [seoTitle, seoDescription]);

  if (isLoading) {
    return <ActivityDetailSkeleton />;
  }

  if (error || !activity) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-6 py-36 text-center">
          <h1 className="text-4xl font-black uppercase text-slate-900 mb-4">
            Activitat no trobada
          </h1>
          <p className="text-slate-500 mb-8">
            L'activitat que busques no existeix o ha estat eliminada.
          </p>
          <Link
            to="/festes/programacio"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Veure programa
          </Link>
        </div>
      </main>
    );
  }

  // Generate JSON-LD for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: activity.title,
    description: activity.summary || activity.description,
    startDate: activity.start_at,
    endDate: activity.end_at,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: activity.venue_name,
      address: activity.location,
    },
    offers: activity.is_free
      ? {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
        }
      : activity.ticket_url
        ? {
            "@type": "Offer",
            price: activity.price?.toString() || "",
            priceCurrency: "EUR",
            url: activity.ticket_url,
            availability: "https://schema.org/InStock",
          }
        : undefined,
    organizer: {
      "@type": "Organization",
      name: "Ajuntament de Cabrera de Mar",
      url: "https://cabrerademar.es",
    },
    url: window.location.href,
  };

  const icalUrl = `${API_BASE_URL}/activities/${activity.slug}/ical/`;

  return (
    <main className="min-h-screen bg-white">
      {/* SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_var(--tw-gradient-stops))] from-primary via-slate-900 to-slate-900" />
        </div>

        <div className="container mx-auto px-6 py-24 md:py-32">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-8"
            aria-label="Breadcrumb"
          >
            <Link to="/" className="hover:text-white transition-colors">
              Inici
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/festes" className="hover:text-white transition-colors">
              Festes
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link
              to={`/festes/${activity.festa_slug}`}
              className="hover:text-white transition-colors"
            >
              {activity.festa_slug}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link
              to="/festes/programacio"
              className="hover:text-white transition-colors"
            >
              Programació
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span
              className="text-accent truncate max-w-[200px]"
              aria-current="page"
            >
              {activity.title}
            </span>
          </nav>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            aria-label="Tornar enrere"
          >
            <ArrowLeft className="h-4 w-4" />
            Tornar
          </button>

          {/* Title & Meta */}
          <div className="max-w-4xl">
            {/* Category Badge */}
            <div className="flex flex-wrap gap-3 mb-6">
              {activity.category && (
                <span className="rounded-full bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                  {activity.category}
                </span>
              )}
              <span
                className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-lg ${
                  activity.is_free
                    ? "bg-accent text-slate-900"
                    : "bg-white/20 text-white backdrop-blur-md"
                }`}
              >
                {activity.is_free
                  ? "Gratis"
                  : activity.price_text || `${activity.price} €`}
              </span>
              <span
                className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-lg ${
                  activity.status === "cancelled"
                    ? "bg-red-500 text-white"
                    : "bg-emerald-500 text-white"
                }`}
              >
                {activity.status === "cancelled" ? "Cancel·lat" : "Actiu"}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6">
              {activity.title}
            </h1>

            {activity.summary && (
              <p className="text-xl md:text-2xl text-white/70 font-medium max-w-2xl">
                {activity.summary}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Quick Info Bar */}
      <section className="bg-slate-50 border-b border-slate-100">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-wrap gap-6 md:gap-12">
            {/* Date */}
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-primary" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Data
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {activity.start_at && formatDate(activity.start_at)}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Horari
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {activity.start_at && formatTime(activity.start_at)}
                  {activity.end_at && ` - ${formatTime(activity.end_at)}`}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Lloc
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {activity.venue_name || activity.location}
                </p>
              </div>
            </div>

            {/* Program */}
            {activity.program_slug && (
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Programa
                  </p>
                  <Link
                    to={`/festes/${activity.festa_slug}?program=${activity.program_slug}`}
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    {activity.program_slug}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section
        className="container mx-auto px-6 py-16 md:py-24"
        aria-label="Detall de l'activitat"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            {activity.description && (
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-6">
                  Descripció
                </h2>
                <div
                  className="prose prose-lg max-w-none text-slate-600"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(activity.description),
                  }}
                />
              </div>
            )}

            {/* Location Details */}
            {activity.location && (
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-6">
                  Ubicació
                </h2>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="font-bold text-slate-900">
                        {activity.venue_name}
                      </p>
                      <p className="text-slate-500">{activity.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-6">
                Dades de l'activitat
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    ID
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900">
                    {activity.id}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Slug
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900 break-all">
                    {activity.slug}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Festa ID
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900 break-all">
                    {activity.festa}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Festa
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900 break-all">
                    {activity.festa_slug}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Programa ID
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900 break-all">
                    {activity.program}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Programa
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900 break-all">
                    {activity.program_slug}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Venue ID
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900 break-all">
                    {activity.venue ?? "-"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Venue slug
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900 break-all">
                    {activity.venue_slug || "-"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Venue
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900 break-all">
                    {activity.venue_name || "-"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Categoria
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900 break-all">
                    {activity.category || "-"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Ubicacio
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900 break-all">
                    {activity.location || "-"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Inici
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900 break-all">
                    {formatDateTime(activity.start_at)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Fi
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900 break-all">
                    {activity.end_at ? formatDateTime(activity.end_at) : "-"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Gratuita
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900">
                    {activity.is_free ? "Si" : "No"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Preu numeric
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900">
                    {activity.price ?? "-"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Text preu
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900 break-all">
                    {activity.price_text || "-"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    URL tickets
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900 break-all">
                    {activity.ticket_url || "-"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Estat
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900">
                    {activity.status}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Publicada
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900">
                    {activity.is_published ? "Si" : "No"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Creada
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900">
                    {formatDate(activity.created_at)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Actualitzada
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900">
                    {formatDate(activity.updated_at)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:col-span-2">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Traduccions
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-900 break-all">
                    {activity.translations
                      ? Object.keys(activity.translations).join(", ") || "-"
                      : "-"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-6">
            {/* Ticket CTA */}
            {activity.ticket_url && (
              <button
                onClick={handleTicketPurchase}
                className="flex items-center justify-center gap-3 w-full h-16 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label={`Comprar entrades per ${activity.title}`}
              >
                <Ticket className="h-5 w-5" />
                Comprar Entrades
              </button>
            )}

            {/* Link to Master Event */}
            {activity.event && (
              <Link
                to={`/agenda/${activity.event.slug}`}
                className="flex items-center justify-center gap-3 w-full h-14 rounded-2xl border-2 border-primary text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label={`Veure a l'agenda: ${activity.event.title}`}
              >
                <CalendarDays className="h-4 w-4" />
                Veure a l'Agenda
              </Link>
            )}

            {/* iCal Download */}
            <a
              href={icalUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              aria-label={`Descarregar iCal de ${activity.title}`}
            >
              <Download className="h-4 w-4" />
              Descarregar iCal
            </a>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-3 w-full h-14 rounded-2xl border-2 border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label={`Compartir ${activity.title}`}
            >
              <Share2 className="h-4 w-4" />
              Compartir
            </button>

            {/* Price Info */}
            {!activity.is_free && activity.price_text && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <Euro className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Preu
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      {activity.price_text}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Back to Programming CTA */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-8">
            Vols veure més activitats?
          </h2>
          <Link
            to="/festes/programacio"
            className="inline-flex items-center gap-3 h-14 px-10 rounded-2xl bg-white text-primary text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Veure programa complet
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
};

function ActivityDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Skeleton */}
      <div className="bg-slate-900 py-24 md:py-32">
        <div className="container mx-auto px-6">
          <SkeletonBlock className="h-4 w-48 opacity-20 mb-8" />
          <SkeletonBlock className="h-12 w-32 opacity-20 mb-8" />
          <SkeletonBlock className="h-16 w-3/4 opacity-20 mb-4" />
          <SkeletonBlock className="h-8 w-1/2 opacity-20" />
        </div>
      </div>

      {/* Info Bar Skeleton */}
      <div className="bg-slate-50 py-6">
        <div className="container mx-auto px-6">
          <div className="flex gap-12">
            <SkeletonBlock className="h-12 w-32 opacity-10" />
            <SkeletonBlock className="h-12 w-32 opacity-10" />
            <SkeletonBlock className="h-12 w-48 opacity-10" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <SkeletonBlock className="h-64 w-full opacity-10 rounded-2xl" />
            <SkeletonBlock className="h-40 w-full opacity-10 rounded-2xl" />
          </div>
          <div className="space-y-4">
            <SkeletonBlock className="h-16 w-full opacity-10 rounded-2xl" />
            <SkeletonBlock className="h-14 w-full opacity-10 rounded-2xl" />
            <SkeletonBlock className="h-14 w-full opacity-10 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityDetailPage;
