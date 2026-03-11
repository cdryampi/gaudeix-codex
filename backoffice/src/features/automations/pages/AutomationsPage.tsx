import { useEffect, useMemo, useState } from "react";
import { Bot, CheckCircle2, Layers3, Orbit, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { PageContainer, PageHeader } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { automationsApi } from "../api/automations";
import { AutomationDashboard } from "../components/AutomationDashboard";
import { AutomationEditorCanvas } from "../components/AutomationEditorCanvas";
import { AutomationHistoryView } from "../components/AutomationHistoryView";
import { AutomationSidebar } from "../components/AutomationSidebar";
import {
  type AutomationConfigField,
  type AutomationJob,
  type AutomationJobPayload,
  type AutomationRun,
  type AutomationTemplate,
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

type AutomationEntry = {
  template: AutomationTemplate;
  job: AutomationJob | null;
};

export function AutomationsPage() {
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplateSlug, setSelectedTemplateSlug] = useState("");
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState("trigger");
  const [activeView, setActiveView] = useState("editor");
  const [formState, setFormState] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [runningJobId, setRunningJobId] = useState<number | null>(null);

  const selectedTemplate = useMemo(
    () =>
      templates.find((template) => template.slug === selectedTemplateSlug) ??
      null,
    [selectedTemplateSlug, templates],
  );
  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === editingJobId) ?? null,
    [editingJobId, jobs],
  );
  const jobsByTemplateSlug = useMemo(
    () => new Map(jobs.map((job) => [job.template_slug, job])),
    [jobs],
  );
  const automationEntries = useMemo(() => {
    return templates
      .map((template) => ({
        template,
        job: jobsByTemplateSlug.get(template.slug) ?? null,
      }))
      .sort((left, right) => {
        if (left.job && !right.job) return -1;
        if (!left.job && right.job) return 1;
        return left.template.name.localeCompare(right.template.name, "es");
      });
  }, [jobsByTemplateSlug, templates]);
  const availableTemplatesCount = useMemo(
    () => automationEntries.filter((entry) => entry.job === null).length,
    [automationEntries],
  );

  const selectedFlowNode = useMemo(
    () =>
      selectedTemplate?.editor_flow?.nodes.find(
        (node) => node.id === selectedNodeId,
      ) ?? null,
    [selectedNodeId, selectedTemplate],
  );
  const selectedFlowBranch = useMemo(
    () =>
      selectedTemplate?.editor_flow?.result_branches.find(
        (branch) => branch.id === selectedNodeId,
      ) ?? null,
    [selectedNodeId, selectedTemplate],
  );

  const load = async (
    preferredTemplateSlug?: string,
    preferredJobId?: number | null,
  ) => {
    try {
      setLoading(true);
      setError(null);
      const [templatesResponse, jobsResponse] = await Promise.all([
        automationsApi.listTemplates(),
        automationsApi.listJobs(),
      ]);

      setTemplates(templatesResponse);
      setJobs(jobsResponse);

      const templateSlug =
        preferredTemplateSlug ||
        selectedTemplateSlug ||
        jobsResponse[0]?.template_slug ||
        templatesResponse[0]?.slug ||
        "";
      const template =
        templatesResponse.find((item) => item.slug === templateSlug) ?? null;
      const job =
        (preferredJobId
          ? jobsResponse.find((item) => item.id === preferredJobId)
          : null) ??
        jobsResponse.find((item) => item.template_slug === templateSlug) ??
        null;

      setSelectedTemplateSlug(templateSlug);
      setEditingJobId(job?.id ?? null);
      setSelectedNodeId(template?.editor_flow?.node_order[0] ?? "trigger");
      setFormState(
        job ? buildFormStateFromJob(job) : buildFormStateFromTemplate(template),
      );

      if (job) {
        setRuns(await automationsApi.listRuns(job.id));
      } else {
        setRuns([]);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el panel de automatizaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const selectEntry = async (entry: AutomationEntry) => {
    setSelectedTemplateSlug(entry.template.slug);
    setEditingJobId(entry.job?.id ?? null);
    setSelectedNodeId(entry.template.editor_flow?.node_order[0] ?? "trigger");
    setFormState(
      entry.job
        ? buildFormStateFromJob(entry.job)
        : buildFormStateFromTemplate(entry.template),
    );

    if (!entry.job) {
      setRuns([]);
      setActiveView("editor");
      return;
    }

    try {
      setRuns(await automationsApi.listRuns(entry.job.id));
      setActiveView("editor");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo cargar el historial de ejecuciones");
    }
  };

  const selectFirstAvailableTemplate = () => {
    const preferredEntry = automationEntries.find(
      (entry) => entry.job === null,
    );
    if (!preferredEntry) return;
    void selectEntry(preferredEntry);
  };

  const updateFormState = (patch: Partial<FormState>) => {
    setFormState((current) => (current ? { ...current, ...patch } : current));
  };

  const updateConfigField = (
    field: AutomationConfigField,
    value: boolean | number | string,
  ) => {
    setFormState((current) =>
      current
        ? { ...current, config: { ...current.config, [field.key]: value } }
        : current,
    );
  };

  const handleSave = async () => {
    if (!formState || !selectedTemplate) return;

    try {
      setSaving(true);
      const payload = buildPayload(formState, selectedTemplate);

      if (editingJobId) {
        const updatedJob = await automationsApi.updateJob(
          editingJobId,
          payload,
        );
        toast.success("Automatizacion actualizada");
        await load(updatedJob.template_slug, updatedJob.id);
      } else {
        const createdJob = await automationsApi.createJob(payload);
        toast.success("Automatizacion activada");
        await load(createdJob.template_slug, createdJob.id);
      }
    } catch (err) {
      console.error(err);
      toast.error("No se pudo guardar la automatizacion");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedJob) return;

    try {
      const nextStatus = selectedJob.status === "active" ? "paused" : "active";
      await automationsApi.updateJob(selectedJob.id, { status: nextStatus });
      toast.success(
        nextStatus === "active"
          ? "Automatizacion activada"
          : "Automatizacion pausada",
      );
      await load(selectedJob.template_slug, selectedJob.id);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo actualizar el estado");
    }
  };

  const handleRunNow = async () => {
    if (!selectedJob) return;

    try {
      setRunningJobId(selectedJob.id);
      await automationsApi.runNow(selectedJob.id);
      toast.success("Ejecucion manual lanzada");
      await load(selectedJob.template_slug, selectedJob.id);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo lanzar la ejecucion");
    } finally {
      setRunningJobId(null);
    }
  };

  const activeJobsCount = jobs.filter((job) => job.status === "active").length;

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        title="Automatizaciones"
        description="Un builder visual guiado para entender triggers, decisiones y resultados sin tener que descifrar formularios tecnicos."
        actions={
          <>
            <Badge variant="secondary" className="rounded-full px-3 py-1.5">
              <Layers3 className="mr-1 h-3.5 w-3.5" />
              {templates.length} plantillas
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1.5">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              {activeJobsCount} activas
            </Badge>
            <Button
              type="button"
              onClick={selectFirstAvailableTemplate}
              disabled={availableTemplatesCount === 0}
              className="rounded-full px-5"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {availableTemplatesCount > 0
                ? "Activar automatizacion"
                : "Nuevas plantillas proximamente"}
            </Button>
          </>
        }
      />

      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Cargando automatizaciones...
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : (
        <>
          <AutomationDashboard
            entries={automationEntries}
            selectedTemplateSlug={selectedTemplateSlug}
            canCreateFlow={availableTemplatesCount > 0}
            onSelect={(entry) => void selectEntry(entry)}
            onCreateFlow={selectFirstAvailableTemplate}
          />

          {selectedTemplate ? (
            <section className="space-y-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
                    Visual editor
                  </p>
                  <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                    {selectedJob?.name || selectedTemplate.name}
                  </h2>
                  <p className="max-w-3xl text-sm text-muted-foreground">
                    Cada plantilla muestra un flujo fijo de nodos para que la
                    operacion sea entendible antes de tocar parametros.
                  </p>
                </div>

                <Tabs value={activeView} onValueChange={setActiveView}>
                  <TabsList className="rounded-full bg-slate-100 p-1">
                    <TabsTrigger value="editor" className="rounded-full">
                      <Orbit className="mr-2 h-4 w-4" />
                      Editor
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-full">
                      <Bot className="mr-2 h-4 w-4" />
                      Execution history
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <Tabs value={activeView} onValueChange={setActiveView}>
                <TabsContent value="editor" className="mt-0">
                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
                    <AutomationEditorCanvas
                      template={selectedTemplate}
                      job={selectedJob}
                      selectedNodeId={selectedNodeId}
                      onSelectNode={setSelectedNodeId}
                      onRunNow={() => void handleRunNow()}
                      onToggleStatus={() => void handleToggleStatus()}
                      running={runningJobId === selectedJob?.id}
                    />

                    <AutomationSidebar
                      template={selectedTemplate}
                      job={selectedJob}
                      selectedNode={selectedFlowNode}
                      selectedBranch={selectedFlowBranch}
                      latestRun={selectedJob?.latest_run ?? null}
                      formState={formState}
                      saving={saving}
                      onFormPatch={updateFormState}
                      onConfigChange={updateConfigField}
                      onSave={() => void handleSave()}
                      onRunNow={() => void handleRunNow()}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                  <AutomationHistoryView
                    template={selectedTemplate}
                    job={selectedJob}
                    runs={runs}
                  />
                </TabsContent>
              </Tabs>
            </section>
          ) : null}
        </>
      )}
    </PageContainer>
  );
}

