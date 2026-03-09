import { useEffect, useRef } from "react";
import gsap from "gsap";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { ensureGsapPlugins, MOTION, shouldSkipMotion } from "@/lib/motion";

ensureGsapPlugins();

export function AnimatedCardGrid({
  children,
  stagger = 0.06,
  y = 18,
  duration = MOTION.duration.reveal,
  start = MOTION.scrollStart.grid,
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
    if (shouldReduceMotion || shouldSkipMotion) return;
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-animated-card]");
      if (!cards.length) return;

      gsap.set(cards, { autoAlpha: 0, y, filter: "blur(12px)", scale: 0.98, willChange: "transform,opacity,filter" });

      gsap.to(cards, {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        scale: 1,
        duration: duration * 1.5,
        ease: "power3.out",
        stagger: stagger * 1.5,
        clearProps: "willChange,filter,transform",
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
