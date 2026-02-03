/**
 * Routes filters component.
 */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DifficultyLevel, RouteType } from "../types";

type Props = {
  search: string;
  onSearch: (value: string) => void;
  status: "all" | "published" | "draft";
  onStatus: (value: "all" | "published" | "draft") => void;
  pageSize: number;
  onPageSize: (value: number) => void;
  routeType: RouteType | "";
  onRouteType: (value: RouteType | "") => void;
  difficulty: DifficultyLevel | "";
  onDifficulty: (value: DifficultyLevel | "") => void;
};

const routeTypes = [
  { value: "walking", label: "A peu" },
  { value: "cycling", label: "Bicicleta" },
  { value: "guided", label: "Guiada" },
  { value: "mixed", label: "Mixta" },
] as const;

const difficultyLevels = [
  { value: "easy", label: "Fàcil" },
  { value: "moderate", label: "Moderada" },
  { value: "difficult", label: "Difícil" },
  { value: "expert", label: "Expert" },
] as const;

export function RoutesFilters({
  search,
  onSearch,
  status,
  onStatus,
  pageSize,
  onPageSize,
  routeType,
  onRouteType,
  difficulty,
  onDifficulty,
}: Props) {
  const statusTabs = [
    { value: "all", label: "Todos" },
    { value: "published", label: "Publicadas" },
    { value: "draft", label: "Borradores" },
  ] as const;

  const hasActiveFilters = routeType !== "" || difficulty !== "";

  const clearFilters = () => {
    onRouteType("");
    onDifficulty("");
    onSearch("");
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Primary Row: Search and Quick Status */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título o descripción..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>

        <div className="inline-flex h-10 items-center gap-1 rounded-lg bg-muted/50 p-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onStatus(tab.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap",
                status === tab.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Row: Advanced Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Route Type Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={routeType}
            onChange={(e) => onRouteType(e.target.value as RouteType | "")}
            className="h-8 rounded-full border border-border bg-card px-3 text-xs font-medium transition-all hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Todos los tipos</option>
            {routeTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={difficulty}
            onChange={(e) =>
              onDifficulty(e.target.value as DifficultyLevel | "")
            }
            className="h-8 rounded-full border border-border bg-card px-3 text-xs font-medium transition-all hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Todas las dificultades</option>
            {difficultyLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            <X className="mr-1 h-3 w-3" /> Limpiar filtros
          </Button>
        )}

        {/* Page Size (Compact) */}
        <div className="ml-auto hidden md:flex items-center gap-2">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Ver:
          </Label>
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="h-7 rounded border border-border bg-card px-1.5 text-xs font-bold"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
