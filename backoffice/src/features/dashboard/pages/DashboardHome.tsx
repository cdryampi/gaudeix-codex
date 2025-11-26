import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Datos para gráficos
const revenueData = [
  { month: "Ene", value: 12450 },
  { month: "Feb", value: 13230 },
  { month: "Mar", value: 11890 },
  { month: "Abr", value: 14567 },
  { month: "May", value: 13890 },
  { month: "Jun", value: 15231 },
];

const subscriptionsData = [
  { month: "Ene", value: 1890 },
  { month: "Feb", value: 2015 },
  { month: "Mar", value: 1967 },
  { month: "Abr", value: 2156 },
  { month: "May", value: 2234 },
  { month: "Jun", value: 2350 },
];

const activityData = [
  { day: "Lun", users: 234, events: 45, posts: 23 },
  { day: "Mar", users: 312, events: 52, posts: 31 },
  { day: "Mié", users: 289, events: 48, posts: 28 },
  { day: "Jue", users: 356, events: 61, posts: 35 },
  { day: "Vie", users: 423, events: 58, posts: 42 },
  { day: "Sáb", users: 198, events: 31, posts: 18 },
  { day: "Dom", users: 167, events: 27, posts: 15 },
];

export function DashboardHome() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Resumen
        </h1>
        <p className="text-sm text-muted-foreground">
          Estadísticas y métricas del sistema
        </p>
      </div>

      {/* Gráficos compactos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="overflow-hidden border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-xs font-normal uppercase tracking-wider text-muted-foreground">
              Total Revenue
            </CardTitle>
            <div className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              $15,231.89
            </div>
            <p className="text-xs font-medium text-primary">
              +20.1% from last month
            </p>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart
                data={revenueData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.5}
                  fill="url(#colorRevenue)"
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscriptions Chart */}
        <Card className="overflow-hidden border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-xs font-normal uppercase tracking-wider text-muted-foreground">
              Subscriptions
            </CardTitle>
            <div className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              +2,350
            </div>
            <p className="text-xs font-medium text-primary">
              +180.1% from last month
            </p>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ResponsiveContainer width="100%" height={120}>
              <LineChart
                data={subscriptionsData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.5}
                  fill="url(#colorLine)"
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Chart */}
        <Card className="overflow-hidden border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-xs font-normal uppercase tracking-wider text-muted-foreground">
              Active Now
            </CardTitle>
            <div className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              +573
            </div>
            <p className="text-xs font-medium text-primary">
              +201 since last hour
            </p>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ResponsiveContainer width="100%" height={120}>
              <BarChart
                data={activityData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <Bar
                  dataKey="users"
                  fill="hsl(var(--primary))"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={8}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
