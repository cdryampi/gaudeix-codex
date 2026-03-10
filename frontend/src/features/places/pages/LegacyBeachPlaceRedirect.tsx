import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { getPlaces } from "../api";
import { PlaceDetailPage } from "./PlaceDetailPage";

export function LegacyBeachPlaceRedirect() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: isBeachSlug, isLoading } = useQuery({
    queryKey: ["legacy-beach-redirect", slug],
    queryFn: async () => {
      if (!slug) return false;
      const response = await getPlaces({ category: "beaches", is_published: true, limit: 200 });
      const beaches = Array.isArray(response) ? response : response.results || [];
      return beaches.some((place) => place.slug === slug);
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (isBeachSlug && slug) {
      navigate(`/playas/${slug}`, { replace: true });
    }
  }, [isBeachSlug, navigate, slug]);

  if (isLoading) {
    return <div className="page-shell-offset" />;
  }

  return <PlaceDetailPage />;
}
