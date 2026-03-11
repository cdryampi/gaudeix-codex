import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/config/constants";

import {
  BeachSafetyProposal,
  BeachSafetyRun,
  BeachSafetyStatus,
} from "../types";

export const beachSafetyApi = {
  async getStatus() {
    const response = await apiClient.get<BeachSafetyStatus>(
      API_ENDPOINTS.BEACH_SAFETY_STATUS.CURRENT,
    );
    return normalizeStatus(response.data);
  },

  async listProposals() {
    const response = await apiClient.get<BeachSafetyProposal[]>(
      API_ENDPOINTS.BEACH_SAFETY_PROPOSALS.LIST,
    );
    return response.data.map(normalizeProposal);
  },

  async listRuns() {
    const response = await apiClient.get<BeachSafetyRun[]>(
      API_ENDPOINTS.BEACH_SAFETY_RUNS.LIST,
    );
    return response.data.map(normalizeRun);
  },

  async runCheck() {
    const response = await apiClient.post<{
      task_id: string;
      queued: boolean;
      run_id?: number;
    }>(API_ENDPOINTS.BEACH_SAFETY_STATUS.RUN_CHECK);
    return response.data;
  },

  async approveProposal(id: number, review_notes = "") {
    const response = await apiClient.post<BeachSafetyProposal>(
      API_ENDPOINTS.BEACH_SAFETY_PROPOSALS.APPROVE(String(id)),
      { review_notes },
    );
    return normalizeProposal(response.data);
  },

  async rejectProposal(id: number, review_notes = "") {
    const response = await apiClient.post<BeachSafetyProposal>(
      API_ENDPOINTS.BEACH_SAFETY_PROPOSALS.REJECT(String(id)),
      { review_notes },
    );
    return normalizeProposal(response.data);
  },
};

function normalizeStatus(data: BeachSafetyStatus): BeachSafetyStatus {
  return {
    ...data,
    published_notes: data.published_notes || "",
    latest_pending_proposal: data.latest_pending_proposal
      ? normalizeProposal(data.latest_pending_proposal)
      : null,
    latest_run: data.latest_run ? normalizeRun(data.latest_run) : null,
  };
}

function normalizeProposal(data: BeachSafetyProposal): BeachSafetyProposal {
  return {
    ...data,
    reasons: data.reasons || [],
    review_notes: data.review_notes || "",
    weather_snapshot: data.weather_snapshot || {},
  };
}

function normalizeRun(data: BeachSafetyRun): BeachSafetyRun {
  return {
    ...data,
    summary: data.summary || "",
    error_message: data.error_message || "",
    weather_snapshot: data.weather_snapshot || {},
  };
}
