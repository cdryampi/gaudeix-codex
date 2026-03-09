import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, BedDouble, ChefHat, Compass } from "lucide-react";
import gsap from "gsap";
import { ensureGsapPlugins } from "@/lib/motion";

ensureGsapPlugins();

export const HomeSubHero = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo("[data-subhero-item]",
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
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const items = [
        {
            title: "Qué hacer hoy",
            href: "/agenda",
            icon: Sparkles,
            color: "text-blue-600",
            bg: "bg-blue-50/80 ring-blue-100",
            glow: "group-hover:shadow-blue-200/50",
        },
        {
            title: "Dónde dormir",
            href: "/lugares?category=accommodations",
            icon: BedDouble,
            color: "text-indigo-600",
            bg: "bg-indigo-50/80 ring-indigo-100",
            glow: "group-hover:shadow-indigo-200/50",
        },
        {
            title: "Dónde comer",
            href: "/lugares?category=restaurants",
            icon: ChefHat,
            color: "text-emerald-600",
            bg: "bg-emerald-50/80 ring-emerald-100",
            glow: "group-hover:shadow-emerald-200/50",
        },
        {
            title: "Cómo llegar",
            href: "/como-llegar",
            icon: Compass,
            color: "text-amber-600",
            bg: "bg-amber-50/80 ring-amber-100",
            glow: "group-hover:shadow-amber-200/50",
        },
    ];

    return (
        <section
            ref={containerRef}
            className="relative z-30 -mt-10 mb-10 px-4 md:-mt-14 md:mb-24"
        >
            <div className="page-container">
                <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-white p-2 shadow-[0_32px_80px_rgba(0,0,0,0.1)] ring-1 ring-slate-200/50 md:rounded-[3.5rem] md:p-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4">
                        {items.map((item) => (
                            <Link
                                key={item.title}
                                to={item.href}
                                data-subhero-item
                                className="group relative flex flex-col items-center gap-4 rounded-3xl p-5 transition-all duration-500 hover:bg-slate-50 md:flex-row md:gap-5 md:p-7"
                            >
                                <div className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-110 md:h-16 md:w-16 md:rounded-[1.25rem] ${item.bg} ${item.glow} group-hover:shadow-2xl`}>
                                    <item.icon className={`h-7 w-7 transition-transform duration-500 group-hover:rotate-6 md:h-8 md:w-8 ${item.color}`} />
                                    <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-20" style={{ background: 'radial-gradient(circle at center, currentColor 0%, transparent 70%)' }}></div>
                                </div>
                                <div className="text-center md:text-left">
                                    <span className="text-sm font-bold tracking-tight text-slate-900 md:text-[1.05rem]">
                                        {item.title}
                                    </span>
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
