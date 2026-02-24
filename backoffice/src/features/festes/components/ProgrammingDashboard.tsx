/**
 * KPI dashboard and quick filters for Festes activities programming.
 */
import { useMemo } from "react";
import { CalendarDays, CheckCircle2, Layers3, ListTodo } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/common/StatCard";
import { Activity } from "../types";

type Props = {
  activities: Activity[];
  status: "all" | "published" | "draft";
  onStatusChange: (value: "all" | "published" | "draft") => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClearFilters: () => void;
};

type Bucket = {
  key: string;
  count: number;
};

export function ProgrammingDashboard({
  activities,
  status,
  onStatusChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
}: Props) {
  const publishedCount = useMemo(
    () => activities.filter((activity) => activity.is_published).length,
    [activities],
  );

  const byCategory = useMemo<Bucket[]>(() => {
    const categories = new Map<string, number>();

    for (const activity of activities) {
      const key = activity.category || "sin-categoria";
      categories.set(key, (categories.get(key) ?? 0) + 1);
    }

    return Array.from(categories.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((left, right) => right.count - left.count);
  }, [activities]);

  const byDay = useMemo<Bucket[]>(() => {
    const days = new Map<string, number>();

    for (const activity of activities) {
      if (!activity.start_at) continue;
      const dayKey = activity.start_at.slice(0, 10);
      days.set(dayKey, (days.get(dayKey) ?? 0) + 1);
    }

    return Array.from(days.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((left, right) => left.key.localeCompare(right.key));
  }, [activities]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total actividades"
          value={activities.length}
          icon={ListTodo}
          tone="primary"
        />
        <StatCard
          label="Publicadas"
          value={publishedCount}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Categorias activas"
          value={byCategory.length}
          icon={Layers3}
          tone="warning"
        />
        <StatCard
          label="Dias con programacion"
          value={byDay.length}
          icon={CalendarDays}
          tone="info"
        />
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Resumen por categoria y dia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Por categoria
              </p>
              <div className="flex flex-wrap gap-2">
                {byCategory.length === 0 ? (
                  <Badge variant="outline">Sin datos</Badge>
                ) : (
                  byCategory.slice(0, 8).map((bucket) => (
                    <Badge key={bucket.key} variant="outline">
                      {bucket.key} ({bucket.count})
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Por dia
              </p>
              <div className="flex flex-wrap gap-2">
                {byDay.length === 0 ? (
                  <Badge variant="outline">Sin fechas</Badge>
                ) : (
                  byDay.slice(0, 8).map((bucket) => (
                    <Badge key={bucket.key} variant="outline">
                      {bucket.key} ({bucket.count})
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4 md:items-end">
            <div className="space-y-2">
              <Label>Estado rapido</Label>
              <select
                value={status}
                onChange={(event) => onStatusChange(event.target.value as "all" | "published" | "draft")}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">Todos</option>
                <option value="published">Publicadas</option>
                <option value="draft">Borradores</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Desde</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(event) => onDateFromChange(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Hasta</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(event) => onDateToChange(event.target.value)}
              />
            </div>

            <Button type="button" variant="outline" onClick={onClearFilters}>
              Limpiar filtros rapidos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
