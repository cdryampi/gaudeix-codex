import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scraperApi } from "../api/scraper";
import { ImportScrapedNewsDTO, BulkImportDTO, RunScrapeDTO } from "../types";
import { toast } from "sonner";

// Keys
export const SCRAPER_KEYS = {
  all: ["scraper"] as const,
  sources: () => [...SCRAPER_KEYS.all, "sources"] as const,
  source: (slug: string) => [...SCRAPER_KEYS.sources(), slug] as const,
  news: () => [...SCRAPER_KEYS.all, "news"] as const,
  newsList: (filters?: Record<string, any>) =>
    [...SCRAPER_KEYS.news(), "list", filters] as const,
  stats: () => [...SCRAPER_KEYS.all, "stats"] as const,
  jobs: () => [...SCRAPER_KEYS.all, "jobs"] as const,
};

// Hooks
export function useScraperSources() {
  return useQuery({
    queryKey: SCRAPER_KEYS.sources(),
    queryFn: scraperApi.sources.getAll,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useScrapedNews(filters?: {
  source?: string;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: SCRAPER_KEYS.newsList(filters),
    queryFn: () => scraperApi.scrapedNews.getAll(filters),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useScraperStats() {
  return useQuery({
    queryKey: SCRAPER_KEYS.stats(),
    queryFn: scraperApi.scrapedNews.getStats,
  });
}

// Mutations
export function useScraperMutations() {
  const queryClient = useQueryClient();

  const importNews = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ImportScrapedNewsDTO }) =>
      scraperApi.scrapedNews.import(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCRAPER_KEYS.news() });
      queryClient.invalidateQueries({ queryKey: SCRAPER_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: SCRAPER_KEYS.sources() });
      toast.success("Noticia importada correctamente");
    },
    onError: (error: any) => {
      if (error?.response?.status === 404) {
        queryClient.invalidateQueries({ queryKey: SCRAPER_KEYS.news() });
        queryClient.invalidateQueries({ queryKey: SCRAPER_KEYS.stats() });
        queryClient.invalidateQueries({ queryKey: SCRAPER_KEYS.sources() });
        toast.error("La noticia ya no existe. Lista actualizada.");
        return;
      }
      toast.error(
        error.response?.data?.error || "Error al importar la noticia",
      );
    },
  });

  const bulkImport = useMutation({
    mutationFn: (data: BulkImportDTO) =>
      scraperApi.scrapedNews.bulkImport(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SCRAPER_KEYS.news() });
      queryClient.invalidateQueries({ queryKey: SCRAPER_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: SCRAPER_KEYS.sources() });

      const { imported, failed, skipped } = data.results;
      if (imported.length > 0)
        toast.success(`${imported.length} noticias importadas`);
      if (failed.length > 0) toast.error(`${failed.length} noticias fallaron`);
      if (skipped.length > 0)
        toast.info(`${skipped.length} noticias ya estaban importadas`);
    },
    onError: () => {
      toast.error("Error en la importación masiva");
    },
  });

  const deleteNews = useMutation({
    mutationFn: (id: number) => scraperApi.scrapedNews.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCRAPER_KEYS.news() });
      queryClient.invalidateQueries({ queryKey: SCRAPER_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: SCRAPER_KEYS.sources() });
      toast.success("Noticia eliminada");
    },
    onError: () => {
      toast.error("Error al eliminar");
    },
  });

  const runScrape = useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: RunScrapeDTO }) =>
      scraperApi.sources.runScrape(slug, data),
    // We don't invalidate here because the job starts in background.
    // The progressBar component handles polling and invalidation on completion.
  });

  const cancelJob = useMutation({
    mutationFn: (id: number) => scraperApi.jobs.cancel(id),
    onError: () => {
      toast.error("Error al cancelar el trabajo");
    },
  });

  return {
    importNews,
    bulkImport,
    deleteNews,
    runScrape,
    cancelJob,
  };
}
