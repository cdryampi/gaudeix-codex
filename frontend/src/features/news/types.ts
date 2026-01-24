export interface NewsBackendItem {
    id: number;
    slug: string;
    title: string;
    summary: string;
    body: string;
    is_published: boolean;
    published_at: string;
    image_url: string;
    featured_media?: {
        id: number;
        original_name: string;
        file: string;
        variant_thumbnail?: string;
        variant_medium?: string;
        variant_large?: string;
    };
}

export type NewsCategory =
    | "Actualidad"
    | "Cultura"
    | "Deportes"
    | "Urbanismo"
    | "Turismo"
    | "Medio ambiente"
    | "Educación"
    | "Salud";

export interface NewsItem {
    id: string;
    title: string;
    category: NewsCategory;
    imageUrl: string;
    publishedAt: string;
    slug: string;
    excerpt: string;
    body?: string;
}