function buildFormStateFromTemplate(
  template: AutomationTemplate | null,
): FormState | null {
  if (!template) return null;

  return {
    template_slug: template.slug,
    name: template.name,
    status: "active",
    interval_hours: String(template.default_interval_hours),
    season_start_month: "",
    season_end_month: "",
    config: Object.fromEntries(
      template.config_fields.map((field) => [field.key, field.default ?? ""]),
    ),
  };
}

function buildFormStateFromJob(job: AutomationJob): FormState {
  return {
    template_slug: job.template_slug,
    name: job.name,
    status: job.status,
    interval_hours: String(job.interval_hours),
    season_start_month: job.season_start_month
      ? String(job.season_start_month)
      : "",
    season_end_month: job.season_end_month ? String(job.season_end_month) : "",
    config: { ...job.config },
  };
}

function buildPayload(
  formState: FormState,
  template: AutomationTemplate,
): AutomationJobPayload {
  return {
    template_slug: formState.template_slug,
    name: formState.name.trim(),
    status: formState.status,
    interval_hours: Number(formState.interval_hours),
    season_start_month: template.supports_season_window
      ? Number(formState.season_start_month || 0) || null
      : null,
    season_end_month: template.supports_season_window
      ? Number(formState.season_end_month || 0) || null
      : null,
    config: { ...formState.config },
  };
}
