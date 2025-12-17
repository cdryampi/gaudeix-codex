import { apiGet } from "@/lib/api";
import type { EventCategory, EventItem } from "@/data/mockEvents";

type ApiTag = {
  id: number;
  slug: string;
  nombre?: string;
  name?: string;
};

export type ApiEvent = {
  id: number | string;
  slug: string;
  title: string;
  summary?: string;
  description?: string;
  start_at: string;
  end_at?: string | null;
  is_published?: boolean;
  venue_name?: string;
  location_text?: string;
  is_featured?: boolean;
  is_free?: boolean;
  price_text?: string | null;
  tags?: ApiTag[];
  category_slug?: string;
  category_name?: string;
  image_url?: string;
};

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function mapCategoryFromApi(categorySlug?: string, categoryName?: string): EventCategory {
  const slug = normalizeText(categorySlug).toLowerCase();
  if (slug === "cultura") return "Cultura";
  if (slug === "infantil") return "Infantil";
  if (slug === "esports" || slug === "deportes") return "Esports";
  if (slug === "fires-i-mercats" || slug === "fires-mercats" || slug === "ferias-y-mercados") return "Fires i mercats";
  if (slug === "formacio" || slug === "formacion") return "Formació";
  if (slug === "musica") return "Música";
  if (slug === "teatre" || slug === "teatro") return "Teatre";
  if (slug === "altres" || slug === "otros") return "Altres";

  const name = normalizeText(categoryName);
  const nameLower = name.toLowerCase();
  if (nameLower === "cultura") return "Cultura";
  if (nameLower === "infantil") return "Infantil";
  if (nameLower === "esports") return "Esports";
  if (nameLower === "fires i mercats") return "Fires i mercats";
  if (nameLower.startsWith("formac")) return "Formació";
  if (nameLower.startsWith("mús") || nameLower.startsWith("mus")) return "Música";
  if (nameLower.startsWith("teatr") || nameLower === "teatre") return "Teatre";

  return "Altres";
}

function inferVenueName(locationText: string): string {
  const first = locationText.split(",")[0]?.trim();
  return first || "Ajuntament";
}

export function toEventItem(e: ApiEvent): EventItem {
  const locationText = normalizeText(e.location_text);
  const venueName = normalizeText(e.venue_name) || inferVenueName(locationText);
  const summary = normalizeText(e.summary);
  const description = normalizeText(e.description);

  const tags = (e.tags ?? [])
    .map((t) => normalizeText(t.slug) || normalizeText(t.nombre) || normalizeText(t.name))
    .filter(Boolean);

  return {
    id: String(e.id),
    title: normalizeText(e.title) || "Evento",
    category: mapCategoryFromApi(e.category_slug, e.category_name),
    imageUrl: normalizeText(e.image_url) || "/media/eventos/fira_nadal.jpg",
    startAt: normalizeText(e.start_at),
    venueName,
    locationText,
    featured: Boolean(e.is_featured),
    slug: normalizeText(e.slug) || String(e.id),
    isFree: Boolean(e.is_free),
    priceText: normalizeText(e.price_text) || undefined,
    descriptionShort: summary || description,
    tags,
  };
}

export async function listEventItems(opts?: {
  upcoming?: boolean;
  limit?: number;
  featured?: boolean;
  isPublished?: boolean;
  search?: string;
  category?: string;
  startFrom?: string;
  startTo?: string;
}): Promise<EventItem[]> {
  const params = new URLSearchParams();
  if (opts?.upcoming) params.set("upcoming", "true");
  if (opts?.limit != null) params.set("limit", String(opts.limit));
  if (opts?.featured != null) params.set("featured", String(opts.featured));
  if (opts?.isPublished != null) params.set("is_published", String(opts.isPublished));
  if (opts?.search) params.set("search", opts.search);
  if (opts?.category) params.set("category", opts.category);
  if (opts?.startFrom) params.set("start_from", opts.startFrom);
  if (opts?.startTo) params.set("start_to", opts.startTo);

  const qs = params.toString();
  const path = qs ? `/events/?${qs}` : "/events/";
  const data = await apiGet<ApiEvent[]>(path);
  return data.map(toEventItem);
}

