import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  Filter,
  Calendar,
  Star,
  CircleDollarSign,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Category } from "@/features/categories/types";
import { Button } from "@/components/ui/button";

export type DateRangePreset = "all" | "today" | "weekend" | "month";

type Props = {
  search: string;
  onSearch: (value: string) => void;
  status: "all" | "published" | "draft";
  onStatus: (value: "all" | "published" | "draft") => void;
  pageSize: number;
  onPageSize: (value: number) => void;

  // New Filter Props
  categories: Category[];
  selectedCategory: string;
  onCategory: (value: string) => void;

  isFeatured: boolean | null;
  onIsFeatured: (value: boolean | null) => void;

  isFree: boolean | null;
  onIsFree: (value: boolean | null) => void;

  datePreset: DateRangePreset;
  onDatePreset: (value: DateRangePreset) => void;
};

export function EventsFilters({
  search,
  onSearch,
  status,
  onStatus,
  pageSize,
  onPageSize,
  categories,
  selectedCategory,
  onCategory,
  isFeatured,
  onIsFeatured,
  isFree,
  onIsFree,
  datePreset,
  onDatePreset,
}: Props) {
  const statusTabs = [
    { value: "all", label: "Todos" },
    { value: "published", label: "Publicados" },
    { value: "draft", label: "Borradores" },
  ] as const;

  const datePresets = [
    { value: "all", label: "Cualquier fecha" },
    { value: "today", label: "Hoy" },
    { value: "weekend", label: "Este finde" },
    { value: "month", label: "Este mes" },
  ] as const;

  const hasActiveFilters =
    selectedCategory ||
    isFeatured !== null ||
    isFree !== null ||
    datePreset !== "all";

  const clearFilters = () => {
    onCategory("");
    onIsFeatured(null);
    onIsFree(null);
    onDatePreset("all");
    onSearch("");
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Primary Row: Search and Quick Status */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, lugar o etiquetas..."
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
        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategory(e.target.value)}
            className="h-8 rounded-full border border-border bg-card px-3 text-xs font-medium transition-all hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Date Presets */}
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/30 p-1">
          {datePresets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onDatePreset(preset.value)}
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold transition-all",
                datePreset === preset.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {preset.value !== "all" && <Calendar className="h-3 w-3" />}
              {preset.label}
            </button>
          ))}
        </div>

        {/* Boolean Toggles */}
        <div className="flex items-center gap-2 border-l pl-3 ml-1 border-border">
          <button
            onClick={() => onIsFeatured(isFeatured === true ? null : true)}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-full border px-3 text-[11px] font-bold transition-all",
              isFeatured === true
                ? "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30"
                : "border-border bg-card text-muted-foreground hover:border-amber-300",
            )}
          >
            <Star
              className={cn("h-3 w-3", isFeatured === true && "fill-amber-500")}
            />
            Destacados
          </button>

          <button
            onClick={() => onIsFree(isFree === true ? null : true)}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-full border px-3 text-[11px] font-bold transition-all",
              isFree === true
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"
                : "border-border bg-card text-muted-foreground hover:border-emerald-300",
            )}
          >
            <CircleDollarSign className="h-3 w-3" />
            Gratis
          </button>
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
