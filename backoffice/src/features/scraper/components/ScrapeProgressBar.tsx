import { useEffect } from "react";
import { Progress, Button, Card, Badge } from "flowbite-react";
import {
  X,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileText,
  Newspaper,
  Square,
} from "lucide-react";
import { useScrapeJobStore } from "../stores/useScrapeJobStore";
import { useQueryClient } from "@tanstack/react-query";
import { SCRAPER_KEYS, useScraperMutations } from "../hooks/useScraper";

export function ScrapeProgressBar() {
  const { activeJobId, job, checkStatus, resetJob } = useScrapeJobStore();
  const queryClient = useQueryClient();
  const { cancelJob } = useScraperMutations();

  const jobStatus = job?.status;

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (
      activeJobId &&
      (!jobStatus ||
        (jobStatus !== "completed" &&
          jobStatus !== "failed" &&
          jobStatus !== "cancelled"))
    ) {
      checkStatus(); // Initial check
      intervalId = setInterval(() => {
        checkStatus();
      }, 2000); // Poll every 2s
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeJobId, jobStatus, checkStatus]);

  // Refresh scraped news list when job completes
  useEffect(() => {
    if (job?.status === "completed") {
      // Invalidate both generic news list and stats
      queryClient.invalidateQueries({ queryKey: SCRAPER_KEYS.news() });
      queryClient.invalidateQueries({ queryKey: SCRAPER_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: SCRAPER_KEYS.sources() });
    }
  }, [job?.status, queryClient]);

  if (!activeJobId || !job) return null;

  const isCompleted = job.status === "completed";
  const isFailed = job.status === "failed";
  const isCancelled = job.status === "cancelled";
  const isCancelling = job.status === "cancelling";
  const isRunning = job.status === "running" || job.status === "pending";

  const handleCancel = () => {
    if (activeJobId) {
      cancelJob.mutate(activeJobId);
    }
  };

  return (
    <Card className="mb-6 border-blue-100 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-900/10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isRunning && (
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            )}
            {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
            {isFailed && <AlertCircle className="h-5 w-5 text-red-600" />}
            {(isCancelled || isCancelling) && (
              <X className="h-5 w-5 text-orange-600" />
            )}

            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white">
                Importando de {job.source_name}
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isCancelling
                  ? "Cancelando..."
                  : isCancelled
                    ? "Cancelado por el usuario"
                    : isRunning
                      ? "Procesando páginas..."
                      : isCompleted
                        ? "Proceso finalizado"
                        : "Error en el proceso"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCompleted && (
              <Badge color="green" size="sm">
                Completado
              </Badge>
            )}
            {isFailed && (
              <Badge color="failure" size="sm">
                Error
              </Badge>
            )}
            {isCancelled && (
              <Badge color="warning" size="sm">
                Cancelado
              </Badge>
            )}

            {isRunning && !isCancelling && (
              <Button
                color="failure"
                size="xs"
                onClick={handleCancel}
                disabled={cancelJob.isPending}
                title="Detener proceso"
              >
                <Square className="mr-1 h-3 w-3 fill-current" />
                Detener
              </Button>
            )}

            <Button color="gray" size="xs" onClick={resetJob}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Progreso general</span>
            <span>{job.progress}%</span>
          </div>
          <Progress
            progress={job.progress}
            color={
              isFailed
                ? "red"
                : isCancelled
                  ? "yellow"
                  : isCompleted
                    ? "green"
                    : "blue"
            }
            size="lg"
          />
        </div>

        {job.error_message && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {job.error_message}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800">
            <div className="rounded-full bg-blue-100 p-1.5 dark:bg-blue-900">
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Páginas</p>
              <p className="font-semibold">{job.pages_scraped}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800">
            <div className="rounded-full bg-purple-100 p-1.5 dark:bg-purple-900">
              <Newspaper className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Encontradas</p>
              <p className="font-semibold">{job.news_found}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800">
            <div className="rounded-full bg-green-100 p-1.5 dark:bg-green-900">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Creadas</p>
              <p className="font-semibold text-green-600">{job.news_created}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800">
            <div className="rounded-full bg-yellow-100 p-1.5 dark:bg-yellow-900">
              <RefreshCw className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Actualizadas</p>
              <p className="font-semibold text-yellow-600">
                {job.news_updated}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
