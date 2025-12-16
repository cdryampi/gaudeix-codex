import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { HERO_VIDEO } from "@/features/hero/heroData";
import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";
import { HeroScrollIndicator } from "@/features/hero/components/HeroScrollIndicator";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function HeroVideoFrame() {
  const [ready, setReady] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const videoAttributes = useMemo(
    () => ({
      autoPlay: true,
      muted: true,
      loop: true,
      playsInline: true,
      preload: "auto" as const,
    }),
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion) return;
    if (!contentRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );

      gsap.to(contentRef.current, {
        autoAlpha: 0.75,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "top+=240 top",
          scrub: true,
        },
      });
    }, contentRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <div className="hero relative h-[100svh] w-full overflow-hidden bg-black">
      {!ready ? (
        <div className="absolute inset-0">
          <SkeletonBlock className="h-full w-full" rounded="none" />
        </div>
      ) : null}

      <video
        {...videoAttributes}
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src={HERO_VIDEO.src}
        poster={HERO_VIDEO.poster}
        onLoadedData={() => setReady(true)}
        onCanPlay={() => setReady(true)}
        aria-label="Video principal"
      />

      <div className="absolute inset-0 z-10 bg-black/30" />

      <div className="absolute inset-0 z-20">
        <div className="mx-auto flex h-full max-w-6xl items-center px-6">
          <div
            ref={contentRef}
            className="max-w-xl text-center text-white md:text-left"
            style={prefersReducedMotion ? { opacity: 1, transform: "none" } : undefined}
          >
            <h1 className="text-balance text-4xl font-semibold tracking-tight drop-shadow md:text-5xl">
              Descubre Cabrera de Mar
            </h1>
            <p className="mt-4 text-pretty text-base/7 text-white/90">
              Naturaleza, historia y mar en el Maresme
            </p>
            <div className="mt-7">
              <a
                href="#categorias"
                className="inline-flex items-center justify-center rounded-full border border-white/60 bg-white/10 px-5 py-2.5 text-sm font-medium text-white shadow-sm backdrop-blur transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-puerto-rico-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40"
              >
                Explorar qué hacer
              </a>
            </div>
          </div>
        </div>
      </div>

      <HeroScrollIndicator mode="overlay" />
    </div>
  );
}

export function HeroVideo() {
  return (
    <section id="inicio">
      <HeroVideoFrame />
    </section>
  );
}
