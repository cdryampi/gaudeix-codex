import { apiGet } from "@/lib/api";
import type { NewsBackendItem, NewsItem, NewsCategory } from "./types";
import { news as mockNews } from "@/data/mockNews";

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
  try {
    const data = await apiGet<NewsBackendItem[]>("/news/?is_published=true");

    return data.map((item) => ({
      id: String(item.id),
      title: item.title,
      category: mapCategoryName(item.category_name),
      imageUrl: item.image_url || "/placeholder-news.jpg",
      publishedAt: item.published_at,
      slug: item.slug,
      excerpt: item.summary,
      body: item.body,
    }));
  } catch (err) {
    console.warn("Using mock news data due to API error:", err);
    return mockNews;
  }
}

export async function getNewsItem(slug: string): Promise<NewsItem | null> {
  try {
    const data = await apiGet<NewsBackendItem>(`/news/?search=${slug}`);
    // Search returns a list, find exact match or take first
    const results = (data as any).results || data; // handle pagination vs list
    if (Array.isArray(results)) {
      const match = results.find((n: any) => n.slug === slug);
      if (match) {
        return {
          id: String(match.id),
          title: match.title,
          category: mapCategoryName(match.category_name),
          imageUrl: match.image_url || "/placeholder-news.jpg",
          publishedAt: match.published_at,
          slug: match.slug,
          excerpt: match.summary,
          body: match.body,
        };
      }
    }
    return null;
  } catch (err) {
    // Fallback mock
    return mockNews.find((n) => n.slug === slug) || null;
  }
}
