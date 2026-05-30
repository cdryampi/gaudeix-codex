import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ensureGsapPlugins } from "@/lib/motion";
import {
  CategoryBrandIcon,
  CategoryBrandIconKey,
} from "@/features/categories/components/CategoryBrandIcon";

ensureGsapPlugins();

type ExperienceItem = {
  title: string;
  href: string;
  iconKey: CategoryBrandIconKey;
  color: string;
  bg: string;
  hoverShadow: string;
  hoverRing: string;
};

const EXPERIENCES: ExperienceItem[] = [
  {
    title: "Rutas",
    href: "/rutas",
    iconKey: "routes",
    color: "text-[#94E156]",
    bg: "bg-[#94E156]/16 ring-[#94E156]/40",
    hoverShadow:
      "group-hover:shadow-[0_16px_32px_rgba(148,225,86,0.25)] group-focus-visible:shadow-[0_16px_32px_rgba(148,225,86,0.25)]",
    hoverRing:
      "group-hover:ring-[#94E156]/60 group-focus-visible:ring-[#94E156]/60",
  },
  {
    title: "Naturaleza",
    href: "/lugares?category=nature",
    iconKey: "nature",
    color: "text-[#BBCD83]",
    bg: "bg-[#BBCD83]/16 ring-[#BBCD83]/40",
    hoverShadow:
      "group-hover:shadow-[0_16px_32px_rgba(187,205,131,0.25)] group-focus-visible:shadow-[0_16px_32px_rgba(187,205,131,0.25)]",
    hoverRing:
      "group-hover:ring-[#BBCD83]/60 group-focus-visible:ring-[#BBCD83]/60",
  },
  {
    title: "Agenda Viva",
    href: "/agenda",
    iconKey: "agenda",
    color: "text-[#48C3B1]",
    bg: "bg-[#48C3B1]/16 ring-[#48C3B1]/40",
    hoverShadow:
      "group-hover:shadow-[0_16px_32px_rgba(72,195,177,0.25)] group-focus-visible:shadow-[0_16px_32px_rgba(72,195,177,0.25)]",
    hoverRing:
      "group-hover:ring-[#48C3B1]/60 group-focus-visible:ring-[#48C3B1]/60",
  },
  {
    title: "Playas",
    href: "/categorias/beaches",
    iconKey: "beaches",
    color: "text-[#3EC5FF]",
    bg: "bg-[#3EC5FF]/16 ring-[#3EC5FF]/40",
    hoverShadow:
      "group-hover:shadow-[0_16px_32px_rgba(62,197,255,0.25)] group-focus-visible:shadow-[0_16px_32px_rgba(62,197,255,0.25)]",
    hoverRing:
      "group-hover:ring-[#3EC5FF]/60 group-focus-visible:ring-[#3EC5FF]/60",
  },
  {
    title: "Cultura",
    href: "/lugares?category=culture",
    iconKey: "culture",
    color: "text-[#25226E]",
    bg: "bg-[#25226E]/12 ring-[#25226E]/35",
    hoverShadow:
      "group-hover:shadow-[0_16px_32px_rgba(37,34,110,0.20)] group-focus-visible:shadow-[0_16px_32px_rgba(37,34,110,0.20)]",
    hoverRing:
      "group-hover:ring-[#25226E]/50 group-focus-visible:ring-[#25226E]/50",
  },
  {
    title: "Patrimonio",
    href: "/lugares?category=heritage",
    iconKey: "heritage",
    color: "text-[#FFBF3B]",
    bg: "bg-[#FFBF3B]/18 ring-[#FFBF3B]/42",
    hoverShadow:
      "group-hover:shadow-[0_16px_32px_rgba(255,191,59,0.25)] group-focus-visible:shadow-[0_16px_32px_rgba(255,191,59,0.25)]",
    hoverRing:
      "group-hover:ring-[#FFBF3B]/60 group-focus-visible:ring-[#FFBF3B]/60",
  },
];

export const HomeExperienceGrid = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-exp-item]",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.1,
          ease: "power4.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 92%",
          },
        },
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative z-30 -mt-10 mb-10 px-4 md:-mt-14 md:mb-24"
      role="navigation"
      aria-label="Categorías de experiencia principal"
    >
      <div className="page-container">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.25rem] bg-white p-2 shadow-[0_28px_72px_rgba(0,0,0,0.12)] ring-1 ring-slate-200/60 md:rounded-[3rem] md:p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {EXPERIENCES.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                data-exp-item
                aria-label={`Explorar categoría: ${item.title}`}
                className="group relative flex flex-col items-center gap-3.5 rounded-[1.75rem] px-4 py-5 transition-all duration-500 hover:bg-slate-50/90 focus-visible:bg-slate-50/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 md:gap-4 md:p-7"
              >
                <div
                  className={`relative flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center rounded-[1.2rem] ring-1 transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-[1.06] group-focus-visible:-translate-y-1 group-focus-visible:scale-[1.06] ${item.bg} ${item.hoverShadow} ${item.hoverRing}`}
                >
                  <CategoryBrandIcon
                    iconName={item.iconKey}
                    className={`h-8 w-8 md:h-10 md:w-10 ${item.color}`}
                  />
                </div>
                <div className="text-center">
                  <span className="text-[0.95rem] font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-slate-950 md:text-base">
                    {item.title}
                  </span>
                  <div className="mt-1 flex justify-center opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:opacity-100 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5">
                    <ArrowUpRight
                      className={`h-3.5 w-3.5 ${item.color} stroke-[2.5]`}
                    />
                  </div>
                </div>

                {/* Visual separator for desktop */}
                <div className="absolute right-0 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-slate-100/80 last:hidden lg:block" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
