import { useState } from "react";
import type { FeaturedCategory } from "@/features/categories/categoriesData";

export function FeaturedCategoryCard({ category }: { category: FeaturedCategory }) {
  const [loaded, setLoaded] = useState(false);
  const Icon = category.Icon;

  return (
    <a
      href={category.href}
      className="group relative flex flex-col overflow-hidden rounded-[4rem] bg-slate-50 transition-all hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] h-[540px]"
    >
      <div className="absolute inset-0 z-0">
        <img
          src={category.image_src}
          alt={category.title}
          loading="lazy"
          className={`h-full w-full object-cover transition-all duration-1000 group-hover:scale-110 ${loaded ? 'opacity-100' : 'opacity-0 scale-105'}`}
          onLoad={() => setLoaded(true)}
        />
      </div>

      <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-12 flex flex-col justify-end gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-white shadow-2xl transition-transform group-hover:rotate-12 group-hover:scale-110">
          <Icon className="h-8 w-8" />
        </div>
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent opacity-80">Descubrir</span>
          <h3 className="text-4xl md:text-5xl font-black text-white leading-[0.85] tracking-tighter uppercase">
            {category.title}
          </h3>
        </div>
      </div>
    </a>
  );
}
