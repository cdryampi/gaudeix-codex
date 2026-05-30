/**
 * CategoryDetailPage - Dynamic category landing page with template registry.
 *
 * Fetches category data and delegates rendering to the appropriate layout
 * based on category slug using the template registry with lazy loading.
 */

import { Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCategoryBySlug } from "../api";
import { getPlaces } from "@/features/places/api";
import { getEvents } from "@/features/events/api";
import { Loader2 } from "lucide-react";
import { getCategoryLayout } from "../templates/registry";

export function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  // Fetch category
  const { data: category, isLoading: loadingCategory } = useQuery({
    queryKey: ["category", slug],
    queryFn: () => getCategoryBySlug(slug!),
    enabled: !!slug,
  });

  // Fetch places for this category
  const { data: placesData, isLoading: loadingPlaces } = useQuery({
    queryKey: ["places", "category", category?.id],
    queryFn: () => getPlaces({ category: category?.id }),
    enabled: !!category?.id,
  });

  // Fetch events for this category
  const { data: eventsData, isLoading: loadingEvents } = useQuery({
    queryKey: ["events", "category", category?.id],
    queryFn: () => getEvents({ category: category?.id }),
    enabled: !!category?.id,
  });

  // Normalize data (handle both array and paginated response)
  const places = Array.isArray(placesData)
    ? placesData
    : placesData?.results || [];
  const events = Array.isArray(eventsData)
    ? eventsData
    : eventsData?.results || [];

  // Loading state while fetching category
  if (loadingCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light transition-colors duration-400">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Category not found
  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background-light transition-colors duration-400 text-text-primary">
        <h1 className="text-2xl font-bold">Categoría no encontrada</h1>
        <Link to="/categorias" className="text-primary hover:underline">
          Volver a categorías
        </Link>
      </div>
    );
  }

  // Get the appropriate layout component based on category slug
  const CategoryLayout = getCategoryLayout(category.slug);

  return (
    <Suspense fallback={<CategoryLayoutSkeleton />}>
      <CategoryLayout
        category={category}
        places={places}
        events={events}
        isLoadingPlaces={loadingPlaces}
        isLoadingEvents={loadingEvents}
      />
    </Suspense>
  );
}

/**
 * Skeleton component shown while lazy-loading the layout.
 */
function CategoryLayoutSkeleton() {
  return (
    <div className="animate-pulse min-h-screen bg-background-light transition-colors duration-400">
      {/* Hero skeleton */}
      <div className="h-[50vh] bg-surface-muted border-b border-border-soft" />
      {/* Content skeleton */}
      <div className="container mx-auto px-6 py-16">
        <div className="h-8 w-64 bg-surface-muted rounded-full mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-surface border border-border-soft rounded-3xl"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
