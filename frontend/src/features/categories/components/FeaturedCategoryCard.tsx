import { useState } from "react";

import type { FeaturedCategory } from "@/features/categories/categoriesData";
import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";
import { AnimatedCard } from "@/components/animated/AnimatedCard";

export function FeaturedCategoryCard({ category }: { category: FeaturedCategory }) {
  const [loaded, setLoaded] = useState(false);
  const Icon = category.Icon;

  return (
    <AnimatedCard
      as="a"
      href={category.href}
      className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        {!loaded ? (
          <div className="absolute inset-0">
            <SkeletonBlock className="h-full w-full" rounded="2xl" />
          </div>
        ) : null}

        <img
          src={category.image_src}
          alt={category.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onLoad={() => setLoaded(true)}
        />

        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/65 via-black/30 to-transparent p-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20 backdrop-blur">
              <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold text-white drop-shadow">{category.title}</span>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
