import { useMemo, useState } from "react";

import { HERO_VIDEO } from "@/features/hero/heroData";
import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";
import { HeroScrollIndicator } from "@/features/hero/components/HeroScrollIndicator";

export function HeroVideoFrame() {
  const [ready, setReady] = useState(false);

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

      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/25 via-black/10 to-black/10" />
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
