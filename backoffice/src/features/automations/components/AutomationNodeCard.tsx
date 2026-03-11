import {
  CheckCircle2,
  CirclePlay,
  CircleAlert,
  GitBranch,
  TimerReset,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { AutomationEditorNode, AutomationRunStepResult } from "../types";

type AutomationNodeCardProps = {
  node: AutomationEditorNode;
  selected?: boolean;
  playback?: AutomationRunStepResult | null;
  className?: string;
  onClick?: () => void;
};

const toneStyles = {
  trigger: {
    shell: "border-emerald-200 bg-white shadow-emerald-100/60",
    header: "bg-emerald-100 text-emerald-900 border-emerald-200",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  condition: {
    shell: "border-orange-200 bg-white shadow-orange-100/60",
    header: "bg-orange-100 text-orange-900 border-orange-200",
    badge: "border-orange-200 bg-orange-50 text-orange-700",
  },
  action: {
    shell: "border-violet-200 bg-white shadow-violet-100/60",
    header: "bg-violet-100 text-violet-900 border-violet-200",
    badge: "border-violet-200 bg-violet-50 text-violet-700",
  },
  result: {
    shell: "border-slate-200 bg-white shadow-slate-100/60",
    header: "bg-slate-100 text-slate-900 border-slate-200",
    badge: "border-slate-200 bg-slate-50 text-slate-700",
  },
} as const;

const playbackStyles = {
  completed:
    "ring-2 ring-emerald-200 shadow-[0_18px_40px_-18px_rgba(16,185,129,0.4)]",
  failed:
    "ring-2 ring-rose-200 shadow-[0_18px_40px_-18px_rgba(244,63,94,0.35)]",
  skipped:
    "ring-2 ring-amber-200 shadow-[0_18px_40px_-18px_rgba(245,158,11,0.35)]",
  inactive: "",
} as const;

export function AutomationNodeCard({
  node,
  selected = false,
  playback,
  className,
  onClick,
}: AutomationNodeCardProps) {
  const tone = toneStyles[node.node_kind];
  const playbackClass = playback ? playbackStyles[playback.status] : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-[280px] rounded-[24px] border text-left shadow-[0_18px_44px_-24px_rgba(15,23,42,0.18)] transition-all duration-200",
        tone.shell,
        playbackClass,
        selected && "scale-[1.01] border-primary ring-2 ring-primary/20",
        onClick &&
          "hover:-translate-y-0.5 hover:shadow-[0_24px_54px_-24px_rgba(99,102,241,0.28)]",
        className,
      )}
    >
      <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-primary bg-white shadow-sm" />
      <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-primary bg-white shadow-sm" />

      <div
        className={cn(
          "flex min-h-12 items-center justify-between rounded-t-[22px] border-b px-4 py-3",
          tone.header,
        )}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/70">
            {getNodeIcon(node.node_kind)}
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">
              {node.node_kind}
            </p>
            <p className="text-sm font-semibold">{node.node_title}</p>
          </div>
        </div>
        {playback ? (
          <PlaybackBadge status={playback.status} />
        ) : node.chip_label ? (
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-medium",
              tone.badge,
            )}
          >
            {node.chip_label}
          </span>
        ) : null}
      </div>

      <div className="space-y-3 px-5 py-4">
        <p className="text-sm leading-relaxed text-slate-600">
          {node.node_description}
        </p>
        {playback?.detail ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            {playback.detail}
          </div>
        ) : null}
        {node.editable_fields.length > 0 ? (
          <Badge variant="outline" className="rounded-full">
            Configurable
          </Badge>
        ) : null}
      </div>
    </button>
  );
}

function PlaybackBadge({
  status,
}: {
  status: AutomationRunStepResult["status"];
}) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        OK
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">
        <CircleAlert className="h-3.5 w-3.5" />
        Error
      </span>
    );
  }

  if (status === "skipped") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
        <GitBranch className="h-3.5 w-3.5" />
        Skip
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
      Inactive
    </span>
  );
}

function getNodeIcon(kind: AutomationEditorNode["node_kind"]) {
  if (kind === "trigger") {
    return <TimerReset className="h-4 w-4" />;
  }
  if (kind === "condition") {
    return <GitBranch className="h-4 w-4" />;
  }
  if (kind === "action") {
    return <Zap className="h-4 w-4" />;
  }
  return <CirclePlay className="h-4 w-4" />;
}
