import { useQuery } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";

import { PageHero, SectionHeader } from "@/components/site/primitives";
import { MotionReveal } from "@/components/animated/MotionReveal";
import { AnimatedCardGrid } from "@/components/animated/AnimatedCardGrid";
import { getCategories } from "@/features/categories/api";
import { FeaturedCategoryCard } from "@/features/categories/components/FeaturedCategoryCard";
import type { CategoryCardProps } from "@/features/categories/components/FeaturedCategoryCard";
import { Category } from "../types";
import { useTranslation } from "@/hooks/useTranslation";

export function CategoriesPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const categories = Array.isArray(data) ? data : data?.results || [];

  return (
    <main className="min-h-screen bg-background-light page-shell-offset">
      <PageHero
        eyebrow={t("Descubre el municipio")}
        title={t("Explora Cabrera de Mar por intereses")}
        description={t(
          "Descubre el patrimonio, las rutas, la agenda, la gastronomía y todas las experiencias públicas de nuestro municipio.",
        )}
        tone="immersive"
        breadcrumbs={[
          { label: t("Inicio"), href: "/" },
          { label: t("Categorías") },
        ]}
        metrics={[
          {
            label: t("Categorías"),
            value: `${categories.length} ${t("disponibles")}`,
          },
          { label: t("Ubicación"), value: t("Maresme, Barcelona") },
          { label: t("Enfoque"), value: t("Turismo activo y cultural") },
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
                image:
                  cat.featured_media?.variant_medium ||
                  cat.featured_media?.file,
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
