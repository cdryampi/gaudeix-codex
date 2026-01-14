import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Pencil, ImageIcon, FileText } from "lucide-react";
export function MediaTable({ items, onDelete, onRename }) {
    return (_jsx("div", { className: "w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm", children: _jsx(ScrollArea, { className: "w-full", children: _jsxs("table", { className: "w-full min-w-[720px] table-auto caption-bottom text-sm", children: [_jsx("thead", { className: "bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground", children: _jsxs("tr", { className: "[&_th]:px-5 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold", children: [_jsx("th", { children: "Archivo" }), _jsx("th", { children: "Tipo" }), _jsx("th", { children: "Tama\u00F1o" }), _jsx("th", { children: "Creado" }), _jsx("th", { className: "text-right", children: "Acciones" })] }) }), _jsx("tbody", { className: "divide-y divide-border", children: items.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "p-6 text-center text-muted-foreground", children: "No hay archivos." }) })) : (items.map((item) => (_jsxs("tr", { className: "transition-colors hover:bg-muted/30", children: [_jsx("td", { className: "px-5 py-4 align-middle", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Thumb, { item: item }), _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "font-semibold text-foreground", children: item.original_name }), _jsx("a", { href: item.file, target: "_blank", rel: "noreferrer", className: "text-xs text-primary underline", children: "Ver archivo" })] })] }) }), _jsx("td", { className: "px-5 py-4 align-middle", children: _jsxs(Badge, { variant: "secondary", className: "gap-1", children: [item.type === "image" ? (_jsx(ImageIcon, { className: "h-3.5 w-3.5" })) : (_jsx(FileText, { className: "h-3.5 w-3.5" })), item.type === "image" ? "Imagen" : "Documento"] }) }), _jsx("td", { className: "px-5 py-4 align-middle text-muted-foreground", children: formatSize(item.size_bytes) }), _jsx("td", { className: "px-5 py-4 align-middle text-muted-foreground", children: item.created_at ? formatDate(item.created_at) : "-" }), _jsx("td", { className: "px-5 py-4 align-middle text-right", children: _jsxs("div", { className: "flex justify-end gap-1", children: [_jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted", onClick: () => onRename(item), "aria-label": `Renombrar ${item.original_name}`, children: _jsx(Pencil, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10", onClick: () => onDelete(item), "aria-label": `Eliminar ${item.original_name}`, children: _jsx(Trash2, { className: "h-4 w-4" }) })] }) })] }, `${item.type}-${item.id}`)))) })] }) }) }));
}
function Thumb({ item }) {
    if (item.type === "image" && (item.thumbnail_url || item.variant_thumbnail)) {
        const src = item.thumbnail_url || item.variant_thumbnail || item.file;
        return (_jsx("img", { src: src, alt: item.original_name, className: "h-12 w-12 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700" }));
    }
    return (_jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700", children: _jsx(FileText, { className: "h-5 w-5" }) }));
}
function formatSize(bytes) {
    if (!bytes)
        return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
}
function formatDate(value) {
    const date = new Date(value);
    return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}
