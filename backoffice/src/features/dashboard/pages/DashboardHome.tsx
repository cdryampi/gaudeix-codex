import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/app/providers/AuthProvider";
import { Users, Image, Calendar, Activity, TrendingUp } from "lucide-react";

export function DashboardHome() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenido de nuevo, {user?.name || "Usuario"}
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-green-500/10 text-green-700 border-green-500/20"
        >
          <Activity className="mr-1 h-3 w-3" />
          Sistema activo
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Usuarios
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+12%</span> desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Archivos Media
            </CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">856</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+8%</span> esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Eventos Activos
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-red-600">-3%</span> desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Actividad</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+24%</span> este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Gestionar Usuarios
          </Button>
          <Button variant="outline">
            <Image className="mr-2 h-4 w-4" />
            Subir Media
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Crear Evento
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                action: "Usuario registrado",
                user: "juan@email.com",
                time: "Hace 5 min",
              },
              {
                action: "Archivo subido",
                user: "maria@email.com",
                time: "Hace 15 min",
              },
              {
                action: "Evento creado",
                user: "admin@email.com",
                time: "Hace 1 hora",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0"
              >
                <div>
                  <p className="font-medium text-sm">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.user}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
