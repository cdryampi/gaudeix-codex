import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function AnimatedCardGrid({
  children,
  stagger = 0.06,
  y = 18,
  duration = 0.55,
  start = "top 80%",
  reduceMotion,
  className,
}: {
  children: React.ReactNode;
  stagger?: number;
  y?: number;
  duration?: number;
  start?: string;
  reduceMotion?: boolean;
  className?: string;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldReduceMotion = reduceMotion ?? prefersReducedMotion;
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (shouldReduceMotion) return;
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-animated-card]");
      if (!cards.length) return;

      gsap.set(cards, { autoAlpha: 0, y, willChange: "transform,opacity" });

      gsap.to(cards, {
        autoAlpha: 1,
        y: 0,
        duration,
        ease: "power2.out",
        stagger,
        clearProps: "willChange",
        scrollTrigger: {
          trigger: rootRef.current,
          start,
          once: true,
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, [duration, stagger, start, shouldReduceMotion, y]);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}

