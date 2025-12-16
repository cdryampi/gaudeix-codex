import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronsDown } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function HeroScrollIndicator({
  triggerSelector = ".hero",
  mode = "overlay",
}: {
  triggerSelector?: string;
  mode?: "overlay" | "below";
}) {
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const chevronsRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!indicatorRef.current || !dotRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(indicatorRef.current, { opacity: 1, y: 0 });

      gsap.to(indicatorRef.current, {
        opacity: 0,
        y: -16,
        ease: "none",
        scrollTrigger: {
          trigger: triggerSelector,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(dotRef.current, {
        y: 12,
        duration: 0.9,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
      });

      if (chevronsRef.current) {
        gsap.to(chevronsRef.current, {
          y: 6,
          duration: 0.9,
          ease: "power1.inOut",
          repeat: -1,
          yoyo: true,
          delay: 0.08,
        });
      }
    }, indicatorRef);

    return () => ctx.revert();
  }, [triggerSelector]);

  const wrapperClassName =
    mode === "overlay"
      ? "pointer-events-none absolute inset-x-0 bottom-6 z-30 flex justify-center"
      : "pointer-events-none flex justify-center py-8";

  return (
    <div className={wrapperClassName}>
      <div ref={indicatorRef} className="flex flex-col items-center justify-center gap-3">
        <div className="relative h-16 w-10 rounded-full border-2 border-white bg-black/35 shadow-[0_10px_30px_rgba(0,0,0,0.45)] ring-1 ring-white/20 backdrop-blur">
          <div
            ref={dotRef}
            className="absolute left-1/2 top-3 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-puerto-rico-300 shadow-[0_0_18px_rgba(62,191,171,0.85)]"
          />
        </div>

        <div className="flex flex-col items-center gap-1 text-white">
          <ChevronsDown
            ref={chevronsRef}
            className="h-5 w-5 drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)]"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
