import { PageContainer, PageHeader, DataCard } from "@/components/common";
import { Users, Image, Calendar, TrendingUp } from "lucide-react";

export function DashboardHome() {
  return (
    <PageContainer>
      <PageHeader title="Dashboard" description="Resumen general del sistema" />

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DataCard
          title="Total Usuarios"
          value="1,234"
          description="Usuarios registrados"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <DataCard
          title="Media Files"
          value="856"
          description="Archivos multimedia"
          icon={Image}
          trend={{ value: 8, isPositive: true }}
        />
        <DataCard
          title="Eventos"
          value="42"
          description="Eventos activos"
          icon={Calendar}
          trend={{ value: -3, isPositive: false }}
        />
        <DataCard
          title="Actividad"
          value="+573"
          description="Acciones este mes"
          icon={TrendingUp}
          trend={{ value: 24, isPositive: true }}
        />
      </div>

      {/* Additional content placeholder */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Actividad Reciente</h2>
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-gray-500">
            Aquí se mostrará la actividad reciente del sistema...
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
