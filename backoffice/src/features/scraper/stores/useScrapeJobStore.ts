import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ScrapeJob } from "../types";
import { scraperApi } from "../api/scraper";

interface ScrapeJobState {
  activeJobId: number | null;
  job: ScrapeJob | null;
  pollingInterval: number | null;

  // Actions
  startJob: (jobId: number) => void;
  setJob: (job: ScrapeJob) => void;
  resetJob: () => void;

  // Thunks (logic)
  checkStatus: () => Promise<void>;
}

export const useScrapeJobStore = create<ScrapeJobState>()(
  persist(
    (set, get) => ({
      activeJobId: null,
      job: null,
      pollingInterval: null,

      startJob: (jobId: number) => {
        set({ activeJobId: jobId, job: null });
        // Immediate check
        get().checkStatus();
      },

      setJob: (job: ScrapeJob) => set({ job }),

      resetJob: () => set({ activeJobId: null, job: null }),

      checkStatus: async () => {
        const { activeJobId } = get();
        if (!activeJobId) return;

        try {
          const job = await scraperApi.jobs.getById(activeJobId);
          set({ job });

          if (job.status === "completed" || job.status === "failed") {
            // Stop polling if done (handled by component usually, but good to reflect state)
            // We keep activeJobId to show final status until user dismisses
          }
        } catch (error) {
          console.error("Failed to check job status", error);
        }
      },
    }),
    {
      name: "scrape-job-storage",
      partialize: (state) => ({ activeJobId: state.activeJobId }), // Only persist activeJobId
    },
  ),
);
