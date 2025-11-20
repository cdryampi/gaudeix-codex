import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
export function EventsPage() {
    return (_jsxs(PageContainer, { children: [_jsx(PageHeader, { title: "Eventos", description: "Gesti\u00F3n de eventos", actions: _jsxs(Button, { children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Nuevo Evento"] }) }), _jsx("div", { className: "rounded-lg border bg-white p-6", children: _jsx("p", { className: "text-sm text-gray-500", children: "Calendario y gesti\u00F3n de eventos se implementar\u00E1 aqu\u00ED..." }) })] }));
}
