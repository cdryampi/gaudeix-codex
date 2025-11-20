import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
export function UsersPage() {
    return (_jsxs(PageContainer, { children: [_jsx(PageHeader, { title: "Usuarios", description: "Gesti\u00F3n de usuarios del sistema", actions: _jsxs(Button, { children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Nuevo Usuario"] }) }), _jsx("div", { className: "rounded-lg border bg-white p-6", children: _jsx("p", { className: "text-sm text-gray-500", children: "Tabla de usuarios y funcionalidad CRUD se implementar\u00E1 aqu\u00ED..." }) })] }));
}
