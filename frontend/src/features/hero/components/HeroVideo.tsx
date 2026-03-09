import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { HERO_VIDEO } from "@/features/hero/heroData";
import { HeroScrollIndicator } from "./HeroScrollIndicator";
import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { ensureGsapPlugins, MOTION, shouldSkipMotion } from "@/lib/motion";

ensureGsapPlugins();

export function HeroVideoFrame() {
  const [ready, setReady] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || shouldSkipMotion || !rootRef.current) return;

    const ctx = gsap.context(() => {
      if (mediaRef.current) {
        gsap.fromTo(
          mediaRef.current,
          { scale: 1.08, yPercent: -4 },
          {
            scale: 1,
            yPercent: 0,
            duration: 1.4,
            ease: MOTION.ease.entrance,
          },
        );

        gsap.to(mediaRef.current, {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            scrub: 0.8,
            start: MOTION.scrollStart.parallax,
            end: "bottom top",
          },
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={rootRef}
      className="relative min-h-[100dvh] overflow-hidden bg-slate-950 text-white"
    >
      <div className="absolute inset-0">
        <div
          ref={mediaRef}
          className="absolute inset-0 h-[115%] w-full"
        >
          <div
            className={`absolute inset-0 z-10 transition-opacity duration-700 ${ready ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
          >
            <SkeletonBlock className="h-full w-full bg-slate-900" rounded="none" />
          </div>

          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={HERO_VIDEO.poster}
            className="absolute inset-0 h-full w-full object-cover"
            src={HERO_VIDEO.src}
            onLoadedData={() => setReady(true)}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/60 " />
      </div>

      <div className="page-container relative flex min-h-[100dvh] flex-col justify-end pb-32 md:pb-40">
        {/* Hero content removed to focus exclusively on video as requested */}
      </div>

      <HeroScrollIndicator />
    </section>
  );
}

export function HeroVideo() {
  return (
    <section id="inicio">
      <HeroVideoFrame />
    </section>
  );
}
