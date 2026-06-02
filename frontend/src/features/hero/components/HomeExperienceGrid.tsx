import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";

import {
  CategoryBrandIcon,
  CategoryBrandIconKey,
} from "@/features/categories/components/CategoryBrandIcon";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { ensureGsapPlugins, MOTION, shouldSkipMotion } from "@/lib/motion";

ensureGsapPlugins();

type ExperienceItem = {
  title: string;
  href: string;
  iconKey: CategoryBrandIconKey;
  bg: string;
  bgHover: string;
  glow: string;
  countLabel: string;
};

const EXPERIENCES: ExperienceItem[] = [
  {
    title: "Rutes Autoguiades",
    href: "/rutas",
    iconKey: "routes",
    bg: "bg-home-category-routes",
    bgHover: "hover:bg-home-category-routes-hover",
    glow: "shadow-home-category-routes",
    countLabel: "12 rutes",
  },
  {
    title: "Natura",
    href: "/lugares?category=nature",
    iconKey: "nature",
    bg: "bg-home-category-nature",
    bgHover: "hover:bg-home-category-nature-hover",
    glow: "shadow-home-category-nature",
    countLabel: "8 espais",
  },
  {
    title: "Festes I Tradicions",
    href: "/agenda",
    iconKey: "agenda",
    bg: "bg-home-category-agenda",
    bgHover: "hover:bg-home-category-agenda-hover",
    glow: "shadow-home-category-agenda",
    countLabel: "24 events",
  },
  {
    title: "Platges",
    href: "/categorias/beaches",
    iconKey: "beaches",
    bg: "bg-home-category-beaches",
    bgHover: "hover:bg-home-category-beaches-hover",
    glow: "shadow-home-category-beaches",
    countLabel: "3 platges",
  },
  {
    title: "Visites Guiades",
    href: "/lugares?category=culture",
    iconKey: "culture",
    bg: "bg-home-category-culture",
    bgHover: "hover:bg-home-category-culture-hover",
    glow: "shadow-home-category-culture",
    countLabel: "6 visites",
  },
  {
    title: "Patrimoni Històric",
    href: "/lugares?category=heritage",
    iconKey: "heritage",
    bg: "bg-home-category-heritage",
    bgHover: "hover:bg-home-category-heritage-hover",
    glow: "shadow-home-category-heritage",
    countLabel: "15 llocs",
  },
];

export const HomeExperienceGrid = () => {
  const containerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || shouldSkipMotion || !containerRef.current)
      return;

    const ctx = gsap.context(() => {
      const tiles = gsap.utils.toArray<HTMLElement>("[data-exp-tile]");
      if (!tiles.length) return;

      gsap.set(tiles, {
        autoAlpha: 0,
        y: 40,
        scale: 0.96,
        willChange: "transform,opacity",
      });

      gsap.to(tiles, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: MOTION.duration.reveal * 1.2,
        stagger: 0.08,
        ease: MOTION.ease.entrance,
        clearProps: "willChange",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 88%",
          once: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={containerRef}
      className="relative z-30 w-full"
      role="navigation"
      aria-label="Categorías de experiencia principal"
    >
      {/* Desktop: grid; Mobile: horizontal scroll snap */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-6">
        {EXPERIENCES.map((item) => (
          <Link
            key={item.title}
            to={item.href}
            data-exp-tile
            aria-label={`Explorar categoría: ${item.title}`}
            className={`group relative flex min-h-[170px] flex-col items-center justify-center gap-3 overflow-hidden px-5 py-7 text-center text-white transition-all duration-500 ${item.bg} ${item.bgHover} focus-visible:z-10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70 lg:min-h-[200px]`}
          >
            {/* Ambient radial glow on hover */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.18), transparent 60%)",
              }}
            />

            {/* Icon */}
            <div className="relative z-10 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-110 group-hover:bg-white/20 lg:h-20 lg:w-20">
              <CategoryBrandIcon
                iconName={item.iconKey}
                className="h-12 w-12 object-contain transition-transform duration-500 group-hover:scale-105 lg:h-14 lg:w-14"
              />
            </div>

            {/* Title */}
            <span className="relative z-10 mt-1 inline-block text-[1.35rem] font-extrabold leading-none tracking-tight text-white drop-shadow-sm lg:text-[1.6rem]">
              {item.title}
            </span>

            {/* Count label */}
            <span className="relative z-10 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 transition-all duration-500 group-hover:text-white/90">
              {item.countLabel}
            </span>

            {/* Arrow reveal */}
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 translate-y-4 items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <span>Explorar</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>

            {/* Bottom accent bar */}
            <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-white/60 transition-all duration-500 group-hover:w-full" />
          </Link>
        ))}
      </div>

      {/* Mobile: horizontal scroll snap */}
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4 pt-2 md:hidden scrollbar-hide">
        {EXPERIENCES.map((item) => (
          <Link
            key={item.title}
            to={item.href}
            data-exp-tile
            aria-label={`Explorar categoría: ${item.title}`}
            className={`group relative flex w-[72vw] shrink-0 snap-center flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl px-5 py-8 text-center text-white transition-all duration-500 active:scale-[0.98] ${item.bg} ${item.glow}`}
          >
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <CategoryBrandIcon
                iconName={item.iconKey}
                className="h-11 w-11 object-contain"
              />
            </div>
            <span className="relative z-10 text-lg font-extrabold leading-none tracking-tight text-white">
              {item.title}
            </span>
            <span className="relative z-10 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
              {item.countLabel}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};
