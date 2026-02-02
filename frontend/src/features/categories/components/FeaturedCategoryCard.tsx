import { useState } from "react";
import { Link } from "react-router-dom";
import { DynamicLucideIcon } from "@/components/atoms/LucideIcon";
import type { LucideIcon } from "lucide-react";
import { ChevronRight, Image as ImageIcon } from "lucide-react";

export interface CategoryCardProps {
  id: string | number;
  title: string;
  href: string;
  image_src?: string | null;
  image?: string | null;
  /** Component from lucide-react */
  IconComponent?: LucideIcon;
  /** String name of the icon from backend */
  icon?: string | null;
  description?: string;
  taxonomy?: string;
}

const PLACEHOLDER_IMAGE = "/media/categorias/placeholder.jpg";

export function FeaturedCategoryCard({
  category,
}: {
  category: CategoryCardProps;
}) {
  const [loaded, setLoaded] = useState(false);
  const IconComponent = category.IconComponent;
  const image = category.image_src || category.image || PLACEHOLDER_IMAGE;
  const iconName = typeof category.icon === "string" ? category.icon : null;
  const isInternal = category.href.startsWith("/");

  const Content = (
    <>
      <div className="absolute inset-0 z-0 bg-slate-200">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-slate-300" />
        )}
        <img
          src={image}
          alt=""
          loading="lazy"
          className={`h-full w-full object-cover transition-all duration-1000 group-hover:scale-110 ${loaded ? "opacity-100" : "opacity-0 scale-105"}`}
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_IMAGE;
            e.currentTarget.onerror = null; // Prevent infinite loop
            setLoaded(true);
          }}
        />
      </div>

      <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-8 md:p-12 flex flex-col justify-end gap-6 transition-all duration-500 group-hover:via-slate-950/60">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-white shadow-2xl transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 group-hover:bg-accent group-hover:text-slate-900">
          {IconComponent ? (
            <IconComponent className="h-8 w-8" />
          ) : iconName ? (
            <DynamicLucideIcon name={iconName} className="h-8 w-8" />
          ) : (
            <ImageIcon className="h-8 w-8" />
          )}
        </div>

        <div className="space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent opacity-90 group-hover:text-white transition-colors">
              {category.taxonomy || "Descubrir"}
            </span>
            <ChevronRight className="h-5 w-5 text-white opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
          </div>

          <h3 className="card-title">{category.title}</h3>

          {category.description && (
            <div className="grid grid-rows-[0fr] transition-all duration-500 group-hover:grid-rows-[1fr]">
              <p className="overflow-hidden text-sm md:text-base font-medium text-slate-200 opacity-0 transition-opacity duration-500 delay-100 group-hover:opacity-100 leading-snug">
                {category.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const containerClasses =
    "group relative flex flex-col overflow-hidden rounded-[4rem] bg-slate-50 transition-all duration-300 hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] h-[400px] md:h-[540px]";

  if (isInternal) {
    return (
      <Link
        to={category.href}
        className={containerClasses}
        aria-label={`Explorar ${category.title}`}
      >
        {Content}
      </Link>
    );
  }

  return (
    <a
      href={category.href}
      className={containerClasses}
      aria-label={`Explorar ${category.title}`}
    >
      {Content}
    </a>
  );
}
