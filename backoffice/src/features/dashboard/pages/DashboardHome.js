import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Users, Calendar, MapPin, Bell } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { dashboardApi } from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
export function DashboardHome() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await dashboardApi.getStats();
                setStats(data);
            }
            catch (error) {
                console.error("Failed to load dashboard stats", error);
            }
            finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);
    if (loading) {
        return _jsx("div", { className: "p-8 text-center", children: "Cargando dashboard..." });
    }
    return (_jsxs("div", { className: "space-y-8 animate-in fade-in duration-500", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold tracking-tight", children: "Dashboard" }), _jsx("p", { className: "text-muted-foreground", children: "Resumen general de la plataforma Gaudeix" })] }), _jsx("div", { className: "flex items-center space-x-2", children: _jsx(Button, { variant: "outline", children: "Descargar Reporte" }) })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [_jsx(StatCard, { title: "Total Usuarios", value: stats?.totalUsers || 0, icon: Users, description: "+180 este mes" }), _jsx(StatCard, { title: "Eventos Activos", value: stats?.activeEvents || 0, icon: Calendar, description: "4 pendientes de aprobaci\u00F3n" }), _jsx(StatCard, { title: "Lugares", value: stats?.totalPlaces || 0, icon: MapPin, description: "Total registrados" }), _jsx(StatCard, { title: "Avisos", value: stats?.pendingNotifications || 0, icon: Bell, description: "Pendientes de env\u00EDo" })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-7", children: [_jsxs(Card, { className: "col-span-4 shadow-sm", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Actividad Reciente" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-8", children: stats?.recentActivity.map((activity) => (_jsx("div", { className: "flex items-center", children: _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-sm font-medium leading-none", children: activity.message }), _jsx("p", { className: "text-sm text-muted-foreground", children: new Date(activity.timestamp).toLocaleString() })] }) }, activity.id))) }) })] }), _jsxs(Card, { className: "col-span-3 shadow-sm", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Accesos R\u00E1pidos" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx(Link, { to: "/dashboard/events/new", className: "block", children: _jsxs(Button, { variant: "outline", className: "w-full justify-start mb-2", children: [_jsx(Calendar, { className: "mr-2 h-4 w-4" }), "Crear Nuevo Evento"] }) }), _jsx(Link, { to: "/dashboard/notifications/new", className: "block", children: _jsxs(Button, { variant: "outline", className: "w-full justify-start mb-2", children: [_jsx(Bell, { className: "mr-2 h-4 w-4" }), "Enviar Aviso"] }) }), _jsx(Link, { to: "/dashboard/users", className: "block", children: _jsxs(Button, { variant: "outline", className: "w-full justify-start", children: [_jsx(Users, { className: "mr-2 h-4 w-4" }), "Gestionar Usuarios"] }) })] })] })] })] }));
}
