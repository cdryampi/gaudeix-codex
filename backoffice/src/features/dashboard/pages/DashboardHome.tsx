import { useEffect, useState } from "react";
import { Users, Calendar, MapPin, Bell } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { dashboardApi, DashboardStats } from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
    return <div className="p-8 text-center">Cargando dashboard...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Resumen general de la plataforma Gaudeix
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">Descargar Reporte</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Usuarios"
          value={stats?.totalUsers || 0}
          icon={Users}
          description="+180 este mes"
        />
        <StatCard
          title="Eventos Activos"
          value={stats?.activeEvents || 0}
          icon={Calendar}
          description="4 pendientes de aprobación"
        />
        <StatCard
          title="Lugares"
          value={stats?.totalPlaces || 0}
          icon={MapPin}
          description="Total registrados"
        />
        <StatCard
          title="Avisos"
          value={stats?.pendingNotifications || 0}
          icon={Bell}
          description="Pendientes de envío"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Recent Activity */}
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {stats?.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.message}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/dashboard/events/new" className="block">
              <Button variant="outline" className="w-full justify-start mb-2">
                <Calendar className="mr-2 h-4 w-4" />
                Crear Nuevo Evento
              </Button>
            </Link>
            <Link to="/dashboard/notifications/new" className="block">
              <Button variant="outline" className="w-full justify-start mb-2">
                <Bell className="mr-2 h-4 w-4" />
                Enviar Aviso
              </Button>
            </Link>
            <Link to="/dashboard/users" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Gestionar Usuarios
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
