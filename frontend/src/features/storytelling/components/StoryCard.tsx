import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Feather,
  Flame,
  History,
  Landmark,
  Mountain,
  Quote,
  TreePine,
  Waves,
} from "lucide-react";

import type { Story } from "../types";
import { StoryFallbackPattern } from "./StoryFallbackPattern";

/* eslint-disable react-refresh/only-export-components */

export function getDifficultyLabel(value?: string) {
  const labels: Record<string, string> = {
    easy: "Fácil",
    medium: "Media",
    hard: "Alta",
  };
  return labels[value || ""] || value || "Sin nivel";
}

function getPeriodColor(period?: string) {
  const colors: Record<string, string> = {
    Iberian: "bg-primary-50 text-primary-dark border-primary-100",
    Roman: "bg-secondary-50 text-secondary border-secondary-100",
    Medieval: "bg-green-50 text-green border-green-100",
    Modern: "bg-surface-muted text-text-secondary border-border-soft",
    Legend: "bg-accent-50 text-accent-foreground border-accent-light",
    Natural: "bg-green-50 text-green border-green-100",
  };
  return (
    colors[period || ""] ||
    "bg-secondary-50 text-secondary border-secondary-100"
  );
}

function getPeriodIcon(period?: string) {
  switch (period) {
    case "Iberian":
      return Flame;
    case "Roman":
      return Landmark;
    case "Medieval":
      return History;
    case "Modern":
      return Waves;
    case "Legend":
      return BookOpen;
    case "Natural":
      return TreePine;
    default:
      return Mountain;
  }
}

