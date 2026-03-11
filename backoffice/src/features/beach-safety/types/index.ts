export type BeachSafetyFlag = "green" | "yellow" | "red";

export type BeachSafetyReviewStatus = "pending" | "approved" | "rejected";

export type BeachSafetyRunStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "skipped";

export type BeachSafetyRunTrigger = "schedule" | "manual";

export type UserSummary = {
  id: number;
  username: string;
  name: string;
};

export type BeachSafetyRun = {
  id: number;
  trigger: BeachSafetyRunTrigger;
  status: BeachSafetyRunStatus;
  window_key: string | null;
  started_at: string;
  finished_at: string | null;
  summary: string;
  error_message: string;
  weather_snapshot: Record<string, unknown>;
};

export type BeachSafetyProposal = {
  id: number;
  recommended_status: BeachSafetyFlag;
  review_status: BeachSafetyReviewStatus;
  reasons: string[];
  weather_snapshot: Record<string, unknown>;
  weather_source_updated_at: string | null;
  recommendation_window_start: string;
  recommendation_window_end: string;
  proposed_at: string;
  reviewed_at: string | null;
  reviewed_by: UserSummary | null;
  review_notes: string;
  source_run: number | null;
};

export type BeachSafetyStatus = {
  id?: number;
  published_status: BeachSafetyFlag;
  published_notes: string;
  published_at: string | null;
  published_by: UserSummary | null;
  latest_pending_proposal: BeachSafetyProposal | null;
  latest_run: BeachSafetyRun | null;
  fecha_creacion: string;
  fecha_modificacion: string;
};
