import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HERO_VIDEO } from "@/features/hero/heroData";
import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";
import { HeroScrollIndicator } from "@/features/hero/components/HeroScrollIndicator";
import logoCabrera from "@/assets/logo/logo-cabrera-white.png";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function HeroVideoFrame() {
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const textContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || !textContainerRef.current) return;

    const ctx = gsap.context(() => {
      // STARTING STATE: Text hidden at bottom
      gsap.set(textContainerRef.current, { opacity: 0, y: 150 });

      // ANIMATION ON SCROLL
      gsap.to(textContainerRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "15% top",
          end: "60% top",
          scrub: 1,
        },
      });

      // Subtle video scale/blur
      gsap.to(videoRef.current, {
        scale: 1.1,
        filter: "blur(8px) brightness(0.6)",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, [ready]);

  return (
    <div ref={containerRef} className="hero relative h-[100vh] w-full overflow-hidden bg-black">

      {!ready && (
        <div className="absolute inset-0 z-0">
          <SkeletonBlock className="h-full w-full" rounded="none" />
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className={`absolute inset-0 z-0 h-full w-full object-cover transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}
        src={HERO_VIDEO.src}
        onLoadedData={() => setReady(true)}
      />

      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* TEXT BOX - APPEARS ON SCROLL */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end pb-32">
        <div className="container mx-auto px-6">
          <div ref={textContainerRef} className="space-y-6">
            <span className="inline-block py-2 px-6 bg-primary text-white text-xs font-black uppercase tracking-[0.4em] rounded-full shadow-2xl">
              Cabrera de Mar
            </span>
            <h1 className="text-[clamp(4rem,12vw,12rem)] font-black text-white uppercase leading-[0.8] tracking-tighter">
              BIENVENIDOS <br />
              <span className="text-primary italic">A LA VILA</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 z-30 -translate-x-1/2 text-white/50 animate-bounce">
        <HeroScrollIndicator mode="overlay" />
      </div>
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
