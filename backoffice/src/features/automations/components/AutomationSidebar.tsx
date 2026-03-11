import { Link } from "react-router-dom";
import {
  CircleAlert,
  CirclePlay,
  Save,
  Settings2,
  ShieldAlert,
  Sparkles,
  TimerReset,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ROUTES } from "@/lib/config/constants";
import { cn } from "@/lib/utils";

import type {
  AutomationConfigField,
  AutomationEditorBranch,
  AutomationEditorNode,
  AutomationJob,
  AutomationRun,
  AutomationTemplate,
} from "../types";

type FormState = {
  template_slug: string;
  name: string;
  status: "active" | "paused";
  interval_hours: string;
  season_start_month: string;
  season_end_month: string;
  config: Record<string, boolean | number | string>;
};

type AutomationSidebarProps = {
  template: AutomationTemplate;
  job: AutomationJob | null;
  selectedNode: AutomationEditorNode | null;
  selectedBranch: AutomationEditorBranch | null;
  latestRun: AutomationRun | null;
  formState: FormState | null;
  saving: boolean;
  onFormPatch: (patch: Partial<FormState>) => void;
  onConfigChange: (
    field: AutomationConfigField,
    value: boolean | number | string,
  ) => void;
  onSave: () => void;
  onRunNow: () => void;
};

const MONTH_OPTIONS = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

