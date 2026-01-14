import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import { siteSettingsApi } from "../api/siteSettings";
import { toast } from "sonner";
function defaults() {
    return {
        video_enabled: true,
        background_video_id: null,
        youtube_url: "",
        video_title: "",
        video_description_internal: "",
    };
}
export function VideoSettingsPage() {
    const [form, setForm] = useState(defaults());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [backgroundVideoUrl, setBackgroundVideoUrl] = useState(null);
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const settings = await siteSettingsApi.get();
                setForm({
                    video_enabled: settings.video_enabled ?? true,
                    background_video_id: settings.background_video_id ?? null,
                    youtube_url: settings.youtube_url ?? "",
                    video_title: settings.video_title ?? "",
                    video_description_internal: settings.video_description_internal ?? "",
                });
                setBackgroundVideoUrl(settings.background_video?.file ?? null);
            }
            catch (err) {
                console.error(err);
                setError("No se pudieron cargar los ajustes de vídeo");
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, []);
    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await siteSettingsApi.update(form);
            toast.success("Vídeo guardado");
        }
        catch (err) {
            console.error(err);
            toast.error("No se pudo guardar el vídeo");
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs(PageContainer, { children: [_jsx(PageHeader, { title: "V\u00EDdeo", description: "Configura el v\u00EDdeo de fondo y el enlace de YouTube de la web." }), _jsxs(Alert, { variant: "destructive", className: "mb-4 w-3/4", children: [_jsx(TriangleAlert, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "V\u00EDdeo del hero" }), _jsxs(AlertDescription, { className: "text-sm", children: ["El v\u00EDdeo de fondo se muestra en el hero de la home. El enlace de YouTube es auxiliar y opcional. Usa el enlace de compartir de YouTube (Share), por ejemplo: ", _jsx("span", { className: "font-mono", children: "https://youtu.be/ID" }), "."] })] }), _jsx(Card, { className: "border-border bg-card", children: _jsx(CardContent, { className: "p-6", children: loading ? (_jsx("div", { className: "flex h-32 items-center justify-center text-muted-foreground", children: "Cargando..." })) : error ? (_jsx("div", { className: "text-destructive", children: error })) : (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [backgroundVideoUrl && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Preview actual" }), _jsx("video", { src: backgroundVideoUrl, controls: true, muted: true, loop: true, playsInline: true, className: "w-full rounded-md border border-border/60 bg-black" })] })), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("label", { className: "flex items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2 text-sm md:col-span-2", children: [_jsx("span", { children: "Activar v\u00EDdeo de fondo (hero)" }), _jsx(Switch, { checked: !!form.video_enabled, onCheckedChange: (checked) => handleChange("video_enabled", checked) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Video ID (interno)" }), _jsx(Input, { value: form.background_video_id ?? "", onChange: (e) => handleChange("background_video_id", e.target.value ? Number(e.target.value) : null), placeholder: "ID de VideoFile" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Sube el v\u00EDdeo en \u201CMedia\u201D \u2192 \u201CVideos\u201D y pega aqu\u00ED su ID." })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Youtube URL" }), _jsx(Input, { value: form.youtube_url, onChange: (e) => handleChange("youtube_url", e.target.value), placeholder: "https://www.youtube.com/watch?v=..." }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Pega el enlace de compartir de YouTube (no embed). Es opcional." })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "T\u00EDtulo interno" }), _jsx(Input, { value: form.video_title, onChange: (e) => handleChange("video_title", e.target.value), placeholder: "V\u00EDdeo Cabrera de Mar" })] }), _jsxs("div", { className: "space-y-2 md:col-span-2", children: [_jsx(Label, { children: "Descripci\u00F3n interna" }), _jsx(Textarea, { value: form.video_description_internal, onChange: (e) => handleChange("video_description_internal", e.target.value), rows: 4 })] })] }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { type: "submit", disabled: saving, children: saving ? "Guardando..." : "Guardar" }) })] })) }) })] }));
}
