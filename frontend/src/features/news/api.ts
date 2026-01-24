import { apiGet } from "@/lib/api";
import type { NewsBackendItem, NewsItem } from "./types";
import { news as mockNews } from "@/data/mockNews";

export async function listNewsItems(): Promise<NewsItem[]> {
    try {
        const data = await apiGet<NewsBackendItem[]>("/news/?is_published=true");

        return data.map((item) => ({
            id: String(item.id),
            title: item.title,
            // Default category for now since backend doesn't support it yet
            category: "Actualidad",
            imageUrl: item.image_url || "/placeholder-news.jpg",
            publishedAt: item.published_at,
            slug: item.slug,
            excerpt: item.summary,
            body: item.body
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
        // ideally backend should support lookup by slug.
        // But since we use search filter in ViewSet, it returns list.
        // Wait, the ViewSet uses `search` query param.
        // Let's filter client side or use a direct ID lookup if we had it.
        // Actually, ViewSet usually supports lookup by PK. But we have slugs.
        // Standard ModelViewSet supports lookup_field = 'slug' if configured.
        // Let's assume we filter.

        // Better strategy: Use the list endpoint with search and filter client side for safety, 
        // or assume the search is good enough.

        // Actually, let's try to get by ID if we can... but we only have slug in link.
        // Let's use the list endpoint which returns matches.
        const results = (data as any).results || data; // handle pagination vs list
        if (Array.isArray(results)) {
            const match = results.find((n: any) => n.slug === slug);
            if (match) {
                return {
                    id: String(match.id),
                    title: match.title,
                    category: "Actualidad",
                    imageUrl: match.image_url || "/placeholder-news.jpg",
                    publishedAt: match.published_at,
                    slug: match.slug,
                    excerpt: match.summary,
                    body: match.body
                };
            }
        }
        return null;
    } catch (err) {
        // Fallback mock
        return mockNews.find(n => n.slug === slug) || null;
    }
}
