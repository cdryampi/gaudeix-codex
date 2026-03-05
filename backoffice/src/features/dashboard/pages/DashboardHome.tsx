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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-700"></div>
      </div>
    );
  }

  const recentActivity = stats?.recentActivity ?? [];

  const QuickAction = ({
    to,
    icon: Icon,
    title,
    desc,
  }: {
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    desc: string;
  }) => (
    <Link
      to={to}
      className="group relative flex min-h-40 flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700 ring-1 ring-primary-100 transition-colors group-hover:bg-primary-100 dark:bg-primary-950/40 dark:text-primary-300 dark:ring-primary-900">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="mb-2 text-base font-semibold text-slate-900 transition-colors group-hover:text-primary-800 dark:text-slate-100 dark:group-hover:text-primary-300">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
      </div>
      <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
        <ArrowRight className="h-4 w-4 text-primary-500" />
      </div>
    </Link>
  );

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col px-2 py-2 md:px-0">
      <div className="w-full space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Resumen general de la plataforma Gaudeix
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
              Descargar Reporte
            </button>
            <Link
              to={ROUTES.EVENTS}
              className="inline-flex items-center justify-center rounded-md bg-primary-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <Plus className="-ml-1 mr-2 h-4 w-4" />
              Nuevo Evento
            </Link>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="space-y-4 lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Accesos Rápidos
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <QuickAction
                to={ROUTES.EVENTS}
                icon={Calendar}
                title="Gestionar Eventos"
                desc="Crear, editar y moderar eventos del calendario."
              />
              <QuickAction
                to={ROUTES.STATIC_PAGES}
                icon={FileText}
                title="Páginas Estáticas"
                desc="Administrar contenido institucional y legal."
              />
              <QuickAction
                to={ROUTES.USERS}
                icon={Users}
                title="Usuarios"
                desc="Control de acceso y perfiles de usuarios."
              />
              <QuickAction
                to={ROUTES.PLACES}
                icon={MapPin}
                title="Lugares"
                desc="Directorio de puntos de interés y mapas."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Actividad Reciente
              </h3>
              <Link
                to="#"
                className="text-sm font-medium text-primary-700 hover:text-primary-800 dark:text-primary-300"
              >
                Ver todo
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800">
                    <Bell className="h-6 w-6 text-slate-500" />
                  </div>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    No hay actividad reciente registrada.
                  </p>
                </div>
              ) : (
                <div className="relative ml-3 space-y-6 border-l border-slate-200 dark:border-slate-700">
                  {recentActivity.map((activity, idx) => (
                    <div
                      key={activity.id || idx}
                      className="mb-6 ml-6 last:mb-0"
                    >
                      <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary-200 ring-4 ring-white dark:bg-primary-700 dark:ring-slate-900"></span>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {activity.message}
                      </p>
                      <time className="mb-1 text-xs font-normal text-slate-500 dark:text-slate-400">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </time>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <FavoritesKPI />
      </div>
    </div>
  );
}
