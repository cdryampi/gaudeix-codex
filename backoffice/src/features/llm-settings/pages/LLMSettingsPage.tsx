import { useEffect, useMemo, useState, type FormEvent } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot, RefreshCw, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { llmSettingsApi } from "../api/llmSettings";
import {
  LLMProviderConfig,
  LLMProviderConfigUpdatePayload,
  TranslationLog,
} from "../types";

const PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  { value: "gemini", label: "Google Gemini" },
  { value: "anthropic", label: "Anthropic Claude" },
  { value: "mistral", label: "Mistral AI" },
  { value: "groq", label: "Groq" },
  { value: "local", label: "Local (Ollama / LM Studio)" },
];

const MODELS_BY_PROVIDER: Record<
  string,
  Array<{ value: string; label: string }>
> = {
  openai: [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  ],
  gemini: [
    { value: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash" },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  ],
  anthropic: [
    { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku" },
  ],
  mistral: [{ value: "mistral-large-latest", label: "Mistral Large" }],
  groq: [
    { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
    { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant" },
    { value: "openai/gpt-oss-120b", label: "GPT OSS 120B" },
    { value: "openai/gpt-oss-20b", label: "GPT OSS 20B" },
  ],
  local: [
    { value: "llama3.2:latest", label: "Llama 3.2 (Local)" },
    { value: "mistral:latest", label: "Mistral 7B (Local)" },
    {
      value: "mistralai/mistral-nemo-instruct-2407",
      label: "Mistral Nemo Instruct (Local)",
    },
    { value: "qwen2.5:latest", label: "Qwen 2.5 (Local)" },
    { value: "gemma2:latest", label: "Gemma 2 (Local)" },
  ],
};

type FormState = {
  id: number;
  provider: string;
  model_name: string;
  is_active: boolean;
  temperature: number;
  max_tokens: number;
};

function toFormState(config: LLMProviderConfig): FormState {
  return {
    id: config.id,
    provider: config.provider,
    model_name: config.model_name,
    is_active: config.is_active,
    temperature: config.temperature,
    max_tokens: config.max_tokens,
  };
}

type CredentialsDraft = {
  openai_api_key: string;
  gemini_api_key: string;
  anthropic_api_key: string;
  mistral_api_key: string;
  groq_api_key: string;
  local_api_url: string;
};

type ApiError = {
  response?: {
    data?: Record<string, string | string[]>;
  };
};

export function LLMSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshingLogs, setRefreshingLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [config, setConfig] = useState<LLMProviderConfig | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [credentialsDraft, setCredentialsDraft] = useState<CredentialsDraft>({
    openai_api_key: "",
    gemini_api_key: "",
    anthropic_api_key: "",
    mistral_api_key: "",
    groq_api_key: "",
    local_api_url: "",
  });
  const [logs, setLogs] = useState<TranslationLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<TranslationLog | null>(null);

  const modelOptions = useMemo(() => {
    const provider = form?.provider;
    const options = provider ? (MODELS_BY_PROVIDER[provider] ?? []) : [];
    const current = form?.model_name;
    if (current && !options.some((o) => o.value === current)) {
      return [{ value: current, label: `${current} (actual)` }, ...options];
    }
    return options;
  }, [form?.provider, form?.model_name]);

  const fetchLogs = async () => {
    try {
      setRefreshingLogs(true);
      const data = await llmSettingsApi.listLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
      toast.error("No se pudieron cargar los logs");
    } finally {
      setRefreshingLogs(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [config, logList] = await Promise.all([
          llmSettingsApi.getConfig(),
          llmSettingsApi.listLogs(),
        ]);
        setConfig(config);
        setForm(toFormState(config));
        setCredentialsDraft((prev) => ({
          ...prev,
          local_api_url: config.local_api_url ?? "",
        }));
        setLogs(logList);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la configuración LLM");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const onChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;

    const payload: LLMProviderConfigUpdatePayload = {
      provider: form.provider,
      model_name: form.model_name,
      is_active: form.is_active,
      temperature: form.temperature,
      max_tokens: form.max_tokens,
    };

    try {
      setSaving(true);
      const updated = await llmSettingsApi.updateConfig(form.id ?? 1, payload);
      setConfig(updated);
      setForm(toFormState(updated));
      toast.success("Configuración LLM guardada");
    } catch (err: unknown) {
      console.error(err);
      const data = (err as ApiError)?.response?.data;
      const msg =
        data?.detail ||
        data?.model_name?.[0] ||
        data?.provider?.[0] ||
        data?.api_key?.[0] ||
        data?.local_api_url?.[0] ||
        "No se pudo guardar la configuración LLM";
      toast.error(String(msg));
    } finally {
      setSaving(false);
    }
  };

  const getCredentialBadge = (provider: string) => {
    const status = config?.credentials?.[provider];
    if (!status) return <Badge variant="outline">?</Badge>;
    if (!status.configured) return <Badge variant="destructive">Faltan</Badge>;
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15">
        Configuradas
        {status.source ? ` (${String(status.source).toUpperCase()})` : ""}
      </Badge>
    );
  };

  const saveCredential = async (field: keyof CredentialsDraft) => {
    if (!form) return;

    const normalized = (credentialsDraft[field] ?? "").trim();
    if (field !== "local_api_url" && !normalized) {
      toast.error("Pega una API key para guardarla");
      return;
    }

    const payload = { [field]: normalized } as LLMProviderConfigUpdatePayload;

    try {
      setSaving(true);
      const updated = await llmSettingsApi.updateConfig(form.id ?? 1, payload);
      setConfig(updated);
      setForm(toFormState(updated));
      setCredentialsDraft((prev) => ({
        ...prev,
        [field]: field === "local_api_url" ? (updated.local_api_url ?? "") : "",
      }));
      toast.success(
        field === "local_api_url" ? "URL guardada" : "API key guardada",
      );
    } catch (err: unknown) {
      console.error(err);
      const data = (err as ApiError)?.response?.data;
      const msg =
        data?.[field]?.[0] ||
        data?.detail ||
        "No se pudo guardar la credencial";
      toast.error(String(msg));
    } finally {
      setSaving(false);
    }
  };

  const clearCredential = async (field: keyof CredentialsDraft) => {
    if (!form) return;

    const payload = { [field]: "" } as LLMProviderConfigUpdatePayload;

    try {
      setSaving(true);
      const updated = await llmSettingsApi.updateConfig(form.id ?? 1, payload);
      setConfig(updated);
      setForm(toFormState(updated));
      setCredentialsDraft((prev) => ({ ...prev, [field]: "" }));
      toast.success("Credencial borrada");
    } catch (err: unknown) {
      console.error(err);
      const data = (err as ApiError)?.response?.data;
      const msg =
        data?.[field]?.[0] || data?.detail || "No se pudo borrar la credencial";
      toast.error(String(msg));
    } finally {
      setSaving(false);
    }
  };

  const visibleLogs = useMemo(() => logs.slice(0, 100), [logs]);

  return (
    <PageContainer>
      <PageHeader
        title="LLM"
        description="Configura proveedor/modelo de traducción y revisa los logs de uso."
      />

      <Alert className="mb-4 w-3/4">
        <TriangleAlert className="h-4 w-4" />
        <AlertTitle>Credenciales</AlertTitle>
        <AlertDescription className="text-sm">
          Configura las API keys desde este panel y se guardan en la base de
          datos. Por seguridad, no se vuelven a mostrar.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            {loading ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                Cargando...
              </div>
            ) : error ? (
              <div className="text-destructive">{error}</div>
            ) : !form ? (
              <div className="text-muted-foreground">Sin configuración</div>
            ) : (
              <form onSubmit={onSave} className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label className="text-base">Traducción automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Activa o desactiva el servicio LLM.
                    </p>
                  </div>
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(v) => onChange("is_active", v)}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select
                      value={form.provider}
                      onValueChange={(v) => onChange("provider", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVIDERS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Model name</Label>
                    <Select
                      value={form.model_name}
                      onValueChange={(v) => onChange("model_name", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        {modelOptions.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Temperature</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min={0}
                      max={2}
                      value={form.temperature}
                      onChange={(e) =>
                        onChange("temperature", Number(e.target.value))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Rango recomendado: 0.0 – 2.0
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Max tokens</Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.max_tokens}
                      onChange={(e) =>
                        onChange("max_tokens", Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <Label className="text-base">API Keys (DB)</Label>
                      <p className="text-sm text-muted-foreground">
                        Guarda la API key aquí (no se muestra de nuevo) o usa
                        env vars del backend.
                      </p>
                    </div>
                    {config && config.provider === form.provider ? (
                      config.credentials_configured ? (
                        <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15">
                          Configuradas
                          {config.credentials_source
                            ? ` (${config.credentials_source.toUpperCase()})`
                            : ""}
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Faltan</Badge>
                      )
                    ) : (
                      <Badge variant="outline">Guarda para ver estado</Badge>
                    )}
                  </div>

                  {/* {form.provider === "local" ? (
                    <div className="space-y-2">
                      <Label>Local API URL</Label>
                      <Input
                        value={form.local_api_url}
                        onChange={(e) => onChange("local_api_url", e.target.value)}
                        placeholder="http://localhost:11434"
                      />
                      <p className="text-xs text-muted-foreground">URL base del servidor local (Ollama / LM Studio).</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>API key</Label>
                        <Input
                          type="password"
                          autoComplete="off"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Pega tu API key..."
                        />
                        <p className="text-xs text-muted-foreground">
                          Si lo dejas vacío, no se cambia la clave guardada.
                        </p>
                      </div>

                      <div className="flex items-end justify-end gap-2">
                        <Button type="button" onClick={onSaveApiKey} disabled={saving}>
                          Guardar key
                        </Button>
                        <Button type="button" variant="outline" onClick={onClearApiKey} disabled={saving}>
                          Borrar key
                        </Button>
                      </div>
                    </div>
                  )} */}

                  <div className="space-y-4">
                    <div className="grid gap-2 md:grid-cols-[160px_1fr_auto] md:items-end">
                      <div className="flex flex-col gap-1">
                        <Label>OpenAI</Label>
                        {getCredentialBadge("openai")}
                      </div>
                      <Input
                        type="password"
                        autoComplete="off"
                        value={credentialsDraft.openai_api_key}
                        onChange={(e) =>
                          setCredentialsDraft((prev) => ({
                            ...prev,
                            openai_api_key: e.target.value,
                          }))
                        }
                        placeholder="Pega la API key..."
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          onClick={() => saveCredential("openai_api_key")}
                          disabled={saving}
                        >
                          Guardar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => clearCredential("openai_api_key")}
                          disabled={saving}
                        >
                          Borrar
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-[160px_1fr_auto] md:items-end">
                      <div className="flex flex-col gap-1">
                        <Label>Gemini</Label>
                        {getCredentialBadge("gemini")}
                      </div>
                      <Input
                        type="password"
                        autoComplete="off"
                        value={credentialsDraft.gemini_api_key}
                        onChange={(e) =>
                          setCredentialsDraft((prev) => ({
                            ...prev,
                            gemini_api_key: e.target.value,
                          }))
                        }
                        placeholder="Pega la API key..."
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          onClick={() => saveCredential("gemini_api_key")}
                          disabled={saving}
                        >
                          Guardar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => clearCredential("gemini_api_key")}
                          disabled={saving}
                        >
                          Borrar
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-[160px_1fr_auto] md:items-end">
                      <div className="flex flex-col gap-1">
                        <Label>Anthropic</Label>
                        {getCredentialBadge("anthropic")}
                      </div>
                      <Input
                        type="password"
                        autoComplete="off"
                        value={credentialsDraft.anthropic_api_key}
                        onChange={(e) =>
                          setCredentialsDraft((prev) => ({
                            ...prev,
                            anthropic_api_key: e.target.value,
                          }))
                        }
                        placeholder="Pega la API key..."
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          onClick={() => saveCredential("anthropic_api_key")}
                          disabled={saving}
                        >
                          Guardar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => clearCredential("anthropic_api_key")}
                          disabled={saving}
                        >
                          Borrar
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-[160px_1fr_auto] md:items-end">
                      <div className="flex flex-col gap-1">
                        <Label>Mistral</Label>
                        {getCredentialBadge("mistral")}
                      </div>
                      <Input
                        type="password"
                        autoComplete="off"
                        value={credentialsDraft.mistral_api_key}
                        onChange={(e) =>
                          setCredentialsDraft((prev) => ({
                            ...prev,
                            mistral_api_key: e.target.value,
                          }))
                        }
                        placeholder="Pega la API key..."
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          onClick={() => saveCredential("mistral_api_key")}
                          disabled={saving}
                        >
                          Guardar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => clearCredential("mistral_api_key")}
                          disabled={saving}
                        >
                          Borrar
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-[160px_1fr_auto] md:items-end">
                      <div className="flex flex-col gap-1">
                        <Label>Groq</Label>
                        {getCredentialBadge("groq")}
                      </div>
                      <Input
                        type="password"
                        autoComplete="off"
                        value={credentialsDraft.groq_api_key}
                        onChange={(e) =>
                          setCredentialsDraft((prev) => ({
                            ...prev,
                            groq_api_key: e.target.value,
                          }))
                        }
                        placeholder="Pega la API key..."
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          onClick={() => saveCredential("groq_api_key")}
                          disabled={saving}
                        >
                          Guardar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => clearCredential("groq_api_key")}
                          disabled={saving}
                        >
                          Borrar
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-[160px_1fr_auto] md:items-end">
                      <div className="flex flex-col gap-1">
                        <Label>Local API URL</Label>
                        {getCredentialBadge("local")}
                      </div>
                      <Input
                        value={credentialsDraft.local_api_url}
                        onChange={(e) =>
                          setCredentialsDraft((prev) => ({
                            ...prev,
                            local_api_url: e.target.value,
                          }))
                        }
                        placeholder="http://localhost:11434"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          onClick={() => saveCredential("local_api_url")}
                          disabled={saving}
                        >
                          Guardar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => clearCredential("local_api_url")}
                          disabled={saving}
                        >
                          Borrar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button type="submit" disabled={saving} className="gap-2">
                    <Bot className="h-4 w-4" />
                    {saving ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">Logs</h3>
                <p className="text-sm text-muted-foreground">
                  Últimas traducciones registradas.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={fetchLogs}
                disabled={refreshingLogs}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {refreshingLogs ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>

            {logs.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No hay logs todavía.
              </div>
            ) : (
              <div className="max-h-[520px] overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Idiomas</TableHead>
                      <TableHead className="text-right">Tokens</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleLogs.map((log) => (
                      <TableRow
                        key={log.id}
                        className="cursor-pointer hover:bg-muted/30"
                        onClick={() => setSelectedLog(log)}
                      >
                        <TableCell className="whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {log.provider_display || log.provider}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.model_name}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className="font-mono text-xs">
                            {log.source_language} → {log.target_language}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {log.tokens_used ?? "-"}
                        </TableCell>
                        <TableCell>
                          {log.success ? (
                            <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15">
                              OK
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Error</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={!!selectedLog}
        onOpenChange={(open) => (!open ? setSelectedLog(null) : null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalle del log</DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={selectedLog.success ? "secondary" : "destructive"}
                >
                  {selectedLog.success ? "OK" : "Error"}
                </Badge>
                <Badge variant="outline">
                  {selectedLog.provider_display || selectedLog.provider}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs">
                  {selectedLog.model_name}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(selectedLog.created_at).toLocaleString()} ·{" "}
                  <span className="font-mono">
                    {selectedLog.source_language} →{" "}
                    {selectedLog.target_language}
                  </span>
                </span>
              </div>

              {!selectedLog.success && selectedLog.error_message && (
                <Alert variant="destructive">
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription className="text-sm">
                    {selectedLog.error_message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Texto origen</Label>
                  <Textarea
                    value={selectedLog.source_text}
                    readOnly
                    className="min-h-[180px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Texto traducido</Label>
                  <Textarea
                    value={selectedLog.translated_text}
                    readOnly
                    className="min-h-[180px]"
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
