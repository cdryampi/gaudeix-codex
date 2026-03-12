import { apiGet } from "@/lib/api";
import type { NewsBackendItem, NewsItem, NewsCategory } from "./types";

// Map backend category names to frontend categories
function mapCategoryName(name?: string): NewsCategory {
  if (!name) return "Actualidad";
  const mapping: Record<string, NewsCategory> = {
    Actualitat: "Actualidad",
    Actualidad: "Actualidad",
    "Current Affairs": "Actualidad",
    Cultura: "Cultura",
    Culture: "Cultura",
    Esports: "Deportes",
    Deportes: "Deportes",
    Sports: "Deportes",
    Urbanisme: "Urbanismo",
    Urbanismo: "Urbanismo",
    "Urban Planning": "Urbanismo",
    Turisme: "Turismo",
    Turismo: "Turismo",
    Tourism: "Turismo",
    "Medi Ambient": "Medio ambiente",
    "Medio Ambiente": "Medio ambiente",
    Environment: "Medio ambiente",
    Educació: "Educación",
    Educación: "Educación",
    Education: "Educación",
    Salut: "Salud",
    Salud: "Salud",
    Health: "Salud",
  };
  return mapping[name] || "Actualidad";
}

export async function listNewsItems(): Promise<NewsItem[]> {
  const data = await apiGet<NewsBackendItem[]>("/news/?is_published=true");

  return data.map((item) => ({
    id: String(item.id),
    title: item.title,
    category: mapCategoryName(item.category_name),
    imageUrl:
      item.featured_media?.variant_medium ||
      item.featured_media?.file ||
      "/placeholder-news.jpg",
    publishedAt: item.published_at,
    slug: item.slug,
    excerpt: item.summary,
    body: item.body,
  }));
}

export async function getNewsItem(slug: string): Promise<NewsItem> {
  const item = await apiGet<NewsBackendItem>(`/news/${slug}/`);

  return {
    id: String(item.id),
    title: item.title,
    category: mapCategoryName(item.category_name),
    imageUrl:
      item.featured_media?.variant_large ||
      item.featured_media?.variant_medium ||
      item.featured_media?.file ||
      "/placeholder-news.jpg",
    publishedAt: item.published_at,
    slug: item.slug,
    excerpt: item.summary,
    body: item.body,
  };
}