export function AutomationSidebar({
  template,
  job,
  selectedNode,
  selectedBranch,
  latestRun,
  formState,
  saving,
  onFormPatch,
  onConfigChange,
  onSave,
  onRunNow,
}: AutomationSidebarProps) {
  const selectedStep = selectedNode ?? selectedBranch;
  const selectedStepKind = selectedNode?.node_kind ?? "result";

  return (
    <Card className="overflow-hidden rounded-[32px] border border-slate-200 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.28)]">
      <CardContent className="p-0">
        <div
          className={cn(
            "border-b px-6 py-6",
            selectedStepKind === "trigger"
              ? "border-emerald-200 bg-emerald-100/90"
              : selectedStepKind === "condition"
                ? "border-orange-200 bg-orange-100/90"
                : selectedStepKind === "action"
                  ? "border-violet-200 bg-violet-100/90"
                  : "border-slate-200 bg-slate-100/90",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-white/80 shadow-sm">
              {selectedStepKind === "trigger" ? (
                <TimerReset className="h-5 w-5 text-emerald-700" />
              ) : selectedStepKind === "condition" ? (
                <CircleAlert className="h-5 w-5 text-orange-700" />
              ) : selectedStepKind === "action" ? (
                <Zap className="h-5 w-5 text-violet-700" />
              ) : (
                <Sparkles className="h-5 w-5 text-slate-700" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                {selectedStepKind}
              </p>
              <h3 className="text-xl font-semibold text-slate-900">
                {selectedNode?.node_title ||
                  selectedBranch?.title ||
                  "Selecciona un paso"}
              </h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {selectedNode?.node_description ||
              selectedBranch?.description ||
              "Selecciona un nodo del canvas para ajustar o revisar su comportamiento."}
          </p>
        </div>

        <div className="space-y-6 p-6">
          {selectedNode?.node_kind === "trigger" && formState ? (
            <TriggerSettings
              template={template}
              formState={formState}
              onFormPatch={onFormPatch}
            />
          ) : null}

          {selectedNode?.node_kind === "action" && formState ? (
            <ActionSettings
              template={template}
              formState={formState}
              onConfigChange={onConfigChange}
            />
          ) : null}

          {selectedNode?.node_kind === "condition" ? (
            <ConditionReadOnly latestRun={latestRun} />
          ) : null}

          {selectedBranch ? (
            <BranchReadOnly branch={selectedBranch} latestRun={latestRun} />
          ) : null}

          {!selectedNode && !selectedBranch ? (
            <div className="rounded-[24px] border border-dashed border-slate-200 p-4 text-sm text-muted-foreground">
              Selecciona un nodo del canvas para ver su configuracion o su papel
              dentro del flujo.
            </div>
          ) : null}

          {template.slug === "beach_safety.evaluate_red_flag_proposal" ? (
            <Button
              asChild
              type="button"
              variant="outline"
              className="w-full rounded-full"
            >
              <Link to={ROUTES.BEACH_SAFETY}>
                <ShieldAlert className="mr-2 h-4 w-4" />
                Revisar propuestas de playas
              </Link>
            </Button>
          ) : null}

          <div className="flex flex-col gap-3 pt-2">
            <Button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="rounded-full"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving
                ? "Guardando..."
                : job
                  ? "Guardar cambios"
                  : "Activar automatizacion"}
            </Button>

            {job ? (
              <Button
                type="button"
                variant="outline"
                onClick={onRunNow}
                className="rounded-full"
              >
                <CirclePlay className="mr-2 h-4 w-4" />
                Test step
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TriggerSettings({
  template,
  formState,
  onFormPatch,
}: {
  template: AutomationTemplate;
  formState: FormState;
  onFormPatch: (patch: Partial<FormState>) => void;
}) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Control del trigger"
        description="Desde aqui decides cada cuanto corre el flujo y si esta activo."
      />

      <div className="space-y-2">
        <Label htmlFor="automation-name">Nombre visible</Label>
        <Input
          id="automation-name"
          value={formState.name}
          onChange={(event) => onFormPatch({ name: event.target.value })}
        />
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="pr-3">
            <p className="font-medium text-foreground">Estado del flujo</p>
            <p className="text-sm text-muted-foreground">
              Pausar detiene el trigger horario sin perder la configuracion.
            </p>
          </div>
          <Switch
            checked={formState.status === "active"}
            onCheckedChange={(checked) =>
              onFormPatch({ status: checked ? "active" : "paused" })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="automation-interval">Frecuencia en horas</Label>
        <Input
          id="automation-interval"
          type="number"
          min={1}
          max={24}
          value={formState.interval_hours}
          onChange={(event) =>
            onFormPatch({ interval_hours: event.target.value })
          }
        />
      </div>

      {template.supports_season_window ? (
        <div className="space-y-4 rounded-[24px] border border-slate-200 p-4">
          <div>
            <p className="font-medium text-foreground">Ventana estacional</p>
            <p className="text-sm text-muted-foreground">
              Limita este trigger a los meses donde realmente aporta valor.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="season-start">Inicio</Label>
              <Select
                value={formState.season_start_month}
                onValueChange={(value) =>
                  onFormPatch({ season_start_month: value })
                }
              >
                <SelectTrigger id="season-start">
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="season-end">Fin</Label>
              <Select
                value={formState.season_end_month}
                onValueChange={(value) =>
                  onFormPatch({ season_end_month: value })
                }
              >
                <SelectTrigger id="season-end">
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ActionSettings({
  template,
  formState,
  onConfigChange,
}: {
  template: AutomationTemplate;
  formState: FormState;
  onConfigChange: (
    field: AutomationConfigField,
    value: boolean | number | string,
  ) => void;
}) {
  const editableFields =
    template.editor_flow?.nodes.find((node) => node.node_kind === "action")
      ?.editable_fields ?? [];
  const configFields = template.config_fields.filter((field) =>
    editableFields.includes(`config.${field.key}`),
  );

  if (configFields.length === 0) {
    return (
      <div className="space-y-3">
        <SectionTitle
          title="Paso de accion"
          description="Este paso no necesita configuracion extra: ejecuta la logica interna de la plantilla."
        />
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground">
          La accion usa la configuracion principal del flujo y no expone ajustes
          adicionales en esta version.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Configurar accion"
        description="Ajustes especificos del paso que realiza el trabajo principal."
      />

      {configFields.map((field) => (
        <ConfigFieldRow
          key={field.key}
          field={field}
          value={formState.config[field.key]}
          onChange={(value) => onConfigChange(field, value)}
        />
      ))}
    </div>
  );
}

function ConditionReadOnly({ latestRun }: { latestRun: AutomationRun | null }) {
  const conditionStep = latestRun?.step_results.find(
    (step) => step.node_kind === "condition",
  );

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Condicion de control"
        description="Este nodo decide el camino del flujo segun los datos disponibles."
      />
      <div className="rounded-[24px] border border-orange-200 bg-orange-50/60 p-4">
        <p className="text-sm text-slate-700">
          {conditionStep?.detail ||
            "No hay una ejecucion reciente para mostrar como se evaluo esta condicion."}
        </p>
      </div>
    </div>
  );
}

function BranchReadOnly({
  branch,
  latestRun,
}: {
  branch: AutomationEditorBranch;
  latestRun: AutomationRun | null;
}) {
  const branchStep = latestRun?.step_results.find(
    (step) => step.node_id === branch.id,
  );

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Resultado del flujo"
        description="Las ramas finales explican como termina la automatizacion."
      />
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "rounded-full",
              branch.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : branch.tone === "warning"
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-rose-200 bg-rose-50 text-rose-700",
            )}
          >
            {branch.label}
          </Badge>
          <span className="text-sm font-medium text-foreground">
            {branch.title}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {branchStep?.detail || branch.description}
        </p>
      </div>
    </div>
  );
}

function ConfigFieldRow({
  field,
  value,
  onChange,
}: {
  field: AutomationConfigField;
  value: boolean | number | string | undefined;
  onChange: (value: boolean | number | string) => void;
}) {
  if (field.field_type === "boolean") {
    return (
      <div className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="pr-4">
          <p className="text-sm font-medium text-foreground">{field.label}</p>
          <p className="text-xs text-muted-foreground">{field.help_text}</p>
        </div>
        <Switch checked={Boolean(value)} onCheckedChange={onChange} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`config-${field.key}`}>{field.label}</Label>
      <Input
        id={`config-${field.key}`}
        type={field.field_type === "integer" ? "number" : "text"}
        min={field.min_value ?? undefined}
        max={field.max_value ?? undefined}
        value={String(value ?? "")}
        onChange={(event) =>
          onChange(
            field.field_type === "integer"
              ? Number(event.target.value)
              : event.target.value,
          )
        }
      />
      <p className="text-xs text-muted-foreground">{field.help_text}</p>
    </div>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Settings2 className="h-4 w-4 text-primary" />
        <p className="font-medium text-foreground">{title}</p>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
