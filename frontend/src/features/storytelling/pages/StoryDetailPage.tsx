import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Feather,
  Pause,
  Play,
  Quote,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

import { MotionReveal } from "@/components/animated/MotionReveal";
import { ContentCard } from "@/components/site/primitives";
import { getStory, listStories } from "@/features/storytelling/api";
import { getDifficultyLabel } from "@/features/storytelling/components/StoryCard";
import { StoryFallbackPattern } from "../components/StoryFallbackPattern";
import { ApiRequestError } from "@/lib/api";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";

function paragraphs(value: string) {
  return value
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function selectBestVoice(
  voiceLang: string,
  language: string,
): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // Filter voices matching the target voiceLang (e.g. "es-ES") or language prefix (e.g. "es")
  const matchingVoices = voices.filter((v) => {
    const formattedLang = v.lang.toLowerCase().replace("_", "-");
    return (
      formattedLang === voiceLang.toLowerCase() ||
      formattedLang.startsWith(language.toLowerCase())
    );
  });

  if (matchingVoices.length === 0) {
    const backupVoices = voices.filter((v) =>
      v.lang.toLowerCase().startsWith(language.toLowerCase()),
    );
    if (backupVoices.length > 0) return backupVoices[0];
    const spanishBackup = voices.filter((v) =>
      v.lang.toLowerCase().startsWith("es"),
    );
    if (spanishBackup.length > 0) return spanishBackup[0];
    return voices[0];
  }

  // Score matching voices based on premium and quality keywords
  const scoredVoices = matchingVoices.map((voice) => {
    const name = voice.name.toLowerCase();
    let score = 0;

    if (name.includes("natural")) score += 15;
    if (name.includes("google")) score += 10;
    if (name.includes("enhanced")) score += 8;
    if (name.includes("premium")) score += 8;
    if (name.includes("online")) score += 7;
    if (name.includes("siri")) score += 6;
    if (name.includes("hifi") || name.includes("hi-fi")) score += 6;
    if (name.includes("neural")) score += 5;
    if (name.includes("desktop") || name.includes("local")) score -= 2;
    if (name.includes("standard")) score -= 3;

    return { voice, score };
  });

  // Sort descending by score to pick the highest quality neural/premium voice
  scoredVoices.sort((a, b) => b.score - a.score);
  return scoredVoices[0].voice;
}

