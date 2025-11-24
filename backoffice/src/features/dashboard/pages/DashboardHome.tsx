import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/app/providers/AuthProvider";
import { ROUTES } from "@/lib/config/constants";
import { cn } from "@/lib/utils";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Clock,
  Image,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type StatItem = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: LucideIcon;
  footnote?: string;
};

type QuickAction = {
  label: string;
  description: string;
  to: string;
  icon: LucideIcon;
  tone?: "primary" | "neutral";
};

type ActivityItem = {
  title: string;
  user: string;
  time: string;
  status: "success" | "info" | "warning";
};

const statCards: StatItem[] = [
  {
    label: "Usuarios activos",
    value: "1,234",
    delta: "+12% vs mes pasado",
    trend: "up",
    icon: Users,
    footnote: "74 online ahora",
  },
  {
    label: "Archivos media",
    value: "856",
    delta: "+8% esta semana",
    trend: "up",
    icon: Image,
    footnote: "12 nuevos hoy",
  },
  {
    label: "Eventos activos",
    value: "42",
    delta: "-3% vs mes pasado",
    trend: "down",
    icon: Calendar,
    footnote: "3 próximos en agenda",
  },
  {
    label: "Actividad",
    value: "+573",
    delta: "+24% este mes",
    trend: "up",
    icon: TrendingUp,
    footnote: "Engagement al alza",
  },
];

const quickActions: QuickAction[] = [
  {
    label: "Gestionar usuarios",
    description: "Altas, bajas y roles",
    to: ROUTES.USERS,
    icon: Users,
    tone: "primary",
  },
  {
    label: "Subir media",
    description: "Imágenes y documentos",
    to: ROUTES.MEDIA,
    icon: Image,
  },
  {
    label: "Crear evento",
    description: "Publica un nuevo evento",
    to: ROUTES.EVENTS,
    icon: Calendar,
  },
  {
    label: "Estado general",
    description: "Revisa el health check",
    to: ROUTES.DASHBOARD_HOME,
    icon: LayoutDashboard,
  },
];

const recentActivity: ActivityItem[] = [
  {
    title: "Usuario registrado",
    user: "juan@email.com",
    time: "Hace 5 min",
    status: "success",
  },
  {
    title: "Archivo subido",
    user: "maria@email.com",
    time: "Hace 15 min",
    status: "info",
  },
  {
    title: "Evento creado",
    user: "admin@email.com",
    time: "Hace 1 hora",
    status: "success",
  },
  {
    title: "Revisión pendiente",
    user: "editor@email.com",
    time: "Hace 3 horas",
    status: "warning",
  },
];

export function DashboardHome() {
  const { user } = useAuth();
  const displayName = user?.name || user?.email || "Admin";

  return (
    <div className="space-y-6">
      <HeroSection name={displayName} />
      <StatsGrid items={statCards} />
      <QuickActions actions={quickActions} />
      <ActivityFeed items={recentActivity} />
    </div>
  );
}

function HeroSection({ name }: { name: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.18),transparent_30%)]" />
      <div className="relative p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Badge
              variant="outline"
              className="flex w-fit items-center gap-2 border-white/30 bg-white/10 text-white backdrop-blur"
            >
              <Activity className="h-3 w-3" />
              Sistema activo
            </Badge>
            <div>
              <h1 className="text-3xl font-bold leading-tight md:text-4xl">
                Hola, {name}
              </h1>
              <p className="text-sm text-slate-200 md:text-base">
                Resumen del sitio y flujos críticos a un vistazo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-300">
                Estado
              </p>
              <p className="text-sm font-semibold text-white">Infra estable</p>
            </div>
            <div className="ml-auto flex items-center gap-2 text-sm font-medium text-emerald-200">
              <Sparkles className="h-4 w-4" />
              Operativo
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Clock,
              label: "Próximos eventos",
              value: "3 en agenda",
              hint: "Actualizado hace 5 min",
            },
            {
              icon: Image,
              label: "Media reciente",
              value: "12 archivos",
              hint: "Subidos hoy",
            },
            {
              icon: Users,
              label: "Usuarios activos",
              value: "74 online",
              hint: "Última hora",
            },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index, duration: 0.35 }}
              className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur"
            >
              <div className="flex items-center gap-3 text-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-200">{item.label}</p>
                  <p className="text-lg font-semibold">{item.value}</p>
                  <p className="text-xs text-slate-300">{item.hint}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsGrid({ items }: { items: StatItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 * index, duration: 0.3 }}
          className="h-full"
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
              </div>
              <div className="rounded-md bg-muted p-2">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-semibold tracking-tight">
                {stat.value}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium",
                    stat.trend === "up"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  )}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stat.delta}
                </span>
                {stat.footnote && (
                  <span className="text-muted-foreground">{stat.footnote}</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base">Acciones rápidas</CardTitle>
          <p className="text-sm text-muted-foreground">
            Accede en un click a las áreas clave.
          </p>
        </div>
        <Badge variant="secondary" className="hidden md:inline-flex">
          Atajos activos
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <Button
            key={action.label}
            asChild
            variant="outline"
            className="h-auto justify-start gap-3 border-dashed bg-white px-4 py-3 text-left hover:bg-slate-50"
          >
            <Link to={action.to}>
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  action.tone === "primary"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-100 text-slate-700"
                )}
              >
                <action.icon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold leading-tight">{action.label}</p>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const statusStyles: Record<ActivityItem["status"], string> = {
    success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    info: "bg-blue-50 text-blue-700 ring-blue-100",
    warning: "bg-amber-50 text-amber-700 ring-amber-100",
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base">Actividad reciente</CardTitle>
          <p className="text-sm text-muted-foreground">
            Movimientos de usuarios, media y eventos.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="flex items-start gap-3 border-b pb-4 last:border-0 last:pb-0"
          >
            <div
              className={cn(
                "mt-0.5 flex h-10 w-10 items-center justify-center rounded-full ring-2",
                statusStyles[item.status]
              )}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">
                  {item.title}
                </p>
                <span className="text-xs text-muted-foreground">
                  {item.time}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{item.user}</p>
              <Badge variant="outline" className="mt-2">
                {labelForStatus(item.status)}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function labelForStatus(status: ActivityItem["status"]) {
  if (status === "success") return "Completado";
  if (status === "info") return "Actualizado";
  return "Revisión";
}
