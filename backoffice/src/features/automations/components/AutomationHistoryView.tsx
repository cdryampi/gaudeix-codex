import { useEffect, useState } from "react";
import { CircleAlert, CirclePlay, Clock3, Copy, GitBranch } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type {
  AutomationEditorNode,
  AutomationJob,
  AutomationRun,
  AutomationRunStepResult,
  AutomationTemplate,
} from "../types";
import { AutomationNodeCard } from "./AutomationNodeCard";

type AutomationHistoryViewProps = {
  template: AutomationTemplate;
  job: AutomationJob | null;
  runs: AutomationRun[];
};

export function AutomationHistoryView({
  template,
  job,
  runs,
}: AutomationHistoryViewProps) {
  const [selectedRunId, setSelectedRunId] = useState<number | null>(
    runs[0]?.id ?? null,
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    template.editor_flow?.node_order[0] ?? "trigger",
  );

  useEffect(() => {
    setSelectedRunId(runs[0]?.id ?? null);
  }, [runs]);

  useEffect(() => {
    setSelectedNodeId(template.editor_flow?.node_order[0] ?? "trigger");
  }, [template.editor_flow]);

  const selectedRun =
    runs.find((run) => run.id === selectedRunId) ?? runs[0] ?? null;
  const selectedStep = selectedRun?.step_results.find(
    (step) => step.node_id === selectedNodeId,
  );
  const flow = template.editor_flow;

  if (!job) {
    return (
      <Card className="rounded-[32px] border border-dashed border-slate-200">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Activa esta automatizacion para empezar a registrar ejecuciones.
        </CardContent>
      </Card>
    );
  }

  if (!flow) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Esta automatizacion no tiene vista visual de historial.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-[32px] border border-slate-200 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.28)]">
      <CardContent className="p-0">
        <div className="flex min-h-[820px] flex-col xl:flex-row">
          <aside className="w-full border-b border-slate-200 bg-white xl:w-[320px] xl:border-b-0 xl:border-r">
            <div className="border-b border-slate-100 px-5 py-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
                Execution history
              </p>
              <h3 className="mt-1 text-xl font-semibold text-foreground">
                Historial de runs
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Reproduce el flujo y revisa por donde paso cada ejecucion.
              </p>
            </div>

            <div className="max-h-[340px] overflow-y-auto xl:max-h-[760px]">
              {runs.length > 0 ? (
                runs.map((run) => (
                  <button
                    key={run.id}
                    type="button"
                    onClick={() => setSelectedRunId(run.id)}
                    className={cn(
                      "w-full border-b border-slate-100 px-5 py-4 text-left transition-colors hover:bg-slate-50",
                      selectedRun?.id === run.id &&
                        "border-l-4 border-l-primary bg-primary/[0.04] pl-4",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <RunStatusDot status={run.status} />
                          <p className="text-sm font-medium text-foreground">
                            Run #{run.id}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {run.summary || "Sin resumen"}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(run.started_at)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge
                        variant="outline"
                        className="rounded-full capitalize"
                      >
                        {run.trigger}
                      </Badge>
                      <span>•</span>
                      <span>{renderRunStatusLabel(run.status)}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-5 text-sm text-muted-foreground">
                  No hay ejecuciones todavia. Lanza una prueba para ver el
                  playback.
                </div>
              )}
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.25)_1px,transparent_0)] bg-[length:22px_22px] px-8 py-8">
              {selectedRun ? (
                <>
                  <div className="mb-6 flex flex-wrap items-center gap-3">
                    <Badge
                      className={cn(
                        "rounded-full px-3 py-1",
                        selectedRun.status === "succeeded"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : selectedRun.status === "skipped"
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                            : "bg-rose-100 text-rose-700 hover:bg-rose-100",
                      )}
                    >
                      {renderRunStatusLabel(selectedRun.status)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {selectedRun.summary || "Sin resumen"}
                    </span>
                  </div>

                  <div className="relative min-h-[420px] min-w-[980px]">
                    <HistoryConnections
                      hasCondition={flow.nodes.some(
                        (node) => node.node_kind === "condition",
                      )}
                    />
                    {buildHistoryLayout(
                      flow.nodes,
                      selectedRun.step_results,
                    ).map(({ node, className, playback }) => (
                      <AutomationNodeCard
                        key={node.id}
                        node={node}
                        playback={playback}
                        selected={selectedNodeId === node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={className}
                      />
                    ))}

                    <div className="absolute left-[440px] top-[410px] grid w-[520px] gap-4 md:grid-cols-2 xl:w-[620px] xl:grid-cols-3">
                      {flow.result_branches.map((branch) => {
                        const playback =
                          selectedRun.step_results.find(
                            (step) => step.node_id === branch.id,
                          ) ?? null;
                        return (
                          <button
                            key={branch.id}
                            type="button"
                            onClick={() => setSelectedNodeId(branch.id)}
                            className={cn(
                              "rounded-[24px] border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                              branch.tone === "success"
                                ? "border-emerald-200"
                                : branch.tone === "warning"
                                  ? "border-amber-200"
                                  : "border-rose-200",
                              selectedNodeId === branch.id &&
                                "border-primary ring-2 ring-primary/20",
                            )}
                          >
                            <span className="mb-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                              {branch.label}
                            </span>
                            <p className="text-sm font-semibold text-foreground">
                              {branch.title}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {playback?.detail || branch.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="border-t border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Inspector del paso
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Resumen del nodo seleccionado y snapshot del run.
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <Copy className="h-4 w-4" />
                  Copiar JSON
                </button>
              </div>

              <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="space-y-4 border-b border-slate-100 p-6 xl:border-b-0 xl:border-r">
                  <div className="flex items-center gap-2">
                    {selectedStep?.node_kind === "trigger" ? (
                      <Clock3 className="h-4 w-4 text-emerald-600" />
                    ) : selectedStep?.node_kind === "condition" ? (
                      <GitBranch className="h-4 w-4 text-orange-600" />
                    ) : selectedStep?.node_kind === "action" ? (
                      <CirclePlay className="h-4 w-4 text-violet-600" />
                    ) : (
                      <CircleAlert className="h-4 w-4 text-slate-600" />
                    )}
                    <p className="text-sm font-medium text-foreground">
                      {selectedStep?.node_title || "Sin paso seleccionado"}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedStep?.detail ||
                      "Selecciona un nodo del playback para ver detalles."}
                  </p>
                  {selectedRun?.error_message ? (
                    <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {selectedRun.error_message}
                    </div>
                  ) : null}
                </div>

                <div className="max-h-[280px] overflow-auto bg-slate-950 p-6 text-[12px] text-slate-100">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(
                      selectedRun?.payload_snapshot || {},
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryConnections({ hasCondition }: { hasCondition: boolean }) {
  return (
    <svg className="absolute inset-0 h-full w-full overflow-visible">
      <path
        d={
          hasCondition
            ? "M 360 232 C 420 232, 450 232, 510 232"
            : "M 360 232 C 470 232, 470 232, 580 232"
        }
        fill="none"
        stroke="#94a3b8"
        strokeWidth="3"
      />
      {hasCondition ? (
        <>
          <path
            d="M 790 232 C 850 232, 880 232, 940 232"
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeDasharray="8 8"
          />
          <path
            d="M 930 248 C 970 248, 980 350, 1020 410"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2.5"
            strokeDasharray="4 6"
          />
        </>
      ) : (
        <path
          d="M 770 248 C 810 248, 820 340, 860 410"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="2.5"
          strokeDasharray="4 6"
        />
      )}
    </svg>
  );
}

function buildHistoryLayout(
  nodes: AutomationEditorNode[],
  steps: AutomationRunStepResult[],
) {
  const stepMap = new Map(steps.map((step) => [step.node_id, step]));
  const hasCondition = nodes.some((node) => node.node_kind === "condition");
  const trigger = nodes.find((node) => node.node_kind === "trigger");
  const condition = nodes.find((node) => node.node_kind === "condition");
  const action = nodes.find((node) => node.node_kind === "action");
  const result: {
    node: AutomationEditorNode;
    className: string;
    playback: AutomationRunStepResult | null;
  }[] = [];

  if (trigger) {
    result.push({
      node: trigger,
      className: "absolute left-[80px] top-[140px]",
      playback: stepMap.get(trigger.id) ?? null,
    });
  }
  if (condition) {
    result.push({
      node: condition,
      className: "absolute left-[510px] top-[140px]",
      playback: stepMap.get(condition.id) ?? null,
    });
  }
  if (action) {
    result.push({
      node: action,
      className: cn(
        "absolute top-[140px]",
        hasCondition ? "left-[940px]" : "left-[580px]",
      ),
      playback: stepMap.get(action.id) ?? null,
    });
  }

  return result;
}

function RunStatusDot({ status }: { status: AutomationRun["status"] }) {
  return (
    <span
      className={cn(
        "h-2.5 w-2.5 rounded-full",
        status === "succeeded"
          ? "bg-emerald-500"
          : status === "skipped"
            ? "bg-amber-500"
            : "bg-rose-500",
      )}
    />
  );
}

function renderRunStatusLabel(status: AutomationRun["status"]) {
  if (status === "succeeded") return "Correcta";
  if (status === "skipped") return "Sin cambios";
  if (status === "failed") return "Fallida";
  if (status === "running") return "En curso";
  return "Pendiente";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
