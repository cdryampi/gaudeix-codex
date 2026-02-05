/**
 * Scraper feature TypeScript types
 */

export type ScraperSource = {
  id: number;
  name: string;
  slug: string;
  base_url: string;
  news_path: string;
  is_active: boolean;
  last_scraped_at: string | null;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  full_news_url: string;
  news_count: number;
  pending_count: number;
};

export type ScrapedNewsStatus = "pending" | "imported" | "skipped" | "error";

export type ScrapedNews = {
  id: number;
  source: number;
  source_name: string;
  source_slug: string;
  source_url: string;
  external_id: string;
  title: string;
  summary: string;
  body?: string;
  published_at: string | null;
  featured_image_url: string;
  gallery_image_urls?: string[];
  status: ScrapedNewsStatus;
  is_imported: boolean;
  imported_news: number | null;
  imported_news_title?: string;
  import_error?: string;
  raw_metadata?: Record<string, unknown>;
  scraped_at: string;
  updated_at: string;
};

export type ScrapedNewsListItem = Omit<
  ScrapedNews,
  "body" | "gallery_image_urls" | "raw_metadata"
>;

export type ImportScrapedNewsDTO = {
  auto_translate?: boolean;
  publish?: boolean;
  category_id?: number | null;
};

export type ImportResult = {
  success: boolean;
  news_id?: number;
  news_slug?: string;
  error?: string;
};

export type BulkImportDTO = {
  ids: number[];
  auto_translate?: boolean;
  publish?: boolean;
};

export type BulkImportResult = {
  success: boolean;
  results: {
    imported: Array<{ id: number; news_id: number }>;
    failed: Array<{ id: number; error: string }>;
    skipped: number[];
  };
};

export type ScrapedNewsStats = {
  by_status: Record<ScrapedNewsStatus, number>;
  by_source: Array<{
    source__slug: string;
    source__name: string;
    total: number;
    pending: number;
  }>;
  total: number;
};

export type ScrapeJobStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelling"
  | "cancelled";

export type ScrapeJob = {
  id: number;
  source: number;
  source_name: string;
  status: ScrapeJobStatus;
  progress: number;
  max_pages: number;
  pages_scraped: number;
  news_found: number;
  news_created: number;
  news_updated: number;
  news_skipped: number;
  error_message: string;
  started_at: string;
  completed_at: string | null;
};

export type RunScrapeDTO = {
  max_pages?: number;
};
