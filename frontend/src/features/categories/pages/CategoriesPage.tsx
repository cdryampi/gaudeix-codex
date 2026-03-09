import { useQuery } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";

import { PageHero, SectionHeader } from "@/components/site/primitives";
import { MotionReveal } from "@/components/animated/MotionReveal";
import { AnimatedCardGrid } from "@/components/animated/AnimatedCardGrid";
import { getCategories } from "@/features/categories/api";
import { FeaturedCategoryCard } from "@/features/categories/components/FeaturedCategoryCard";
import type { CategoryCardProps } from "@/features/categories/components/FeaturedCategoryCard";
import { Category } from "../types";

export function CategoriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const categories = Array.isArray(data) ? data : data?.results || [];

  return (
    <main className="min-h-screen bg-background-light page-shell-offset">
      <PageHero
        eyebrow="Descubre el municipio"
        title="Un catalogo mas expresivo para explorar Cabrera de Mar por intereses"
        description="Patrimonio, rutas, agenda, gastronomia y otras experiencias publicas del municipio, ahora con un lenguaje mas visual y contemporaneo."
        tone="immersive"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Categorias" },
        ]}
        metrics={[
          { label: "Categorias", value: `${categories.length} accesos` },
          { label: "Enfoque", value: "Turismo y utilidad publica" },
          { label: "Estilo", value: "Mosaico mediterraneo" },
        ]}
      />

      <div className="page-container space-y-10 py-10">
        <MotionReveal>
          <SectionHeader
            eyebrow="Explora por temas"
            title="Recorridos, lugares, cultura, gastronomia y mas"
            description="Una entrada comun para descubrir el municipio sin perder el tono institucional ni la claridad de navegacion."
            action={
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/12 bg-white/80 px-4 py-2 text-sm font-semibold text-primary">
                <Sparkles className="h-4 w-4" />
                Coleccion renovada
              </div>
            }
          />
        </MotionReveal>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <AnimatedCardGrid className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-10">
            {categories.map((cat: Category) => {
              const cardProps: CategoryCardProps = {
                id: cat.id,
                title: cat.nombre,
                href: `/categorias/${cat.slug}`,
                image: cat.featured_media?.variant_medium || cat.featured_media?.file,
                icon: cat.icon,
                description: cat.descripcion,
                taxonomy: cat.taxonomy,
              };
              return <FeaturedCategoryCard key={cat.id} category={cardProps} />;
            })}
          </AnimatedCardGrid>
        )}
      </div>
    </main>
  );
}
