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
import { dashboardApi, DashboardStats } from "../api";

import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/config/constants";
import { FavoritesKPI } from "../components/FavoritesKPI";

export function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
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
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  const recentActivity = stats?.recentActivity ?? [];

  const QuickAction = ({
    to,
    icon: Icon,
    title,
    desc,
    color,
    ringColor,
  }: {
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    desc: string;
    color: string;
    ringColor?: string;
  }) => (
    <Link
      to={to}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-2 ${ringColor || "hover:ring-primary-500/20"} dark:border-gray-800 dark:bg-gray-800`}
    >
      <div
        className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${color} shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3`}
      >
        <Icon className="h-7 w-7 text-white" />
      </div>
      <div>
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
          {desc}
        </p>
      </div>
      <div className="absolute right-5 top-5 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
        <ArrowRight className="h-5 w-5 text-gray-400" />
      </div>
    </Link>
  );

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-8 mx-auto animate-in fade-in duration-500">
      <div className="w-full max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Resumen general de la plataforma Gaudeix
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-gray-700">
              Descargar Reporte
            </button>
            <Link
              to={ROUTES.EVENTS}
              className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-600 dark:hover:bg-primary-700"
            >
              <Plus className="-ml-1 mr-2 h-4 w-4" />
              Nuevo Evento
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Usuarios"
            value={stats?.totalUsers || 0}
            icon={Users}
            tone="primary"
          />
          <StatCard
            label="Eventos Activos"
            value={stats?.activeEvents || 0}
            icon={Calendar}
            tone="success"
          />
          <StatCard
            label="Lugares"
            value={stats?.totalPlaces || 0}
            icon={MapPin}
            tone="warning"
          />
          <StatCard
            label="Avisos Pendientes"
            value={stats?.pendingNotifications || 0}
            icon={Bell}
            tone="info"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Accesos Rápidos
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <QuickAction
                to={ROUTES.EVENTS}
                icon={Calendar}
                title="Gestionar Eventos"
                desc="Crear, editar y moderar eventos del calendario."
                color="bg-purple-600"
                ringColor="hover:ring-purple-500/30"
              />
              <QuickAction
                to={ROUTES.STATIC_PAGES}
                icon={FileText}
                title="Páginas Estáticas"
                desc="Administrar contenido institucional y legal."
                color="bg-blue-600"
                ringColor="hover:ring-blue-500/30"
              />
              <QuickAction
                to={ROUTES.USERS}
                icon={Users}
                title="Usuarios"
                desc="Control de acceso y perfiles de usuarios."
                color="bg-emerald-600"
                ringColor="hover:ring-emerald-500/30"
              />
              <QuickAction
                to={ROUTES.PLACES}
                icon={MapPin}
                title="Lugares"
                desc="Directorio de puntos de interés y mapas."
                color="bg-amber-600"
                ringColor="hover:ring-amber-500/30"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Actividad Reciente
              </h3>
              <Link
                to="#"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Ver todo
              </Link>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-gray-50 p-3 dark:bg-gray-700/50">
                    <Bell className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    No hay actividad reciente registrada.
                  </p>
                </div>
              ) : (
                <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-6">
                  {recentActivity.map((activity, idx) => (
                    <div
                      key={activity.id || idx}
                      className="mb-6 ml-6 last:mb-0"
                    >
                      <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-gray-200 ring-4 ring-white dark:bg-gray-700 dark:ring-gray-800"></span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.message}
                      </p>
                      <time className="mb-1 text-xs font-normal text-gray-500 dark:text-gray-400">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </time>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Favorites KPI - Top 5 most favorited events */}
        <FavoritesKPI />
      </div>
    </div>
  );
}
