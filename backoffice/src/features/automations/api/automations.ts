import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";

import {
  type AutomationJob,
  type AutomationJobPayload,
  type AutomationRun,
  type AutomationTemplate,
} from "../types";

export const automationsApi = {
  async listTemplates() {
    const response = await apiClient.get<AutomationTemplate[]>(
      API_ENDPOINTS.AUTOMATION_TEMPLATES.LIST,
    );
    return response.data.map((template) => ({
      ...template,
      editor_flow: template.editor_flow || null,
    }));
  },

  async listJobs() {
    const response = await apiClient.get<AutomationJob[]>(
      API_ENDPOINTS.AUTOMATIONS.LIST,
    );
    return response.data.map(normalizeJob);
  },

  async createJob(payload: AutomationJobPayload) {
    const response = await apiClient.post<AutomationJob>(
      API_ENDPOINTS.AUTOMATIONS.LIST,
      payload,
    );
    return normalizeJob(response.data);
  },

  async updateJob(id: number, payload: Partial<AutomationJobPayload>) {
    const response = await apiClient.patch<AutomationJob>(
      API_ENDPOINTS.AUTOMATIONS.DETAIL(String(id)),
      payload,
    );
    return normalizeJob(response.data);
  },

  async runNow(id: number) {
    const response = await apiClient.post<{
      task_id: string;
      queued: boolean;
      run_id?: number;
    }>(API_ENDPOINTS.AUTOMATIONS.RUN_NOW(String(id)));
    return response.data;
  },

  async listRuns(id: number) {
    const response = await apiClient.get<AutomationRun[]>(
      API_ENDPOINTS.AUTOMATIONS.RUNS(String(id)),
    );
    return response.data.map(normalizeRun);
  },
};

function normalizeJob(job: AutomationJob): AutomationJob {
  return {
    ...job,
    config: job.config || {},
    template: {
      ...job.template,
      editor_flow: job.template.editor_flow || null,
    },
    latest_run: job.latest_run ? normalizeRun(job.latest_run) : null,
  };
}

function normalizeRun(run: AutomationRun): AutomationRun {
  return {
    ...run,
    summary: run.summary || "",
    error_message: run.error_message || "",
    payload_snapshot: run.payload_snapshot || {},
    step_results: run.step_results || [],
  };
}
