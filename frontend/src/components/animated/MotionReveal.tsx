import { useEffect, useRef } from "react";
import gsap from "gsap";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { ensureGsapPlugins, MOTION, shouldSkipMotion } from "@/lib/motion";

ensureGsapPlugins();

export function MotionReveal({
  children,
  className,
  y = 28,
  duration = MOTION.duration.reveal,
  start = MOTION.scrollStart.section,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  duration?: number;
  start?: string;
  delay?: number;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || shouldSkipMotion || !rootRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(rootRef.current, { autoAlpha: 0, y, willChange: "transform,opacity" });
      gsap.to(rootRef.current, {
        autoAlpha: 1,
        y: 0,
        duration,
        delay,
        ease: MOTION.ease.entrance,
        clearProps: "willChange",
        scrollTrigger: {
          trigger: rootRef.current,
          start,
          once: true,
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, [delay, duration, prefersReducedMotion, start, y]);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
