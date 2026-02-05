/**
 * Scraper API client
 */
import apiClient from "@/lib/api/client";
import {
  ScraperSource,
  ScrapedNews,
  ScrapedNewsListItem,
  ImportScrapedNewsDTO,
  ImportResult,
  BulkImportDTO,
  BulkImportResult,
  ScrapedNewsStats,
  ScrapeJob,
  RunScrapeDTO,
} from "../types";

const ENDPOINTS = {
  SOURCES: {
    LIST: "/scraper/sources/",
    DETAIL: (slug: string) => `/scraper/sources/${slug}/`,
    RUN: (slug: string) => `/scraper/sources/${slug}/run_scrape/`,
  },
  JOBS: {
    LIST: "/scraper/jobs/",
    DETAIL: (id: number) => `/scraper/jobs/${id}/`,
  },
  SCRAPED_NEWS: {
    LIST: "/scraper/scraped-news/",
    DETAIL: (id: number) => `/scraper/scraped-news/${id}/`,
    IMPORT: (id: number) => `/scraper/scraped-news/${id}/do_import/`,
    BULK_IMPORT: "/scraper/scraped-news/bulk_import/",
    STATS: "/scraper/scraped-news/stats/",
  },
};

export const scraperApi = {
  // Sources
  sources: {
    getAll: async () => {
      const response = await apiClient.get<ScraperSource[]>(
        ENDPOINTS.SOURCES.LIST,
      );
      return response.data;
    },

    getBySlug: async (slug: string) => {
      const response = await apiClient.get<ScraperSource>(
        ENDPOINTS.SOURCES.DETAIL(slug),
      );
      return response.data;
    },

    runScrape: async (slug: string, data: RunScrapeDTO = {}) => {
      const response = await apiClient.post<{
        success: boolean;
        job_id: number;
        message: string;
      }>(ENDPOINTS.SOURCES.RUN(slug), data);
      return response.data;
    },
  },

  // Jobs
  jobs: {
    getAll: async (params?: { source?: string }) => {
      const response = await apiClient.get<{ results: ScrapeJob[] }>(
        ENDPOINTS.JOBS.LIST,
        { params },
      );
      return response.data;
    },

    getById: async (id: number) => {
      const response = await apiClient.get<ScrapeJob>(
        ENDPOINTS.JOBS.DETAIL(id),
      );
      return response.data;
    },

    cancel: async (id: number) => {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
      }>(`${ENDPOINTS.JOBS.DETAIL(id)}cancel/`);
      return response.data;
    },
  },

  // Scraped News
  scrapedNews: {
    getAll: async (params?: {
      source?: string;
      status?: string;
      search?: string;
    }) => {
      const response = await apiClient.get<ScrapedNewsListItem[]>(
        ENDPOINTS.SCRAPED_NEWS.LIST,
        { params },
      );
      return response.data;
    },

    getById: async (id: number) => {
      const response = await apiClient.get<ScrapedNews>(
        ENDPOINTS.SCRAPED_NEWS.DETAIL(id),
      );
      return response.data;
    },

    delete: async (id: number) => {
      await apiClient.delete(ENDPOINTS.SCRAPED_NEWS.DETAIL(id));
    },

    updateStatus: async (id: number, status: string) => {
      const response = await apiClient.patch<ScrapedNews>(
        ENDPOINTS.SCRAPED_NEWS.DETAIL(id),
        { status },
      );
      return response.data;
    },

    import: async (id: number, data: ImportScrapedNewsDTO = {}) => {
      const response = await apiClient.post<ImportResult>(
        ENDPOINTS.SCRAPED_NEWS.IMPORT(id),
        data,
      );
      return response.data;
    },

    bulkImport: async (data: BulkImportDTO) => {
      const response = await apiClient.post<BulkImportResult>(
        ENDPOINTS.SCRAPED_NEWS.BULK_IMPORT,
        data,
      );
      return response.data;
    },

    getStats: async () => {
      const response = await apiClient.get<ScrapedNewsStats>(
        ENDPOINTS.SCRAPED_NEWS.STATS,
      );
      return response.data;
    },
  },
};
