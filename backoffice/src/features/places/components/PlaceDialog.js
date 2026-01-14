import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LANGUAGES } from "@/lib/config/constants";
import { mediaApi } from "@/features/media/api/media";
import { categoriesApi } from "@/features/categories/api/categories";
import { placesApi } from "../api/places";
import { toast } from "sonner";
const emptyForm = {
    title: "",
    description: "",
    location_text: "",
    latitude: null,
    longitude: null,
    phone: "",
    email: "",
    website: "",
    booking_url: "",
    is_published: true,
    category_id: null,
    featured_media_id: null,
    attachments_ids: [],
    translations: {},
};
export function PlaceDialog({ open, onOpenChange, onSubmit, place }) {
    const [form, setForm] = useState(emptyForm);
    const [activeLang, setActiveLang] = useState("ca");
    const [translations, setTranslations] = useState({});
    const [images, setImages] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingTranslate, setLoadingTranslate] = useState(false);
    const imageInputRef = useRef(null);
    const docInputRef = useRef(null);
    useEffect(() => {
        if (place) {
            setForm({
                title: place.title,
                description: place.description || "",
                location_text: place.location_text || "",
                latitude: place.latitude ?? null,
                longitude: place.longitude ?? null,
                phone: place.phone || "",
                email: place.email || "",
                website: place.website || "",
                booking_url: place.booking_url || "",
                is_published: place.is_published,
                category_id: place.category ?? null,
                featured_media_id: place.featured_media?.id ?? null,
                attachments_ids: (place.attachments || []).map((a) => a.id),
            });
            setTranslations(place.translations || {});
        }
        else {
            setForm(emptyForm);
            setTranslations({});
        }
    }, [place, open]);
    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [imgs, docs, cats] = await Promise.all([
                    mediaApi.listImages(),
                    mediaApi.listDocuments(),
                    categoriesApi.list({ taxonomy: "template" }),
                ]);
                setImages(imgs);
                setDocuments(docs);
                setCategories(cats);
            }
            catch (err) {
                console.error("Error cargando opciones", err);
            }
        };
        if (open)
            loadOptions();
    }, [open]);
    const getContent = (lang) => {
        if (lang === "ca") {
            return { title: form.title, description: form.description };
        }
        return translations[lang] || { title: "", description: "" };
    };
    const updateField = (lang, field, value) => {
        if (lang === "ca") {
            setForm((prev) => ({ ...prev, [field]: value }));
        }
        else {
            setTranslations((prev) => ({
                ...prev,
                [lang]: {
                    ...prev[lang],
                    [field]: value,
                },
            }));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const translationsPayload = { ...translations };
        delete translationsPayload["ca"];
        const payload = {
            ...form,
            translations: Object.keys(translationsPayload).length ? translationsPayload : undefined,
        };
        await onSubmit(payload);
    };
    const handleUploadImage = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        try {
            const uploaded = await mediaApi.upload(file);
            if (uploaded.type === "image") {
                setImages((prev) => [uploaded, ...prev]);
                setForm((prev) => ({ ...prev, featured_media_id: uploaded.id }));
            }
        }
        catch (err) {
            console.error(err);
            toast.error("No se pudo subir la imagen");
        }
        finally {
            if (imageInputRef.current)
                imageInputRef.current.value = "";
        }
    };
    const handleUploadDoc = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        try {
            const uploaded = await mediaApi.upload(file);
            setDocuments((prev) => [uploaded, ...prev]);
            setForm((prev) => ({
                ...prev,
                attachments_ids: Array.from(new Set([...(prev.attachments_ids || []), uploaded.id])),
            }));
        }
        catch (err) {
            console.error(err);
            toast.error("No se pudo subir el documento");
        }
        finally {
            if (docInputRef.current)
                docInputRef.current.value = "";
        }
    };
    const handleAutoTranslate = async (targetLang) => {
        if (!place)
            return;
        if (!form.title) {
            toast.error("No hay título en el idioma base para traducir");
            return;
        }
        setLoadingTranslate(true);
        try {
            const response = await placesApi.autoTranslate(place.id, {
                source_lang: "ca",
                target_langs: [targetLang],
            });
            if (response.success && response.translations[targetLang]) {
                const t = response.translations[targetLang];
                setTranslations((prev) => ({ ...prev, [targetLang]: t }));
                toast.success(`Traducido a ${targetLang.toUpperCase()}`);
            }
            else {
                toast.error("Error al traducir", {
                    description: response.errors?.[targetLang] || "Error desconocido",
                });
            }
        }
        catch (err) {
            console.error(err);
            toast.error("No se pudo traducir el lugar");
        }
        finally {
            setLoadingTranslate(false);
        }
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "max-w-[720px] px-6", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: place ? "Editar lugar" : "Nuevo lugar" }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "location_text", children: "Ubicaci\u00F3n" }), _jsx(Input, { id: "location_text", value: form.location_text || "", onChange: (e) => setForm((prev) => ({ ...prev, location_text: e.target.value })), placeholder: "Direcci\u00F3n o referencia" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "latitude", children: "Latitud" }), _jsx(Input, { id: "latitude", type: "number", value: form.latitude ?? "", onChange: (e) => setForm((prev) => ({ ...prev, latitude: e.target.value ? Number(e.target.value) : null })), placeholder: "41.4" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "longitude", children: "Longitud" }), _jsx(Input, { id: "longitude", type: "number", value: form.longitude ?? "", onChange: (e) => setForm((prev) => ({ ...prev, longitude: e.target.value ? Number(e.target.value) : null })), placeholder: "2.17" })] })] })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "phone", children: "Tel\u00E9fono" }), _jsx(Input, { id: "phone", value: form.phone || "", onChange: (e) => setForm((prev) => ({ ...prev, phone: e.target.value })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", value: form.email || "", onChange: (e) => setForm((prev) => ({ ...prev, email: e.target.value })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "website", children: "Website" }), _jsx(Input, { id: "website", value: form.website || "", onChange: (e) => setForm((prev) => ({ ...prev, website: e.target.value })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "booking_url", children: "Booking URL" }), _jsx(Input, { id: "booking_url", value: form.booking_url || "", onChange: (e) => setForm((prev) => ({ ...prev, booking_url: e.target.value })) })] })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "category", children: "Categor\u00EDa" }), _jsxs("select", { id: "category", value: form.category_id ?? "", onChange: (e) => setForm((prev) => ({ ...prev, category_id: e.target.value ? Number(e.target.value) : null })), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50", children: [_jsx("option", { value: "", children: "Sin categor\u00EDa" }), categories.map((cat) => (_jsxs("option", { value: cat.id, children: [cat.nombre, " (", cat.slug, ")"] }, cat.id)))] })] }), _jsxs("div", { className: "flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm", children: [_jsx(Label, { htmlFor: "place-is-published", className: "cursor-pointer text-sm font-normal", children: "Publicado" }), _jsx(Switch, { id: "place-is-published", checked: !!form.is_published, onCheckedChange: (checked) => setForm((prev) => ({ ...prev, is_published: checked })) })] })] }), _jsxs(Tabs, { value: activeLang, onValueChange: setActiveLang, defaultValue: "ca", children: [_jsx(TabsList, { className: "grid w-full grid-cols-4", children: LANGUAGES.map((lang) => (_jsx(TabsTrigger, { value: lang.code, children: lang.name }, lang.code))) }), LANGUAGES.map((lang) => {
                                    const content = getContent(lang.code);
                                    const isBase = lang.code === "ca";
                                    return (_jsxs(TabsContent, { value: lang.code, className: "space-y-3 pt-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(Label, { htmlFor: `title-${lang.code}`, children: ["T\u00EDtulo ", isBase ? "" : `(${lang.name})`] }), !isBase && place && (_jsx(Button, { type: "button", size: "sm", variant: "outline", onClick: () => handleAutoTranslate(lang.code), disabled: loadingTranslate || !form.title, children: loadingTranslate ? "Traduciendo..." : "Traducir IA" }))] }), _jsx(Input, { id: `title-${lang.code}`, value: content.title || "", onChange: (e) => updateField(lang.code, "title", e.target.value), required: isBase, placeholder: isBase ? "" : "Traducción automática o manual" }), _jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: `description-${lang.code}`, children: ["Descripci\u00F3n ", isBase ? "" : `(${lang.name})`] }), _jsx(Textarea, { id: `description-${lang.code}`, value: content.description || "", onChange: (e) => updateField(lang.code, "description", e.target.value), placeholder: isBase ? "Descripción del lugar" : "Traducción automática o manual" })] })] }, lang.code));
                                })] }), _jsx("div", { className: "space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: "Imagen destacada" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Miniatura visible en listados" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "file", accept: "image/*", ref: imageInputRef, onChange: handleUploadImage, className: "hidden" }), _jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => imageInputRef.current?.click(), children: "Subir" }), _jsxs("select", { value: form.featured_media_id ?? "", onChange: (e) => setForm((prev) => ({
                                                    ...prev,
                                                    featured_media_id: e.target.value ? Number(e.target.value) : null,
                                                })), className: "h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50", children: [_jsx("option", { value: "", children: "Sin imagen" }), images.map((img) => (_jsx("option", { value: img.id, children: img.original_name }, img.id)))] })] })] }) }), _jsx("div", { className: "space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: "Adjuntos" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Documentos vinculados al lugar" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "file", accept: ".pdf,.ics,.txt,.docx,.xlsx", ref: docInputRef, onChange: handleUploadDoc, className: "hidden" }), _jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => docInputRef.current?.click(), children: "Subir" }), _jsx("select", { multiple: true, value: (form.attachments_ids || []).map(String), onChange: (e) => {
                                                    const values = Array.from(e.target.selectedOptions).map((opt) => Number(opt.value));
                                                    setForm((prev) => ({ ...prev, attachments_ids: values }));
                                                }, className: "h-24 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50", children: documents.map((doc) => (_jsx("option", { value: doc.id, children: doc.original_name }, doc.id))) })] })] }) }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), children: "Cancelar" }), _jsx(Button, { type: "submit", children: place ? "Guardar" : "Crear" })] })] })] }) }));
}
