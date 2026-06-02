import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Navigation,
  Leaf,
  Sparkles,
  Umbrella,
  Flag,
  Landmark,
  ArrowUpRight,
} from "lucide-react";
import gsap from "gsap";
import { ensureGsapPlugins } from "@/lib/motion";

ensureGsapPlugins();

type PillarItem = {
  title: string;
  href: string;
  icon: any;
  color: string;
  lightColor: string;
};

const PILLARS: PillarItem[] = [
  {
    title: "Rutes Autoguiades",
    href: "/rutas",
    icon: Navigation,
    color: "bg-primary",
    lightColor: "hover:bg-primary/90",
  },
  {
    title: "Natura",
    href: "/lugares?category=nature",
    icon: Leaf,
    color: "bg-green",
    lightColor: "hover:bg-green/90",
  },
  {
    title: "Festes I Tradicions",
    href: "/festes",
    icon: Sparkles,
    color: "bg-secondary",
    lightColor: "hover:bg-secondary/90",
  },
  {
    title: "Platges",
    href: "/categorias/beaches",
    icon: Umbrella,
    color: "bg-secondary-light",
    lightColor: "hover:bg-secondary-light/90",
  },
  {
    title: "Visites Guiades",
    href: "/lugares?category=culture",
    icon: Flag,
    color: "bg-accent",
    lightColor: "hover:bg-accent/90",
  },
  {
    title: "Patrimoni Històric",
    href: "/lugares?category=heritage",
    icon: Landmark,
    color: "bg-primary-dark",
    lightColor: "hover:bg-primary-dark/90",
  },
];

export const HomePillars = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-pillar-item]",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.08,
          ease: "power4.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
          },
        },
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {PILLARS.map((pillar) => (
          <Link
            key={pillar.title}
            to={pillar.href}
            data-pillar-item
            className={`group relative flex h-48 flex-col items-center justify-center gap-4 p-6 text-white transition-all duration-500 md:h-64 lg:h-72 ${pillar.color} ${pillar.lightColor}`}
          >
            {/* Background effect */}
            <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/5" />

            {/* Icon Container */}
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-110 group-hover:bg-white/20 group-hover:shadow-xl md:h-20 md:w-20">
              <pillar.icon className="h-8 w-8 transition-transform duration-500 group-hover:rotate-12 md:h-10 md:w-10" />
            </div>

            {/* Text */}
            <div className="relative z-10 flex flex-col items-center gap-1 text-center">
              <span className="text-sm font-bold uppercase tracking-[0.15em] md:text-base">
                {pillar.title}
              </span>
              <ArrowUpRight className="h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100" />
            </div>

            {/* Hover Overlay for depth */}
            <div className="absolute bottom-0 left-0 h-1 w-0 bg-white transition-all duration-500 group-hover:w-full" />
          </Link>
        ))}
      </div>
    </section>
  );
};
