import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  MapPin,
  Bell,
  FileText,
  ArrowRight,
  Plus,
} from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { dashboardApi } from "../api";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/config/constants";
export function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);
  if (loading) {
    return _jsx("div", {
      className: "flex h-64 items-center justify-center",
      children: _jsx("div", {
        className:
          "h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600",
      }),
    });
  }
  const recentActivity = stats?.recentActivity ?? [];
  const QuickAction = ({ to, icon: Icon, title, desc, color, ringColor }) =>
    _jsxs(Link, {
      to: to,
      className: `group relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-2 ${ringColor || "hover:ring-primary-500/20"} dark:border-gray-800 dark:bg-gray-800`,
      children: [
        _jsx("div", {
          className: `mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${color} shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3`,
          children: _jsx(Icon, { className: "h-7 w-7 text-white" }),
        }),
        _jsxs("div", {
          children: [
            _jsx("h3", {
              className:
                "mb-2 text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors",
              children: title,
            }),
            _jsx("p", {
              className:
                "text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors",
              children: desc,
            }),
          ],
        }),
        _jsx("div", {
          className:
            "absolute right-5 top-5 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0",
          children: _jsx(ArrowRight, { className: "h-5 w-5 text-gray-400" }),
        }),
      ],
    });
  return _jsx("div", {
    className:
      "container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-8 mx-auto animate-in fade-in duration-500",
    children: _jsxs("div", {
      className: "w-full max-w-6xl space-y-8",
      children: [
        _jsxs("div", {
          className:
            "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
          children: [
            _jsxs("div", {
              children: [
                _jsx("h2", {
                  className:
                    "text-2xl font-bold tracking-tight text-gray-900 dark:text-white",
                  children: "Dashboard",
                }),
                _jsx("p", {
                  className: "mt-1 text-sm text-gray-500 dark:text-gray-400",
                  children: "Resumen general de la plataforma Gaudeix",
                }),
              ],
            }),
            _jsxs("div", {
              className: "flex items-center space-x-3",
              children: [
                _jsx("button", {
                  className:
                    "inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-gray-700",
                  children: "Descargar Reporte",
                }),
                _jsxs(Link, {
                  to: ROUTES.EVENTS,
                  className:
                    "inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-600 dark:hover:bg-primary-700",
                  children: [
                    _jsx(Plus, { className: "-ml-1 mr-2 h-4 w-4" }),
                    "Nuevo Evento",
                  ],
                }),
              ],
            }),
          ],
        }),
        _jsxs("div", {
          className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-4",
          children: [
            _jsx(StatCard, {
              label: "Total Usuarios",
              value: stats?.totalUsers || 0,
              icon: Users,
              tone: "primary",
            }),
            _jsx(StatCard, {
              label: "Eventos Activos",
              value: stats?.activeEvents || 0,
              icon: Calendar,
              tone: "success",
            }),
            _jsx(StatCard, {
              label: "Lugares",
              value: stats?.totalPlaces || 0,
              icon: MapPin,
              tone: "warning",
            }),
            _jsx(StatCard, {
              label: "Avisos Pendientes",
              value: stats?.pendingNotifications || 0,
              icon: Bell,
              tone: "info",
            }),
          ],
        }),
        _jsxs("div", {
          className: "grid gap-8 lg:grid-cols-3",
          children: [
            _jsxs("div", {
              className: "lg:col-span-2 space-y-6",
              children: [
                _jsx("h3", {
                  className:
                    "text-lg font-semibold text-gray-900 dark:text-white",
                  children: "Accesos R\u00E1pidos",
                }),
                _jsxs("div", {
                  className: "grid gap-4 sm:grid-cols-2",
                  children: [
                    _jsx(QuickAction, {
                      to: ROUTES.EVENTS,
                      icon: Calendar,
                      title: "Gestionar Eventos",
                      desc: "Crear, editar y moderar eventos del calendario.",
                      color: "bg-purple-600",
                      ringColor: "hover:ring-purple-500/30",
                    }),
                    _jsx(QuickAction, {
                      to: ROUTES.STATIC_PAGES,
                      icon: FileText,
                      title: "P\u00E1ginas Est\u00E1ticas",
                      desc: "Administrar contenido institucional y legal.",
                      color: "bg-blue-600",
                      ringColor: "hover:ring-blue-500/30",
                    }),
                    _jsx(QuickAction, {
                      to: ROUTES.USERS,
                      icon: Users,
                      title: "Usuarios",
                      desc: "Control de acceso y perfiles de usuarios.",
                      color: "bg-emerald-600",
                      ringColor: "hover:ring-emerald-500/30",
                    }),
                    _jsx(QuickAction, {
                      to: ROUTES.PLACES,
                      icon: MapPin,
                      title: "Lugares",
                      desc: "Directorio de puntos de inter\u00E9s y mapas.",
                      color: "bg-amber-600",
                      ringColor: "hover:ring-amber-500/30",
                    }),
                  ],
                }),
              ],
            }),
            _jsxs("div", {
              className: "space-y-6",
              children: [
                _jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    _jsx("h3", {
                      className:
                        "text-lg font-semibold text-gray-900 dark:text-white",
                      children: "Actividad Reciente",
                    }),
                    _jsx(Link, {
                      to: "#",
                      className:
                        "text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400",
                      children: "Ver todo",
                    }),
                  ],
                }),
                _jsx("div", {
                  className:
                    "rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800",
                  children:
                    recentActivity.length === 0
                      ? _jsxs("div", {
                          className:
                            "flex flex-col items-center justify-center py-8 text-center",
                          children: [
                            _jsx("div", {
                              className:
                                "rounded-full bg-gray-50 p-3 dark:bg-gray-700/50",
                              children: _jsx(Bell, {
                                className: "h-6 w-6 text-gray-400",
                              }),
                            }),
                            _jsx("p", {
                              className:
                                "mt-3 text-sm text-gray-500 dark:text-gray-400",
                              children: "No hay actividad reciente registrada.",
                            }),
                          ],
                        })
                      : _jsx("div", {
                          className:
                            "relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-6",
                          children: recentActivity.map((activity, idx) =>
                            _jsxs(
                              "div",
                              {
                                className: "mb-6 ml-6 last:mb-0",
                                children: [
                                  _jsx("span", {
                                    className:
                                      "absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-gray-200 ring-4 ring-white dark:bg-gray-700 dark:ring-gray-800",
                                  }),
                                  _jsx("p", {
                                    className:
                                      "text-sm font-medium text-gray-900 dark:text-white",
                                    children: activity.message,
                                  }),
                                  _jsx("time", {
                                    className:
                                      "mb-1 text-xs font-normal text-gray-500 dark:text-gray-400",
                                    children: new Date(
                                      activity.timestamp,
                                    ).toLocaleDateString(),
                                  }),
                                ],
                              },
                              activity.id || idx,
                            ),
                          ),
                        }),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
