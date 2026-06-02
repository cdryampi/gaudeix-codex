import { useMemo, useState, type ReactNode } from "react";
import {
  CirclePlay,
  Maximize2,
  PauseCircle,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type {
  AutomationEditorBranch,
  AutomationEditorNode,
  AutomationJob,
  AutomationRunStepResult,
  AutomationTemplate,
} from "../types";
import { AutomationNodeCard } from "./AutomationNodeCard";

type AutomationEditorCanvasProps = {
  template: AutomationTemplate;
  job: AutomationJob | null;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  onRunNow: () => void;
  onToggleStatus: () => void;
  running: boolean;
};

type PositionedNode = {
  node: AutomationEditorNode;
  className: string;
  playback: AutomationRunStepResult | null;
};

export function AutomationEditorCanvas({
  template,
  job,
  selectedNodeId,
  onSelectNode,
  onRunNow,
  onToggleStatus,
  running,
}: AutomationEditorCanvasProps) {
  const [zoom, setZoom] = useState(100);
  const flow = template.editor_flow;
  const latestRun = job?.latest_run ?? null;
  const stepMap = useMemo(
    () =>
      new Map(
        (latestRun?.step_results ?? []).map((step) => [step.node_id, step]),
      ),
    [latestRun],
  );

  if (!flow) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Esta automatizacion no tiene definicion visual disponible.
        </CardContent>
      </Card>
    );
  }

  const positionedNodes = buildNodeLayout(flow.nodes, stepMap);

  return (
    <Card className="overflow-hidden rounded-[32px] border border-slate-200 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.28)]">
      <CardContent className="space-y-5 p-0">
        <div className="flex flex-col gap-4 border-b border-slate-100 bg-white px-6 py-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">
                Builder visual guiado
              </Badge>
              {job ? (
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full",
                    job.status === "active"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700",
                  )}
                >
                  {job.status === "active" ? "Activa" : "Pausada"}
                </Badge>
              ) : null}
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {job?.name || template.name}
              </h2>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                {template.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {job ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onRunNow}
                  disabled={running}
                  className="rounded-full"
                >
                  <CirclePlay className="mr-2 h-4 w-4" />
                  {running ? "Probando..." : "Test / Run now"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onToggleStatus}
                  className="rounded-full"
                >
                  <PauseCircle className="mr-2 h-4 w-4" />
                  {job.status === "active" ? "Pausar" : "Activar"}
                </Button>
              </>
            ) : (
              <Badge variant="secondary" className="rounded-full px-3 py-2">
                Disponible para activar
              </Badge>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-b-[32px] bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.25)_1px,transparent_0)] bg-[length:22px_22px]">
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5">
            <div className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 shadow-sm backdrop-blur">
              <p className="text-sm font-medium text-slate-700">
                Trigger {"->"}{" "}
                {flow.nodes.map((node) => node.node_title).join(" -> ")}
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 p-1 shadow-sm backdrop-blur">
              <ToolbarButton
                icon={<ZoomOut className="h-4 w-4" />}
                onClick={() => setZoom((current) => Math.max(80, current - 10))}
              />
              <span className="w-12 text-center text-sm font-medium text-slate-600">
                {zoom}%
              </span>
              <ToolbarButton
                icon={<ZoomIn className="h-4 w-4" />}
                onClick={() =>
                  setZoom((current) => Math.min(130, current + 10))
                }
              />
              <div className="mx-1 h-6 w-px bg-slate-200" />
              <ToolbarButton
                icon={<Maximize2 className="h-4 w-4" />}
                onClick={() => setZoom(100)}
              />
            </div>
          </div>

          <div className="min-h-[760px] overflow-x-auto px-8 pb-16 pt-24">
            <div
              className="relative mx-auto min-h-[620px] min-w-[980px] origin-top transition-transform duration-200"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <EditorConnections
                hasCondition={flow.nodes.some(
                  (node) => node.node_kind === "condition",
                )}
              />

              {positionedNodes.map(({ node, className, playback }) => (
                <AutomationNodeCard
                  key={node.id}
                  node={node}
                  playback={playback}
                  selected={selectedNodeId === node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={className}
                />
              ))}

              <ResultBranchGrid
                branches={flow.result_branches}
                stepMap={stepMap}
                selectedNodeId={selectedNodeId}
                onSelectNode={onSelectNode}
              />

              {!job ? (
                <div className="absolute left-[60px] top-[34px] rounded-full border border-dashed border-primary/30 bg-white/90 px-4 py-2 text-sm text-muted-foreground shadow-sm">
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Selecciona un nodo y activa este flujo guiado.
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultBranchGrid({
  branches,
  stepMap,
  selectedNodeId,
  onSelectNode,
}: {
  branches: AutomationEditorBranch[];
  stepMap: Map<string, AutomationRunStepResult>;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
}) {
  return (
    <div className="absolute left-[440px] top-[410px] grid w-[520px] gap-4 md:grid-cols-2 xl:w-[620px] xl:grid-cols-3">
      {branches.map((branch) => {
        const playback = stepMap.get(branch.id) ?? null;
        return (
          <button
            key={branch.id}
            type="button"
            onClick={() => onSelectNode(branch.id)}
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
            <span
              className={cn(
                "mb-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                branch.tone === "success"
                  ? "bg-emerald-100 text-emerald-700"
                  : branch.tone === "warning"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700",
              )}
            >
              {branch.label}
            </span>
            <p className="text-sm font-semibold text-foreground">
              {branch.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {playback?.detail || branch.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function EditorConnections({ hasCondition }: { hasCondition: boolean }) {
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
            stroke="#6366f1"
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

function ToolbarButton({
  icon,
  onClick,
}: {
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary"
    >
      {icon}
    </button>
  );
}

function buildNodeLayout(
  nodes: AutomationEditorNode[],
  stepMap: Map<string, AutomationRunStepResult>,
): PositionedNode[] {
  const hasCondition = nodes.some((node) => node.node_kind === "condition");
  const trigger = nodes.find((node) => node.node_kind === "trigger");
  const condition = nodes.find((node) => node.node_kind === "condition");
  const action = nodes.find((node) => node.node_kind === "action");
  const result: PositionedNode[] = [];

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
