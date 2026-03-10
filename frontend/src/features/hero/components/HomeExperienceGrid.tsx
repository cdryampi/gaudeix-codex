import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ensureGsapPlugins } from "@/lib/motion";
import { CategoryBrandIcon, CategoryBrandIconKey } from "@/features/categories/components/CategoryBrandIcon";

ensureGsapPlugins();

type ExperienceItem = {
    title: string;
    href: string;
    iconKey: CategoryBrandIconKey;
    color: string;
    bg: string;
};

const EXPERIENCES: ExperienceItem[] = [
    {
        title: "Rutas",
        href: "/rutas",
        iconKey: "routes",
        color: "text-[#94E156]",
        bg: "bg-[#94E156]/16 ring-[#94E156]/40",
    },
    {
        title: "Naturaleza",
        href: "/lugares?category=nature",
        iconKey: "nature",
        color: "text-[#BBCD83]",
        bg: "bg-[#BBCD83]/16 ring-[#BBCD83]/40",
    },
    {
        title: "Agenda Viva",
        href: "/agenda",
        iconKey: "agenda",
        color: "text-[#48C3B1]",
        bg: "bg-[#48C3B1]/16 ring-[#48C3B1]/40",
    },
    {
        title: "Playas",
        href: "/categorias/beaches",
        iconKey: "beaches",
        color: "text-[#3EC5FF]",
        bg: "bg-[#3EC5FF]/16 ring-[#3EC5FF]/40",
    },
    {
        title: "Cultura",
        href: "/lugares?category=culture",
        iconKey: "culture",
        color: "text-[#25226E]",
        bg: "bg-[#25226E]/12 ring-[#25226E]/35",
    },
    {
        title: "Patrimonio",
        href: "/lugares?category=heritage",
        iconKey: "heritage",
        color: "text-[#FFBF3B]",
        bg: "bg-[#FFBF3B]/18 ring-[#FFBF3B]/42",
    },
];

export const HomeExperienceGrid = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo("[data-exp-item]",
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

    return (
        <section
            ref={containerRef}
            className="relative z-30 -mt-10 mb-10 px-4 md:-mt-14 md:mb-24"
        >
            <div className="page-container">
                <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.25rem] bg-white p-2 shadow-[0_28px_72px_rgba(0,0,0,0.12)] ring-1 ring-slate-200/60 md:rounded-[3rem] md:p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                        {EXPERIENCES.map((item) => (
                            <Link
                                key={item.title}
                                to={item.href}
                                data-exp-item
                                className="group relative flex flex-col items-center gap-3.5 rounded-[1.75rem] px-4 py-5 transition-all duration-500 hover:bg-slate-50/90 md:gap-4 md:p-7"
                            >
                                <div className={`relative flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center rounded-[1.2rem] ring-1 transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-[1.06] md:h-[4.9rem] md:w-[4.9rem] ${item.bg} group-hover:shadow-[0_20px_36px_rgba(15,76,129,0.12)]`}>
                                    <CategoryBrandIcon
                                        iconName={item.iconKey}
                                        className={`h-8 w-8 md:h-10 md:w-10 ${item.color}`}
                                    />
                                </div>
                                <div className="text-center">
                                    <span className="text-[0.95rem] font-semibold tracking-tight text-slate-900 md:text-base">
                                        {item.title}
                                    </span>
                                    <div className="mt-1 flex justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                                        <ArrowUpRight className={`h-3 w-3 ${item.color}`} />
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
