import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/features/categories/api";
import { FeaturedCategoryCard } from "@/features/categories/components/FeaturedCategoryCard";
import type { CategoryCardProps } from "@/features/categories/components/FeaturedCategoryCard";
import { Loader2 } from "lucide-react";
import { Category } from "../types";

export function CategoriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const categories = Array.isArray(data) ? data : data?.results || [];

  return (
    <div className="bg-white min-h-screen pt-24 pb-48">
      {/* Hero / Header Section */}
      <div className="px-6 md:px-20 py-12 mb-12">
        <span className="text-sm font-black uppercase tracking-[0.5em] text-primary mb-8 block">
          Descubre
        </span>
        <h1 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase tracking-tighter leading-[0.85] text-slate-900">
          Categorías <br />
          <span className="text-primary">del Municipio</span>
        </h1>
      </div>

      <div className="container mx-auto px-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((cat: Category) => {
              // Map API Category to Card Props
              const cardProps: CategoryCardProps = {
                id: cat.id,
                title: cat.nombre,
                href: `/categorias/${cat.slug}`,
                image:
                  cat.featured_media?.variant_medium ||
                  cat.featured_media?.file,
                icon: cat.icon,
                description: cat.descripcion,
                taxonomy: cat.taxonomy,
              };
              return <FeaturedCategoryCard key={cat.id} category={cardProps} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
