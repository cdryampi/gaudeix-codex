export type AutomationJobStatus = "active" | "paused";

export type AutomationRunStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "skipped";

export type AutomationRunTrigger = "schedule" | "manual" | "retry";

export type AutomationFieldType = "boolean" | "string" | "integer";
export type AutomationEditorNodeKind =
  | "trigger"
  | "condition"
  | "action"
  | "result";
export type AutomationEditorBranchTone = "success" | "warning" | "error";

export type AutomationConfigField = {
  key: string;
  label: string;
  field_type: AutomationFieldType;
  help_text: string;
  required: boolean;
  default: boolean | number | string | null;
  min_value: number | null;
  max_value: number | null;
};

export type AutomationEditorNode = {
  id: string;
  node_kind: AutomationEditorNodeKind;
  node_title: string;
  node_description: string;
  chip_label: string;
  editable_fields: string[];
};

export type AutomationEditorBranch = {
  id: string;
  label: string;
  title: string;
  description: string;
  tone: AutomationEditorBranchTone;
  terminal_statuses: AutomationRunStatus[];
};

export type AutomationEditorFlow = {
  node_order: string[];
  nodes: AutomationEditorNode[];
  result_branches: AutomationEditorBranch[];
};

export type AutomationTemplate = {
  slug: string;
  name: string;
  description: string;
  category: string;
  default_interval_hours: number;
  supports_season_window: boolean;
  config_fields: AutomationConfigField[];
  editor_flow: AutomationEditorFlow | null;
};

export type AutomationRunStepResult = {
  node_id: string;
  node_title: string;
  node_kind: AutomationEditorNodeKind;
  status: "completed" | "failed" | "skipped" | "inactive";
  detail: string;
};

export type AutomationRun = {
  id: number;
  automation: number;
  trigger: AutomationRunTrigger;
  status: AutomationRunStatus;
  started_at: string;
  finished_at: string | null;
  summary: string;
  error_message: string;
  payload_snapshot: Record<string, unknown>;
  step_results: AutomationRunStepResult[];
  window_key: string | null;
};

export type AutomationJob = {
  id: number;
  template_slug: string;
  template: AutomationTemplate;
  name: string;
  status: AutomationJobStatus;
  interval_hours: number;
  season_start_month: number | null;
  season_end_month: number | null;
  config: Record<string, boolean | number | string>;
  last_run_at: string | null;
  next_run_at: string | null;
  last_run_status: AutomationRunStatus | "";
  latest_run: AutomationRun | null;
  fecha_creacion: string;
  fecha_modificacion: string;
};

export type AutomationJobPayload = {
  template_slug: string;
  name: string;
  status: AutomationJobStatus;
  interval_hours: number;
  season_start_month: number | null;
  season_end_month: number | null;
  config: Record<string, boolean | number | string>;
};