function AudioPlayer({
  transcript,
  audioFile,
}: {
  transcript: string;
  audioFile?: any;
}) {
  const { t, language } = useTranslation();
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [speed, setSpeed] = useState<0.75 | 1 | 1.25 | 1.5>(1);
  const [progress, setProgress] = useState(0);

  const charIndexRef = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize and synchronize HTML5 audio if audioFile is provided
  useEffect(() => {
    if (audioFile?.file) {
      const audio = new Audio(audioFile.file);
      audioRef.current = audio;

      const handleTimeUpdate = () => {
        if (audio.duration) {
          const pct = (audio.currentTime / audio.duration) * 100;
          setProgress(pct);
        }
      };

      const handleEnded = () => {
        setPlaying(false);
        setProgress(100);
        setTimeout(() => {
          setProgress(0);
          if (audioRef.current) audioRef.current.currentTime = 0;
        }, 600);
      };

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.pause();
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleEnded);
        audioRef.current = null;
      };
    }
  }, [audioFile?.file]);

  // Clean up speech synthesis on mount and unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startSpeech = useCallback(
    (startIndex: number) => {
      if (!window.speechSynthesis) return;

      window.speechSynthesis.cancel(); // Clear queue

      const textToSpeak = transcript.slice(startIndex);
      if (!textToSpeak.trim()) {
        // If nothing left, restart from beginning
        charIndexRef.current = 0;
        startSpeech(0);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utteranceRef.current = utterance;
      utterance.rate = speed;

      // Dynamically map active user UI language to browser synthesis voice code
      const langMapping: Record<string, string> = {
        es: "es-ES",
        ca: "ca-ES",
        en: "en-US",
        fr: "fr-FR",
      };
      const voiceLang = langMapping[language] || "es-ES";
      utterance.lang = voiceLang;

      // Select the highest quality neural/natural native voice available
      const voice = selectBestVoice(voiceLang, language);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onboundary = (event) => {
        if (event.name === "word") {
          const absoluteIndex = startIndex + event.charIndex;
          charIndexRef.current = absoluteIndex;
          const pct = (absoluteIndex / transcript.length) * 100;
          setProgress(pct);
        }
      };

      utterance.onend = () => {
        setPlaying(false);
        setProgress(100);
        setTimeout(() => {
          setProgress(0);
          charIndexRef.current = 0;
        }, 600);
      };

      utterance.onerror = () => {
        setPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
      setPlaying(true);
    },
    [language, speed, transcript],
  );

  // Synchronize playback speed changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    if (playing && !audioFile?.file && window.speechSynthesis) {
      startSpeech(charIndexRef.current);
    }
  }, [audioFile?.file, playing, speed, startSpeech]);

  // Handle play and pause
  const handlePlayPause = () => {
    if (audioFile?.file) {
      if (!audioRef.current) return;
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        audioRef.current.play();
        setPlaying(true);
      }
    } else {
      if (!window.speechSynthesis) return;
      if (playing) {
        window.speechSynthesis.pause();
        setPlaying(false);
      } else {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          setPlaying(true);
        } else {
          startSpeech(charIndexRef.current);
        }
      }
    }
  };

  return (
    <ContentCard className="overflow-hidden shadow-sm border border-border-soft">
      <div className="flex items-center gap-4 p-6">
        <button
          type="button"
          onClick={handlePlayPause}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          aria-label={
            playing ? t("Pausar audioguía") : t("Reproducir audioguía")
          }
        >
          {playing ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-black uppercase tracking-wider text-text-primary">
              {t("Audioguía")}
            </p>
            {audioFile?.file ? (
              <span className="inline-flex items-center rounded bg-orange-50 px-1.5 py-[2px] text-[7.5px] font-extrabold uppercase tracking-widest text-primary border border-primary/10 leading-none">
                {t("Grabación oficial")}
              </span>
            ) : (
              <span className="text-[7.5px] font-extrabold uppercase tracking-widest text-text-muted/60 leading-none">
                {t("Voz sintetizada")}
              </span>
            )}
            {playing && (
              <span className="inline-flex h-2 w-2 animate-ping rounded-full bg-green" />
            )}
          </div>
          <p className="text-xs font-semibold text-text-secondary">
            {t("Narración del relato municipal")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-black uppercase tracking-widest text-primary transition-colors hover:text-primary-dark cursor-pointer"
        >
          {expanded ? t("Ocultar") : t("Ver texto")}
        </button>
      </div>

      {/* Interactive waveform visual responsive to selected playback speed */}
      <div className="px-6 pb-2">
        <div className="flex h-8 items-end gap-[3px] select-none">
          {Array.from({ length: 32 }).map((_, i) => {
            const isHighlighted = (i / 32) * 100 <= progress;
            const height = 15 + Math.sin(i * 0.8) * 12 + Math.cos(i * 0.5) * 8;
            return (
              <div
                key={i}
                className="w-1 rounded-full transition-all duration-150"
                style={{
                  height: `${Math.max(6, Math.min(100, height))}%`,
                  backgroundColor: isHighlighted
                    ? "var(--primary)"
                    : playing
                      ? "rgba(231, 100, 12, 0.25)"
                      : "var(--border-strong)",
                  animation: playing
                    ? "pulse 1.2s ease-in-out infinite"
                    : undefined,
                  animationDelay: `${i * 40}ms`,
                  animationDuration: `${1200 / speed}ms`,
                }}
              />
            );
          })}
        </div>

        {/* Dynamic Timeline progress bar */}
        <div className="mt-3 relative h-1 w-full bg-border-soft rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Speed controls */}
      <div className="flex items-center justify-between border-t border-border-soft bg-slate-50/50 px-6 py-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
          {t("Velocidad")}
        </span>
        <div className="flex gap-1">
          {([0.75, 1, 1.25, 1.5] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase transition-all cursor-pointer ${
                speed === s
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-muted hover:bg-slate-100 hover:text-text-secondary"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {expanded && transcript && (
        <div className="border-t border-border-soft bg-white p-6">
          <p className="text-sm leading-7 font-medium text-text-secondary whitespace-pre-wrap">
            {transcript}
          </p>
        </div>
      )}
    </ContentCard>
  );
}

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, value)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed left-0 right-0 top-0 z-[999] h-1 bg-slate-900/5">
      <div
        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function StoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [ready, setReady] = useState(false);
  const { t } = useTranslation();

  const {
    data: story,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["stories", "detail", slug],
    queryFn: () => getStory(slug!),
    enabled: !!slug,
    retry: false,
  });

  // Load all stories to compute prev/next navigation
  const { data: allStories = [] } = useQuery({
    queryKey: ["stories", "public"],
    queryFn: () => listStories(),
    staleTime: 5 * 60 * 1000,
  });

  const { prev, next } = useMemo(() => {
    const idx = allStories.findIndex((s) => s.slug === slug);
    if (idx === -1) return { prev: null, next: null };
    return {
      prev: allStories[idx - 1] || null,
      next: allStories[idx + 1] || null,
    };
  }, [allStories, slug]);

  const apiError = error instanceof ApiRequestError ? error : null;
  const isNotFound = apiError?.status === 404 || !slug;

  useEffect(() => {
    if (story) setReady(true);
  }, [story]);

  const hasImage = !!(
    story?.featured_media?.variant_large || story?.featured_media?.file
  );
  const imageUrl =
    story?.featured_media?.variant_large || story?.featured_media?.file;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light page-shell-offset">
        <div className="page-container flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="min-h-screen bg-background-light page-shell-offset">
        <div className="page-container py-20 text-center">
          <h1 className="text-4xl text-text-primary">
            {t("Historia no encontrada")}
          </h1>
          <p className="mt-4 text-text-muted">
            {t("El relato que buscas no está disponible o ya no existe.")}
          </p>
          <Link
            to="/historias"
            className="mt-8 inline-block text-primary hover:underline font-bold"
          >
            {t("Volver a historias")}
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light page-shell-offset">
        <div className="page-container flex min-h-[60vh] items-center justify-center py-20">
          <div className="card-surface flex max-w-xl flex-col items-center gap-5 py-12 text-center">
            <TriangleAlert className="h-12 w-12 text-warning" />
            <div className="space-y-2">
              <h1 className="text-3xl text-text-primary">
                {t("No hemos podido cargar esta historia")}
              </h1>
              <p className="text-sm leading-relaxed text-text-muted">
                {t("Ha ocurrido un problema al conectar con el servicio.")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              {t("Reintentar")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-background-light page-shell-offset">
        <div className="page-container py-20 text-center">
          <h1 className="text-4xl text-text-primary">
            {t("Historia no encontrada")}
          </h1>
          <p className="mt-4 text-text-muted">
            {t("El relato que buscas no está disponible o ya no existe.")}
          </p>
          <Link
            to="/historias"
            className="mt-8 inline-block text-primary hover:underline font-bold"
          >
            {t("Volver a historias")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background-light page-shell-offset text-text-primary">
      {ready && <ReadingProgressBar />}

      {/* Immersive hero with uploaded cover image or SVG fallback pattern */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {/* Cover image or period fallback */}
        {hasImage && imageUrl ? (
          <img
            src={imageUrl}
            alt={story.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-1000 scale-100 hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full opacity-60">
            <StoryFallbackPattern period={story.historical_period} />
          </div>
        )}

        {/* Ambient Overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,179,31,0.15),transparent_40%)]" />

        <Quote className="pointer-events-none absolute -bottom-8 -right-8 h-48 w-48 text-white/[0.03] md:h-64 md:w-64" />

        <div className="page-container relative py-16 md:py-24">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/70"
          >
            <Link to="/" className="transition-colors hover:text-white">
              {t("Inicio")}
            </Link>
            <span className="text-white/30">/</span>
            <Link
              to="/historias"
              className="transition-colors hover:text-white"
            >
              {t("Historias")}
            </Link>
            <span className="text-white/30">/</span>
            <span className="text-white">{story.title}</span>
          </nav>

          <div className="max-w-4xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md">
              {t(story.historical_period || "Relato")}
            </span>
            <h1 className="text-3xl font-black leading-[1.1] text-white md:text-5xl lg:text-6xl font-display">
              {story.title}
            </h1>
            {story.summary ? (
              <p className="max-w-3xl text-base leading-relaxed text-white/80 md:text-lg lg:text-xl font-medium">
                {story.summary}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-bold uppercase tracking-widest text-white/60">
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-xl backdrop-blur-sm">
                <Clock className="h-3.5 w-3.5 text-accent" />
                {story.reading_time || 5} min
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-xl backdrop-blur-sm">
                <Feather className="h-3.5 w-3.5 text-accent" />
                {t(getDifficultyLabel(story.difficulty))}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-xl backdrop-blur-sm">
                <BookOpen className="h-3.5 w-3.5 text-accent" />
                {story.source_name || t("Archivo municipal")}
              </span>
            </div>
          </div>
        </div>
      </section>

      <article className="page-container grid gap-8 py-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <MotionReveal className="min-w-0">
          <ContentCard className="overflow-hidden md:rounded-[2.5rem]">
            <div className="mx-auto max-w-4xl p-6 md:p-14">
              {/* Pull quote from summary */}
              {story.summary ? (
                <blockquote className="relative border-l-4 border-accent pl-6 text-xl font-bold leading-relaxed text-slate-800 md:text-2xl mb-8 font-display">
                  <span className="absolute -left-3 -top-2 text-4xl text-accent/30 font-serif">
                    "
                  </span>
                  {story.summary}
                </blockquote>
              ) : null}

              {/* Content body with standard premium readable sizes */}
              <div className="space-y-6 text-text-secondary font-medium text-lg leading-8 md:text-xl md:leading-9">
                {paragraphs(story.content).length ? (
                  paragraphs(story.content).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                ) : (
                  <p className="italic text-text-muted">
                    {t("Contenido no disponible.")}
                  </p>
                )}
              </div>
            </div>
          </ContentCard>
        </MotionReveal>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          {story.content || story.audio_file ? (
            <AudioPlayer
              transcript={story.content || ""}
              audioFile={story.audio_file}
            />
          ) : null}

          <ContentCard className="space-y-4 p-6 border border-border-soft shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-surface-muted p-4">
                <Clock className="mb-2 h-4 w-4 text-primary" />
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-text-muted">
                  {t("Lectura")}
                </p>
                <p className="text-sm font-bold text-text-primary">
                  {story.reading_time || 5} min
                </p>
              </div>
              <div className="rounded-2xl bg-surface-muted p-4">
                <Feather className="mb-2 h-4 w-4 text-primary" />
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-text-muted">
                  {t("Nivel")}
                </p>
                <p className="text-sm font-bold text-text-primary">
                  {t(getDifficultyLabel(story.difficulty))}
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-surface-muted p-4">
              <BookOpen className="mb-2 h-4 w-4 text-primary" />
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-text-muted">
                {t("Fuente")}
              </p>
              <p className="mt-1 text-xs font-bold text-text-primary">
                {story.source_name || t("Archivo municipal")}
              </p>
              {story.source_url ? (
                <a
                  href={story.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-dark cursor-pointer"
                >
                  {t("Abrir fuente original")}
                  <ExternalLink className="h-4.5 w-4.5" />
                </a>
              ) : null}
            </div>
          </ContentCard>

          <Link
            to="/historias"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border-soft bg-white px-5 py-3.5 text-xs font-black uppercase tracking-wider text-text-secondary transition-all hover:bg-surface-muted hover:-translate-y-0.5 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("Volver a historias")}
          </Link>
        </aside>
      </article>

      {/* Prev / Next navigation */}
      {(prev || next) && (
        <section className="page-container pb-20">
          <div className="grid gap-4 md:grid-cols-2">
            {prev ? (
              <Link
                to={`/historias/${prev.slug}`}
                className="group flex items-center gap-4 rounded-3xl border border-border-soft bg-surface/80 p-6 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-text-muted transition-colors group-hover:bg-primary group-hover:text-white">
                  <ChevronLeft className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-text-muted">
                    {t("Anterior")}
                  </p>
                  <p className="truncate text-sm font-bold text-text-primary transition-colors group-hover:text-primary">
                    {prev.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                to={`/historias/${next.slug}`}
                className="group flex flex-row-reverse items-center gap-4 rounded-3xl border border-border-soft bg-surface/80 p-6 text-right transition-all hover:-translate-y-1 hover:bg-white hover:shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-text-muted transition-colors group-hover:bg-primary group-hover:text-white">
                  <ChevronRight className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-text-muted">
                    {t("Siguiente")}
                  </p>
                  <p className="truncate text-sm font-bold text-text-primary transition-colors group-hover:text-primary">
                    {next.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </section>
      )}
    </main>
  );
}

export default StoryDetailPage;