export function StoryCard({
  story,
  compact = false,
  featured = false,
}: {
  story: Story;
  compact?: boolean;
  featured?: boolean;
}) {
  const period = story.historical_period || "Relato";
  const readingTime = story.reading_time || 5;
  const difficulty = getDifficultyLabel(story.difficulty);
  const periodColor = getPeriodColor(story.historical_period);
  const PeriodIcon = getPeriodIcon(story.historical_period);

  const hasImage = !!(
    story.featured_media?.variant_medium || story.featured_media?.file
  );
  const imageUrl =
    story.featured_media?.variant_medium || story.featured_media?.file;

  if (featured) {
    return (
      <Link
        to={`/historias/${story.slug}`}
        className="group relative block overflow-hidden rounded-[2.5rem] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition-all duration-500 hover:shadow-[0_24px_60px_rgba(231,100,12,0.15)]"
      >
        <div className="relative min-h-[360px] md:min-h-[420px] flex flex-col justify-between p-8 text-white md:p-12 overflow-hidden bg-slate-900">
          {/* Card background: Image or beautiful era-themed SVG fallback */}
          {hasImage && imageUrl ? (
            <img
              src={imageUrl}
              alt={story.title}
              loading="eager"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out scale-100 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full transition-transform duration-1000 ease-out scale-100 group-hover:scale-[1.04]">
              <StoryFallbackPattern period={story.historical_period} />
            </div>
          )}

          {/* Premium dark vignette gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-95" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-transparent" />

          {/* Decorative quote icon */}
          <Quote className="absolute right-6 top-6 h-16 w-16 text-white/5 md:h-24 md:w-24 pointer-events-none" />

          <div className="relative z-10 space-y-4 mt-auto">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-md shadow-sm ${periodColor}`}
            >
              <PeriodIcon className="h-3.5 w-3.5" />
              {period}
            </div>
            <h3 className="text-2xl font-black leading-tight drop-shadow-md md:text-4xl max-w-2xl font-display">
              {story.title}
            </h3>
            {story.summary ? (
              <p className="max-w-xl text-sm leading-relaxed text-white/90 md:text-base drop-shadow-sm font-medium">
                {story.summary}
              </p>
            ) : null}
          </div>

          <div className="relative z-10 mt-8 flex flex-wrap items-center gap-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/80 border-t border-white/10 pt-5">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1.5 rounded-xl">
              <Clock className="h-3.5 w-3.5 text-accent" />
              {readingTime} min
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1.5 rounded-xl">
              <Feather className="h-3.5 w-3.5 text-accent" />
              {difficulty}
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 bg-primary px-4 py-2 rounded-full text-white font-bold transition-all shadow-md shadow-primary/20 group-hover:bg-primary-dark group-hover:scale-105">
              <span>Leer relato</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </div>

          {/* Bottom accent glow */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-accent via-primary to-secondary opacity-80" />
        </div>
      </Link>
    );
  }

  if (compact) {
    const compactImageUrl =
      story.featured_media?.variant_thumbnail || story.featured_media?.file;
    return (
      <Link
        to={`/historias/${story.slug}`}
        data-animated-card
        className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <article className="flex items-center gap-4 rounded-2xl border border-border-soft bg-white/80 p-4 shadow-none backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:bg-white hover:shadow-[0_12px_28px_rgba(17,24,39,0.05)]">
          {/* Mini-thumbnail slot with floating small era badge */}
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-border-soft">
            {compactImageUrl ? (
              <img
                src={compactImageUrl}
                alt={story.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <StoryFallbackPattern
                period={story.historical_period}
                className="scale-105"
              />
            )}

            {/* Tiny floating period icon indicator */}
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white p-0.5 shadow-sm border border-border-soft text-primary">
              <PeriodIcon className="h-3 w-3" />
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-text-secondary">
              <span
                className={`rounded-full border px-2 py-0.5 font-bold ${periodColor}`}
              >
                {period}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold">
                <Clock className="h-2.5 w-2.5 text-primary" />
                {readingTime} min
              </span>
            </div>
            <h3 className="text-sm font-extrabold leading-snug text-text-primary transition-colors group-hover:text-primary truncate">
              {story.title}
            </h3>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:text-primary group-hover:translate-x-0.5" />
        </article>
      </Link>
    );
  }

  // Standard Grid Card
  return (
    <Link
      to={`/historias/${story.slug}`}
      data-animated-card
      className="group block h-full rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border-soft bg-white/90 shadow-[0_10px_28px_rgba(17,24,39,0.04)] transition-all duration-300 hover:border-primary/20 hover:bg-white hover:shadow-[0_20px_40px_rgba(17,24,39,0.07)]">
        {/* Cover image or beautifully-styled era fallback */}
        <div className="relative aspect-[16/10] overflow-hidden w-full bg-slate-900 border-b border-border-soft">
          {hasImage && imageUrl ? (
            <img
              src={imageUrl}
              alt={story.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]">
              <StoryFallbackPattern period={story.historical_period} />
            </div>
          )}

          {/* Subtle vignette/gradient at bottom of image area */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />

          {/* Floating Period Badge */}
          <div className="absolute left-4 top-4">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] shadow-sm backdrop-blur-md ${periodColor}`}
            >
              <PeriodIcon className="h-3 w-3" />
              {period}
            </span>
          </div>

          {/* Decorative faint quote */}
          <Quote className="absolute -bottom-2 -right-2 h-14 w-14 text-white/10 pointer-events-none" />
        </div>

        <div className="flex flex-1 flex-col p-5 md:p-6">
          <div className="mb-3.5 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-primary" />
              {readingTime} min
            </span>
            <span className="inline-flex items-center gap-1">
              <Feather className="h-3 w-3 text-primary" />
              {difficulty}
            </span>
          </div>

          <h3 className="text-lg font-extrabold leading-snug text-text-primary transition-colors group-hover:text-primary font-display line-clamp-2">
            {story.title}
          </h3>

          {story.summary ? (
            <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-text-secondary font-medium">
              {story.summary}
            </p>
          ) : null}

          <div className="mt-auto border-t border-border-soft pt-4.5 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-text-muted">
                Fuente
              </p>
              <p className="truncate text-xs font-bold text-text-secondary">
                {story.source_name || "Archivo municipal"}
              </p>
            </div>
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 border border-border-soft text-text-secondary transition-all group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:scale-105 shadow-sm">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
