import { useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Import, RefreshCw, Play, Loader2 } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ScrapedNewsTable } from "../components/ScrapedNewsTable";
import { ScrapedNewsFilters } from "../components/ScrapedNewsFilters";
import { ImportDialog } from "../components/ImportDialog";
import { StartScrapeDialog } from "../components/StartScrapeDialog";
import { ScrapeProgressBar } from "../components/ScrapeProgressBar";
import { useScrapeJobStore } from "../stores/useScrapeJobStore";
import {
  useScrapedNews,
  useScraperSources,
  useScraperMutations,
} from "../hooks/useScraper";
import {
  ScrapedNewsListItem,
  ScrapedNewsStatus,
  ImportScrapedNewsDTO,
} from "../types";

export function ScrapedNewsPage() {
  // Query state
  const { data: items = [], isLoading, refetch } = useScrapedNews();
  const { data: sources = [], refetch: refetchSources } = useScraperSources();
  const { importNews, bulkImport, deleteNews, runScrape } =
    useScraperMutations();

  // Store
  const { startJob, activeJobId, job } = useScrapeJobStore();

  // Selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Dialog states
  const [importItem, setImportItem] = useState<ScrapedNewsListItem | null>(
    null,
  );
  const [deleteItem, setDeleteItem] = useState<ScrapedNewsListItem | null>(
    null,
  );
  const [showScrapeDialog, setShowScrapeDialog] = useState(false);

  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ScrapedNewsStatus | "all">("all");
  const [source, setSource] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const filtered = useMemo(() => {
    let result = items;

    // Status filter
    if (status !== "all") {
      result = result.filter((item) => item.status === status);
    }

    // Source filter
    if (source !== "all") {
      result = result.filter((item) => item.source_slug === source);
    }

    // Search filter
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(term) ||
          item.summary?.toLowerCase().includes(term),
      );
    }

    return result;
  }, [items, search, status, source]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const handleImport = async (id: number, options: ImportScrapedNewsDTO) => {
    importNews.mutate(
      { id, data: options },
      {
        onSuccess: () => setImportItem(null),
      },
    );
  };

  const handleBulkImport = async () => {
    if (selectedIds.length === 0) return;

    bulkImport.mutate(
      { ids: selectedIds, publish: false },
      {
        onSuccess: () => setSelectedIds([]),
      },
    );
  };

  const handleStartScrape = async (sourceSlug: string, maxPages: number) => {
    runScrape.mutate(
      { slug: sourceSlug, data: { max_pages: maxPages } },
      {
        onSuccess: (data) => {
          if (data.success) {
            startJob(data.job_id);
          }
        },
      },
    );
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    deleteNews.mutate(deleteItem.id, {
      onSuccess: () => setDeleteItem(null),
    });
  };

  const pendingCount = items.filter((i) => i.status === "pending").length;

  const isJobProcessing = Boolean(
    activeJobId &&
    (!job || job.status === "pending" || job.status === "running"),
  );

  return (
    <PageContainer>
      <PageHeader
        title="Noticias Scrapeadas"
        description={`${items.length} noticias scrapeadas, ${pendingCount} pendientes de importar`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowScrapeDialog(true)}
              disabled={isLoading || isJobProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isJobProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Scrapear Ahora
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetch();
                refetchSources();
              }}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>
            {selectedIds.length > 0 && (
              <Button
                size="sm"
                onClick={handleBulkImport}
                disabled={bulkImport.isPending}
              >
                <Import className="mr-2 h-4 w-4" />
                Importar ({selectedIds.length})
              </Button>
            )}
          </div>
        }
      />

      <ScrapeProgressBar />

      <ScrapedNewsFilters
        search={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        status={status}
        onStatus={(v) => {
          setStatus(v);
          setPage(1);
        }}
        source={source}
        onSource={(v) => {
          setSource(v);
          setPage(1);
        }}
        sources={sources}
        pageSize={pageSize}
        onPageSize={(v) => {
          setPageSize(v);
          setPage(1);
        }}
      />

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Cargando noticias scrapeadas...
            </div>
          ) : (
            <ScrapedNewsTable
              items={paginated}
              selectedIds={selectedIds}
              onSelect={setSelectedIds}
              onView={(item) => window.open(item.source_url, "_blank")}
              onImport={(item) => setImportItem(item)}
              onDelete={(item) => setDeleteItem(item)}
            />
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <span>
          Página {page} de {totalPages} • {filtered.length} resultados
        </span>
        <div className="w-full md:w-auto">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Import Dialog */}
      <ImportDialog
        open={importItem !== null}
        onOpenChange={(open) => !open && setImportItem(null)}
        item={importItem}
        onImport={handleImport}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteItem !== null}
        onOpenChange={(open) => !open && setDeleteItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar noticia scrapeada?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la noticia{" "}
              <strong>"{deleteItem?.title}"</strong> de la lista de noticias
              scrapeadas. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Start Scrape Dialog */}
      <StartScrapeDialog
        open={showScrapeDialog}
        onOpenChange={setShowScrapeDialog}
        sources={sources}
        onStart={handleStartScrape}
      />
    </PageContainer>
  );
}
