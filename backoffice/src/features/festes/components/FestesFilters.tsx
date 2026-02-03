/**
 * Festes filters component.
 */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  search: string;
  onSearch: (value: string) => void;
  status: "all" | "published" | "draft";
  onStatus: (value: "all" | "published" | "draft") => void;
  pageSize: number;
  onPageSize: (value: number) => void;
  year: string;
  onYear: (value: string) => void;
  years: number[];
};

export function FestesFilters({
  search,
  onSearch,
  status,
  onStatus,
  pageSize,
  onPageSize,
  year,
  onYear,
  years,
}: Props) {
  const statusTabs = [
    { value: "all", label: "Todas" },
    { value: "published", label: "Publicadas" },
    { value: "draft", label: "Borradores" },
  ] as const;

  const hasActiveFilters = year !== "";

  const clearFilters = () => {
    onYear("");
    onSearch("");
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Primary Row: Search and Quick Status */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título..."
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

      {/* Secondary Row: Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Year Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={(e) => onYear(e.target.value)}
            className="h-8 rounded-full border border-border bg-card px-3 text-xs font-medium transition-all hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Todos los años</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
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

        {/* Page Size */}
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
