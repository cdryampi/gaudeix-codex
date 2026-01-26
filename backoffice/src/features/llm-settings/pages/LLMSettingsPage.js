import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
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
const PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  { value: "gemini", label: "Google Gemini" },
  { value: "anthropic", label: "Anthropic Claude" },
  { value: "mistral", label: "Mistral AI" },
  { value: "groq", label: "Groq" },
  { value: "local", label: "Local (Ollama / LM Studio)" },
];
const MODELS_BY_PROVIDER = {
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
  groq: [{ value: "llama-3.1-70b-versatile", label: "Llama 3.1 70B" }],
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
function toFormState(config) {
  return {
    id: config.id,
    provider: config.provider,
    model_name: config.model_name,
    is_active: config.is_active,
    temperature: config.temperature,
    max_tokens: config.max_tokens,
  };
}
export function LLMSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshingLogs, setRefreshingLogs] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState(null);
  const [form, setForm] = useState(null);
  const [credentialsDraft, setCredentialsDraft] = useState({
    openai_api_key: "",
    gemini_api_key: "",
    anthropic_api_key: "",
    mistral_api_key: "",
    groq_api_key: "",
    local_api_url: "",
  });
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
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
  const onChange = (key, value) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };
  const onSave = async (e) => {
    e.preventDefault();
    if (!form) return;
    const payload = {
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
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.model_name?.[0] ||
        err?.response?.data?.provider?.[0] ||
        err?.response?.data?.api_key?.[0] ||
        err?.response?.data?.local_api_url?.[0] ||
        "No se pudo guardar la configuración LLM";
      toast.error(String(msg));
    } finally {
      setSaving(false);
    }
  };
  const getCredentialBadge = (provider) => {
    const status = config?.credentials?.[provider];
    if (!status) return _jsx(Badge, { variant: "outline", children: "?" });
    if (!status.configured)
      return _jsx(Badge, { variant: "destructive", children: "Faltan" });
    return _jsxs(Badge, {
      className: "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15",
      children: [
        "Configuradas",
        status.source ? ` (${String(status.source).toUpperCase()})` : "",
      ],
    });
  };
  const saveCredential = async (field) => {
    if (!form) return;
    const normalized = (credentialsDraft[field] ?? "").trim();
    if (field !== "local_api_url" && !normalized) {
      toast.error("Pega una API key para guardarla");
      return;
    }
    const payload = { [field]: normalized };
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
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.[field]?.[0] ||
        err?.response?.data?.detail ||
        "No se pudo guardar la credencial";
      toast.error(String(msg));
    } finally {
      setSaving(false);
    }
  };
  const clearCredential = async (field) => {
    if (!form) return;
    const payload = { [field]: "" };
    try {
      setSaving(true);
      const updated = await llmSettingsApi.updateConfig(form.id ?? 1, payload);
      setConfig(updated);
      setForm(toFormState(updated));
      setCredentialsDraft((prev) => ({ ...prev, [field]: "" }));
      toast.success("Credencial borrada");
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.[field]?.[0] ||
        err?.response?.data?.detail ||
        "No se pudo borrar la credencial";
      toast.error(String(msg));
    } finally {
      setSaving(false);
    }
  };
  const visibleLogs = useMemo(() => logs.slice(0, 100), [logs]);
  return _jsxs(PageContainer, {
    children: [
      _jsx(PageHeader, {
        title: "LLM",
        description:
          "Configura proveedor/modelo de traducci\u00F3n y revisa los logs de uso.",
      }),
      _jsxs(Alert, {
        className: "mb-4 w-3/4",
        children: [
          _jsx(TriangleAlert, { className: "h-4 w-4" }),
          _jsx(AlertTitle, { children: "Credenciales" }),
          _jsx(AlertDescription, {
            className: "text-sm",
            children:
              "Configura las API keys desde este panel y se guardan en la base de datos. Por seguridad, no se vuelven a mostrar.",
          }),
        ],
      }),
      _jsxs("div", {
        className: "grid gap-6 lg:grid-cols-2",
        children: [
          _jsx(Card, {
            className: "border-border bg-card",
            children: _jsx(CardContent, {
              className: "p-6",
              children: loading
                ? _jsx("div", {
                    className:
                      "flex h-32 items-center justify-center text-muted-foreground",
                    children: "Cargando...",
                  })
                : error
                  ? _jsx("div", {
                      className: "text-destructive",
                      children: error,
                    })
                  : !form
                    ? _jsx("div", {
                        className: "text-muted-foreground",
                        children: "Sin configuraci\u00F3n",
                      })
                    : _jsxs("form", {
                        onSubmit: onSave,
                        className: "space-y-6",
                        children: [
                          _jsxs("div", {
                            className:
                              "flex items-center justify-between gap-4",
                            children: [
                              _jsxs("div", {
                                children: [
                                  _jsx(Label, {
                                    className: "text-base",
                                    children: "Traducci\u00F3n autom\u00E1tica",
                                  }),
                                  _jsx("p", {
                                    className: "text-sm text-muted-foreground",
                                    children:
                                      "Activa o desactiva el servicio LLM.",
                                  }),
                                ],
                              }),
                              _jsx(Switch, {
                                checked: form.is_active,
                                onCheckedChange: (v) =>
                                  onChange("is_active", v),
                              }),
                            ],
                          }),
                          _jsxs("div", {
                            className: "grid gap-4 md:grid-cols-2",
                            children: [
                              _jsxs("div", {
                                className: "space-y-2",
                                children: [
                                  _jsx(Label, { children: "Provider" }),
                                  _jsxs(Select, {
                                    value: form.provider,
                                    onValueChange: (v) =>
                                      onChange("provider", v),
                                    children: [
                                      _jsx(SelectTrigger, {
                                        children: _jsx(SelectValue, {
                                          placeholder: "Selecciona un provider",
                                        }),
                                      }),
                                      _jsx(SelectContent, {
                                        children: PROVIDERS.map((p) =>
                                          _jsx(
                                            SelectItem,
                                            {
                                              value: p.value,
                                              children: p.label,
                                            },
                                            p.value,
                                          ),
                                        ),
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              _jsxs("div", {
                                className: "space-y-2",
                                children: [
                                  _jsx(Label, { children: "Model name" }),
                                  _jsxs(Select, {
                                    value: form.model_name,
                                    onValueChange: (v) =>
                                      onChange("model_name", v),
                                    children: [
                                      _jsx(SelectTrigger, {
                                        children: _jsx(SelectValue, {
                                          placeholder: "Selecciona un modelo",
                                        }),
                                      }),
                                      _jsx(SelectContent, {
                                        children: modelOptions.map((m) =>
                                          _jsx(
                                            SelectItem,
                                            {
                                              value: m.value,
                                              children: m.label,
                                            },
                                            m.value,
                                          ),
                                        ),
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          _jsxs("div", {
                            className: "grid gap-4 md:grid-cols-2",
                            children: [
                              _jsxs("div", {
                                className: "space-y-2",
                                children: [
                                  _jsx(Label, { children: "Temperature" }),
                                  _jsx(Input, {
                                    type: "number",
                                    step: "0.1",
                                    min: 0,
                                    max: 2,
                                    value: form.temperature,
                                    onChange: (e) =>
                                      onChange(
                                        "temperature",
                                        Number(e.target.value),
                                      ),
                                  }),
                                  _jsx("p", {
                                    className: "text-xs text-muted-foreground",
                                    children:
                                      "Rango recomendado: 0.0 \u2013 2.0",
                                  }),
                                ],
                              }),
                              _jsxs("div", {
                                className: "space-y-2",
                                children: [
                                  _jsx(Label, { children: "Max tokens" }),
                                  _jsx(Input, {
                                    type: "number",
                                    min: 1,
                                    value: form.max_tokens,
                                    onChange: (e) =>
                                      onChange(
                                        "max_tokens",
                                        Number(e.target.value),
                                      ),
                                  }),
                                ],
                              }),
                            ],
                          }),
                          _jsxs("div", {
                            className: "rounded-md border p-4",
                            children: [
                              _jsxs("div", {
                                className:
                                  "mb-3 flex flex-wrap items-center justify-between gap-2",
                                children: [
                                  _jsxs("div", {
                                    children: [
                                      _jsx(Label, {
                                        className: "text-base",
                                        children: "API Keys (DB)",
                                      }),
                                      _jsx("p", {
                                        className:
                                          "text-sm text-muted-foreground",
                                        children:
                                          "Guarda la API key aqu\u00ED (no se muestra de nuevo) o usa env vars del backend.",
                                      }),
                                    ],
                                  }),
                                  config && config.provider === form.provider
                                    ? config.credentials_configured
                                      ? _jsxs(Badge, {
                                          className:
                                            "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15",
                                          children: [
                                            "Configuradas",
                                            config.credentials_source
                                              ? ` (${config.credentials_source.toUpperCase()})`
                                              : "",
                                          ],
                                        })
                                      : _jsx(Badge, {
                                          variant: "destructive",
                                          children: "Faltan",
                                        })
                                    : _jsx(Badge, {
                                        variant: "outline",
                                        children: "Guarda para ver estado",
                                      }),
                                ],
                              }),
                              _jsxs("div", {
                                className: "space-y-4",
                                children: [
                                  _jsxs("div", {
                                    className:
                                      "grid gap-2 md:grid-cols-[160px_1fr_auto] md:items-end",
                                    children: [
                                      _jsxs("div", {
                                        className: "flex flex-col gap-1",
                                        children: [
                                          _jsx(Label, { children: "OpenAI" }),
                                          getCredentialBadge("openai"),
                                        ],
                                      }),
                                      _jsx(Input, {
                                        type: "password",
                                        autoComplete: "off",
                                        value: credentialsDraft.openai_api_key,
                                        onChange: (e) =>
                                          setCredentialsDraft((prev) => ({
                                            ...prev,
                                            openai_api_key: e.target.value,
                                          })),
                                        placeholder: "Pega la API key...",
                                      }),
                                      _jsxs("div", {
                                        className: "flex justify-end gap-2",
                                        children: [
                                          _jsx(Button, {
                                            type: "button",
                                            onClick: () =>
                                              saveCredential("openai_api_key"),
                                            disabled: saving,
                                            children: "Guardar",
                                          }),
                                          _jsx(Button, {
                                            type: "button",
                                            variant: "outline",
                                            onClick: () =>
                                              clearCredential("openai_api_key"),
                                            disabled: saving,
                                            children: "Borrar",
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  _jsxs("div", {
                                    className:
                                      "grid gap-2 md:grid-cols-[160px_1fr_auto] md:items-end",
                                    children: [
                                      _jsxs("div", {
                                        className: "flex flex-col gap-1",
                                        children: [
                                          _jsx(Label, { children: "Gemini" }),
                                          getCredentialBadge("gemini"),
                                        ],
                                      }),
                                      _jsx(Input, {
                                        type: "password",
                                        autoComplete: "off",
                                        value: credentialsDraft.gemini_api_key,
                                        onChange: (e) =>
                                          setCredentialsDraft((prev) => ({
                                            ...prev,
                                            gemini_api_key: e.target.value,
                                          })),
                                        placeholder: "Pega la API key...",
                                      }),
                                      _jsxs("div", {
                                        className: "flex justify-end gap-2",
                                        children: [
                                          _jsx(Button, {
                                            type: "button",
                                            onClick: () =>
                                              saveCredential("gemini_api_key"),
                                            disabled: saving,
                                            children: "Guardar",
                                          }),
                                          _jsx(Button, {
                                            type: "button",
                                            variant: "outline",
                                            onClick: () =>
                                              clearCredential("gemini_api_key"),
                                            disabled: saving,
                                            children: "Borrar",
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  _jsxs("div", {
                                    className:
                                      "grid gap-2 md:grid-cols-[160px_1fr_auto] md:items-end",
                                    children: [
                                      _jsxs("div", {
                                        className: "flex flex-col gap-1",
                                        children: [
                                          _jsx(Label, {
                                            children: "Anthropic",
                                          }),
                                          getCredentialBadge("anthropic"),
                                        ],
                                      }),
                                      _jsx(Input, {
                                        type: "password",
                                        autoComplete: "off",
                                        value:
                                          credentialsDraft.anthropic_api_key,
                                        onChange: (e) =>
                                          setCredentialsDraft((prev) => ({
                                            ...prev,
                                            anthropic_api_key: e.target.value,
                                          })),
                                        placeholder: "Pega la API key...",
                                      }),
                                      _jsxs("div", {
                                        className: "flex justify-end gap-2",
                                        children: [
                                          _jsx(Button, {
                                            type: "button",
                                            onClick: () =>
                                              saveCredential(
                                                "anthropic_api_key",
                                              ),
                                            disabled: saving,
                                            children: "Guardar",
                                          }),
                                          _jsx(Button, {
                                            type: "button",
                                            variant: "outline",
                                            onClick: () =>
                                              clearCredential(
                                                "anthropic_api_key",
                                              ),
                                            disabled: saving,
                                            children: "Borrar",
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  _jsxs("div", {
                                    className:
                                      "grid gap-2 md:grid-cols-[160px_1fr_auto] md:items-end",
                                    children: [
                                      _jsxs("div", {
                                        className: "flex flex-col gap-1",
                                        children: [
                                          _jsx(Label, { children: "Mistral" }),
                                          getCredentialBadge("mistral"),
                                        ],
                                      }),
                                      _jsx(Input, {
                                        type: "password",
                                        autoComplete: "off",
                                        value: credentialsDraft.mistral_api_key,
                                        onChange: (e) =>
                                          setCredentialsDraft((prev) => ({
                                            ...prev,
                                            mistral_api_key: e.target.value,
                                          })),
                                        placeholder: "Pega la API key...",
                                      }),
                                      _jsxs("div", {
                                        className: "flex justify-end gap-2",
                                        children: [
                                          _jsx(Button, {
                                            type: "button",
                                            onClick: () =>
                                              saveCredential("mistral_api_key"),
                                            disabled: saving,
                                            children: "Guardar",
                                          }),
                                          _jsx(Button, {
                                            type: "button",
                                            variant: "outline",
                                            onClick: () =>
                                              clearCredential(
                                                "mistral_api_key",
                                              ),
                                            disabled: saving,
                                            children: "Borrar",
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  _jsxs("div", {
                                    className:
                                      "grid gap-2 md:grid-cols-[160px_1fr_auto] md:items-end",
                                    children: [
                                      _jsxs("div", {
                                        className: "flex flex-col gap-1",
                                        children: [
                                          _jsx(Label, { children: "Groq" }),
                                          getCredentialBadge("groq"),
                                        ],
                                      }),
                                      _jsx(Input, {
                                        type: "password",
                                        autoComplete: "off",
                                        value: credentialsDraft.groq_api_key,
                                        onChange: (e) =>
                                          setCredentialsDraft((prev) => ({
                                            ...prev,
                                            groq_api_key: e.target.value,
                                          })),
                                        placeholder: "Pega la API key...",
                                      }),
                                      _jsxs("div", {
                                        className: "flex justify-end gap-2",
                                        children: [
                                          _jsx(Button, {
                                            type: "button",
                                            onClick: () =>
                                              saveCredential("groq_api_key"),
                                            disabled: saving,
                                            children: "Guardar",
                                          }),
                                          _jsx(Button, {
                                            type: "button",
                                            variant: "outline",
                                            onClick: () =>
                                              clearCredential("groq_api_key"),
                                            disabled: saving,
                                            children: "Borrar",
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  _jsxs("div", {
                                    className:
                                      "grid gap-2 md:grid-cols-[160px_1fr_auto] md:items-end",
                                    children: [
                                      _jsxs("div", {
                                        className: "flex flex-col gap-1",
                                        children: [
                                          _jsx(Label, {
                                            children: "Local API URL",
                                          }),
                                          getCredentialBadge("local"),
                                        ],
                                      }),
                                      _jsx(Input, {
                                        value: credentialsDraft.local_api_url,
                                        onChange: (e) =>
                                          setCredentialsDraft((prev) => ({
                                            ...prev,
                                            local_api_url: e.target.value,
                                          })),
                                        placeholder: "http://localhost:11434",
                                      }),
                                      _jsxs("div", {
                                        className: "flex justify-end gap-2",
                                        children: [
                                          _jsx(Button, {
                                            type: "button",
                                            onClick: () =>
                                              saveCredential("local_api_url"),
                                            disabled: saving,
                                            children: "Guardar",
                                          }),
                                          _jsx(Button, {
                                            type: "button",
                                            variant: "outline",
                                            onClick: () =>
                                              clearCredential("local_api_url"),
                                            disabled: saving,
                                            children: "Borrar",
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          _jsx("div", {
                            className: "flex items-center justify-end gap-2",
                            children: _jsxs(Button, {
                              type: "submit",
                              disabled: saving,
                              className: "gap-2",
                              children: [
                                _jsx(Bot, { className: "h-4 w-4" }),
                                saving ? "Guardando..." : "Guardar",
                              ],
                            }),
                          }),
                        ],
                      }),
            }),
          }),
          _jsx(Card, {
            className: "border-border bg-card",
            children: _jsxs(CardContent, {
              className: "p-6",
              children: [
                _jsxs("div", {
                  className: "mb-4 flex items-center justify-between gap-3",
                  children: [
                    _jsxs("div", {
                      children: [
                        _jsx("h3", {
                          className: "text-base font-semibold",
                          children: "Logs",
                        }),
                        _jsx("p", {
                          className: "text-sm text-muted-foreground",
                          children: "\u00DAltimas traducciones registradas.",
                        }),
                      ],
                    }),
                    _jsxs(Button, {
                      variant: "outline",
                      onClick: fetchLogs,
                      disabled: refreshingLogs,
                      className: "gap-2",
                      children: [
                        _jsx(RefreshCw, { className: "h-4 w-4" }),
                        refreshingLogs ? "Actualizando..." : "Actualizar",
                      ],
                    }),
                  ],
                }),
                logs.length === 0
                  ? _jsx("div", {
                      className: "text-sm text-muted-foreground",
                      children: "No hay logs todav\u00EDa.",
                    })
                  : _jsx("div", {
                      className:
                        "max-h-[520px] overflow-auto rounded-md border",
                      children: _jsxs(Table, {
                        children: [
                          _jsx(TableHeader, {
                            children: _jsxs(TableRow, {
                              children: [
                                _jsx(TableHead, { children: "Fecha" }),
                                _jsx(TableHead, { children: "Provider" }),
                                _jsx(TableHead, { children: "Modelo" }),
                                _jsx(TableHead, { children: "Idiomas" }),
                                _jsx(TableHead, {
                                  className: "text-right",
                                  children: "Tokens",
                                }),
                                _jsx(TableHead, { children: "Estado" }),
                              ],
                            }),
                          }),
                          _jsx(TableBody, {
                            children: visibleLogs.map((log) =>
                              _jsxs(
                                TableRow,
                                {
                                  className: "cursor-pointer hover:bg-muted/30",
                                  onClick: () => setSelectedLog(log),
                                  children: [
                                    _jsx(TableCell, {
                                      className: "whitespace-nowrap",
                                      children: new Date(
                                        log.created_at,
                                      ).toLocaleString(),
                                    }),
                                    _jsx(TableCell, {
                                      children:
                                        log.provider_display || log.provider,
                                    }),
                                    _jsx(TableCell, {
                                      className: "font-mono text-xs",
                                      children: log.model_name,
                                    }),
                                    _jsx(TableCell, {
                                      className: "whitespace-nowrap",
                                      children: _jsxs("span", {
                                        className: "font-mono text-xs",
                                        children: [
                                          log.source_language,
                                          " \u2192 ",
                                          log.target_language,
                                        ],
                                      }),
                                    }),
                                    _jsx(TableCell, {
                                      className: "text-right font-mono text-xs",
                                      children: log.tokens_used ?? "-",
                                    }),
                                    _jsx(TableCell, {
                                      children: log.success
                                        ? _jsx(Badge, {
                                            className:
                                              "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15",
                                            children: "OK",
                                          })
                                        : _jsx(Badge, {
                                            variant: "destructive",
                                            children: "Error",
                                          }),
                                    }),
                                  ],
                                },
                                log.id,
                              ),
                            ),
                          }),
                        ],
                      }),
                    }),
              ],
            }),
          }),
        ],
      }),
      _jsx(Dialog, {
        open: !!selectedLog,
        onOpenChange: (open) => (!open ? setSelectedLog(null) : null),
        children: _jsxs(DialogContent, {
          className: "max-w-3xl",
          children: [
            _jsx(DialogHeader, {
              children: _jsx(DialogTitle, { children: "Detalle del log" }),
            }),
            selectedLog &&
              _jsxs("div", {
                className: "space-y-4",
                children: [
                  _jsxs("div", {
                    className: "flex flex-wrap items-center gap-2",
                    children: [
                      _jsx(Badge, {
                        variant: selectedLog.success
                          ? "secondary"
                          : "destructive",
                        children: selectedLog.success ? "OK" : "Error",
                      }),
                      _jsx(Badge, {
                        variant: "outline",
                        children:
                          selectedLog.provider_display || selectedLog.provider,
                      }),
                      _jsx(Badge, {
                        variant: "outline",
                        className: "font-mono text-xs",
                        children: selectedLog.model_name,
                      }),
                      _jsxs("span", {
                        className: "text-sm text-muted-foreground",
                        children: [
                          new Date(selectedLog.created_at).toLocaleString(),
                          " \u00B7",
                          " ",
                          _jsxs("span", {
                            className: "font-mono",
                            children: [
                              selectedLog.source_language,
                              " \u2192 ",
                              selectedLog.target_language,
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  !selectedLog.success &&
                    selectedLog.error_message &&
                    _jsxs(Alert, {
                      variant: "destructive",
                      children: [
                        _jsx(TriangleAlert, { className: "h-4 w-4" }),
                        _jsx(AlertTitle, { children: "Error" }),
                        _jsx(AlertDescription, {
                          className: "text-sm",
                          children: selectedLog.error_message,
                        }),
                      ],
                    }),
                  _jsxs("div", {
                    className: "grid gap-4 md:grid-cols-2",
                    children: [
                      _jsxs("div", {
                        className: "space-y-2",
                        children: [
                          _jsx(Label, { children: "Texto origen" }),
                          _jsx(Textarea, {
                            value: selectedLog.source_text,
                            readOnly: true,
                            className: "min-h-[180px]",
                          }),
                        ],
                      }),
                      _jsxs("div", {
                        className: "space-y-2",
                        children: [
                          _jsx(Label, { children: "Texto traducido" }),
                          _jsx(Textarea, {
                            value: selectedLog.translated_text,
                            readOnly: true,
                            className: "min-h-[180px]",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
          ],
        }),
      }),
    ],
  });
}
