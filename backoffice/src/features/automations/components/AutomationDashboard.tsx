import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  CirclePlay,
  PauseCircle,
  Plus,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { AutomationJob, AutomationTemplate } from "../types";

type AutomationEntry = {
  template: AutomationTemplate;
  job: AutomationJob | null;
};

type AutomationDashboardProps = {
  entries: AutomationEntry[];
  selectedTemplateSlug: string;
  canCreateFlow: boolean;
  onSelect: (entry: AutomationEntry) => void;
  onCreateFlow: () => void;
};

export function AutomationDashboard({
  entries,
  selectedTemplateSlug,
  canCreateFlow,
  onSelect,
  onCreateFlow,
}: AutomationDashboardProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/70">
            Automation dashboard
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Flujos listos para operar
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Activa, pausa y entiende cada automatizacion desde una vista de
            bloques visuales y no desde un formulario tecnico.
          </p>
        </div>

        <Button
          type="button"
          onClick={onCreateFlow}
          disabled={!canCreateFlow}
          className="rounded-full px-5 shadow-[0_16px_32px_-18px_rgba(99,102,241,0.55)]"
        >
          <Plus className="mr-2 h-4 w-4" />
          {canCreateFlow
            ? "Activar automatizacion"
            : "Nuevas plantillas proximamente"}
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-4 md:grid-cols-2">
        {entries.map((entry) => (
          <FlowCard
            key={entry.template.slug}
            entry={entry}
            selected={entry.template.slug === selectedTemplateSlug}
            onClick={() => onSelect(entry)}
          />
        ))}

        <CreateFlowCard onClick={onCreateFlow} disabled={!canCreateFlow} />
      </div>
    </section>
  );
}

function FlowCard({
  entry,
  selected,
  onClick,
}: {
  entry: AutomationEntry;
  selected: boolean;
  onClick: () => void;
}) {
  const status = getEntryStatus(entry.job);
  const flowNodes = entry.template.editor_flow?.nodes ?? [];
  const branchCount = entry.template.editor_flow?.result_branches.length ?? 0;

  return (
    <button type="button" onClick={onClick} className="text-left">
      <Card
        className={cn(
          "h-full overflow-hidden rounded-[28px] border bg-white shadow-[0_20px_54px_-30px_rgba(15,23,42,0.24)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_26px_60px_-30px_rgba(99,102,241,0.32)]",
          selected &&
            "border-primary shadow-[0_26px_60px_-30px_rgba(99,102,241,0.32)]",
        )}
      >
        <CardContent className="space-y-5 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <StatusBadge status={status} />
              <div>
                <p className="text-lg font-semibold tracking-tight text-foreground">
                  {entry.job?.name || entry.template.name}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {entry.template.description}
                </p>
              </div>
            </div>
            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
          </div>

          <div className="rounded-[24px] border border-slate-100 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.18)_1px,transparent_0)] bg-[length:16px_16px] px-4 py-5">
            <div className="flex items-center gap-2">
              {flowNodes.map((node, index) => (
                <div key={node.id} className="flex items-center gap-2">
                  <MiniNode kind={node.node_kind} />
                  {index < flowNodes.length - 1 ? (
                    <div className="h-0.5 w-6 rounded-full bg-slate-300" />
                  ) : null}
                </div>
              ))}
            </div>

            {branchCount > 0 ? (
              <div className="mt-4 flex items-center gap-3 pl-8">
                {Array.from({ length: branchCount }).map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-2.5 w-8 rounded-full",
                      index === 0
                        ? "bg-emerald-300"
                        : index === 1
                          ? "bg-amber-300"
                          : "bg-rose-300",
                    )}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              Cada{" "}
              {entry.job?.interval_hours ??
                entry.template.default_interval_hours}
              h
            </span>
            <span>{status.label}</span>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

function CreateFlowCard({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="text-left"
    >
      <Card
        className={cn(
          "h-full rounded-[28px] border border-dashed shadow-none transition-colors",
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50/70 opacity-90"
            : "border-primary/35 bg-primary/[0.03] hover:bg-primary/[0.06]",
        )}
      >
        <CardContent className="flex h-full min-h-[260px] flex-col items-center justify-center gap-4 p-6 text-center">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm",
              disabled ? "text-slate-400" : "text-primary",
            )}
          >
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">
              {disabled
                ? "Nuevas plantillas proximamente"
                : "Activar un flujo nuevo"}
            </p>
            <p className="text-sm text-muted-foreground">
              {disabled
                ? "Todas las plantillas disponibles ya estan activadas. Cuando lleguen nuevas automatizaciones apareceran aqui."
                : "Empieza desde una plantilla guiada y luego ajusta sus pasos en el canvas."}
            </p>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

function MiniNode({
  kind,
}: {
  kind: AutomationTemplate["editor_flow"] extends { nodes: infer T }
    ? T extends { [index: number]: infer Node }
      ? Node extends { node_kind: infer Kind }
        ? Kind
        : never
      : never
    : never;
}) {
  const classes =
    kind === "trigger"
      ? "bg-emerald-100 text-emerald-700"
      : kind === "condition"
        ? "bg-orange-100 text-orange-700"
        : "bg-violet-100 text-violet-700";

  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-2xl border border-white shadow-sm",
        classes,
      )}
    >
      {kind === "trigger" ? (
        <CirclePlay className="h-4 w-4" />
      ) : kind === "condition" ? (
        <PauseCircle className="h-4 w-4" />
      ) : (
        <CheckCircle2 className="h-4 w-4" />
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: ReturnType<typeof getEntryStatus>;
}) {
  return (
    <Badge
      variant={status.variant}
      className={cn(
        "rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]",
        status.className,
      )}
    >
      {status.label}
    </Badge>
  );
}

function getEntryStatus(job: AutomationJob | null) {
  if (!job) {
    return {
      label: "Disponible",
      variant: "secondary" as const,
      className: "bg-slate-100 text-slate-700",
    };
  }

  if (job.status === "active") {
    return {
      label: "Activa",
      variant: "default" as const,
      className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    };
  }

  return {
    label: "Pausada",
    variant: "outline" as const,
    className: "border-amber-200 bg-amber-50 text-amber-700",
  };
}
