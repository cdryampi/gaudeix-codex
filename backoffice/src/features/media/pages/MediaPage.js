import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
export function MediaPage() {
    return (_jsxs(PageContainer, { children: [_jsx(PageHeader, { title: "Media", description: "Gesti\u00F3n de archivos multimedia", actions: _jsxs(Button, { children: [_jsx(Upload, { className: "mr-2 h-4 w-4" }), "Subir Archivo"] }) }), _jsx("div", { className: "rounded-lg border bg-white p-6", children: _jsx("p", { className: "text-sm text-gray-500", children: "Galer\u00EDa de media y funcionalidad de upload se implementar\u00E1 aqu\u00ED..." }) })] }));
}
