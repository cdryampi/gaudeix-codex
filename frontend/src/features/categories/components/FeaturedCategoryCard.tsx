import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Image as ImageIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { CategoryBrandIcon } from "@/features/categories/components/CategoryBrandIcon";

export interface CategoryCardProps {
  id: string | number;
  title: string;
  href: string;
  image_src?: string | null;
  image?: string | null;
  IconComponent?: LucideIcon;
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
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] bg-surface text-text-primary shadow-sm border border-border-soft transition-all duration-500 hover:shadow-[0_32px_80px_rgba(15,76,129,0.08)] hover:border-border-strong">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        {!loaded ? (
          <div className="absolute inset-0 animate-pulse bg-surface-muted" />
        ) : null}
        <img
          src={image}
          alt=""
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 ${
            loaded ? "opacity-100" : "scale-[1.02] opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_IMAGE;
            e.currentTarget.onerror = null;
            setLoaded(true);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      <div className="relative flex flex-1 flex-col p-6 md:p-8">
        <div className="absolute -top-9 right-8 flex h-[4.7rem] w-[4.7rem] items-center justify-center rounded-[1.15rem] border border-border-soft bg-surface text-primary shadow-[0_18px_44px_rgba(15,76,129,0.12)] transition-all duration-500 ease-out group-hover:-translate-y-2">
          {IconComponent ? (
            <IconComponent className="h-7 w-7 stroke-[2.1]" />
          ) : iconName ? (
            <CategoryBrandIcon
              iconName={iconName}
              className="h-9 w-9 text-primary"
            />
          ) : (
            <ImageIcon className="h-7 w-7 stroke-[2.1]" />
          )}
        </div>

        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary/70">
          {category.taxonomy || "Municipio"}
        </span>

        <div className="mt-3 flex-1 space-y-3">
          <h3 className="text-2xl font-bold leading-tight transition-colors group-hover:text-primary">
            {category.title}
          </h3>
          {category.description ? (
            <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">
              {category.description}
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex items-center gap-2 text-sm font-bold text-primary">
          <span className="relative overflow-hidden">
            <span className="block transition-transform duration-500 group-hover:-translate-y-full">
              Explorar categoria
            </span>
            <span className="absolute inset-0 block translate-y-full text-secondary transition-transform duration-500 group-hover:translate-y-0">
              Explorar categoria
            </span>
          </span>
          <ChevronRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:text-secondary" />
        </div>
      </div>
    </div>
  );

  const containerClasses =
    "block h-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-[2.5rem]";

  if (isInternal) {
    return (
      <Link
        to={category.href}
        data-animated-card
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
      data-animated-card
      className={containerClasses}
      aria-label={`Explorar ${category.title}`}
    >
      {Content}
    </a>
  );
}
