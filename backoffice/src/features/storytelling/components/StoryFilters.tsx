import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Category } from "@/features/categories/types";
import { cn } from "@/lib/utils";
import { Filter, Search, X } from "lucide-react";

type Status = "all" | "published" | "draft";

type Props = {
  search: string;
  onSearch: (value: string) => void;
  status: Status;
  onStatus: (value: Status) => void;
  pageSize: number;
  onPageSize: (value: number) => void;
  categories: Category[];
  selectedCategory: string;
  onCategory: (value: string) => void;
  difficulty: string;
  onDifficulty: (value: string) => void;
  historicalPeriod: string;
  onHistoricalPeriod: (value: string) => void;
  periods: string[];
};

export function StoryFilters({
  search,
  onSearch,
  status,
  onStatus,
  pageSize,
  onPageSize,
  categories,
  selectedCategory,
  onCategory,
  difficulty,
  onDifficulty,
  historicalPeriod,
  onHistoricalPeriod,
  periods,
}: Props) {
  const statusTabs = [
    { value: "all", label: "Todos" },
    { value: "published", label: "Publicados" },
    { value: "draft", label: "Borradores" },
  ] as const;

  const hasActiveFilters =
    selectedCategory ||
    search ||
    difficulty ||
    historicalPeriod ||
    status !== "all";

  const clearFilters = () => {
    onCategory("");
    onSearch("");
    onDifficulty("");
    onHistoricalPeriod("");
    onStatus("all");
  };

  return (
    <section className="mb-6 space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Buscar relatos</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por titulo, resumen, contenido o fuente..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="border-slate-300 bg-white pl-9 text-slate-700 dark:border-slate-700 dark:bg-slate-950"
          />
        </label>

        <div className="inline-flex h-10 items-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/70">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => onStatus(tab.value)}
              className={cn(
                "rounded-sm px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap",
                status === tab.value
                  ? "bg-white text-primary-800 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-primary-300 dark:ring-slate-700"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-500" />

          <select
            value={selectedCategory}
            onChange={(e) => onCategory(e.target.value)}
            className="h-8 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition-all hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="">Todas las categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.nombre}
              </option>
            ))}
          </select>

          <select
            value={historicalPeriod}
            onChange={(e) => onHistoricalPeriod(e.target.value)}
            className="h-8 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition-all hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="">Todos los periodos</option>
            {periods.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={difficulty}
            onChange={(e) => onDifficulty(e.target.value)}
            className="h-8 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition-all hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="">Cualquier dificultad</option>
            <option value="easy">Facil</option>
            <option value="medium">Media</option>
            <option value="hard">Alta</option>
          </select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-[11px] text-rose-700 hover:bg-rose-50 hover:text-rose-800"
          >
            <X className="mr-1 h-3 w-3" /> Limpiar filtros
          </Button>
        )}

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Label className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Ver:
          </Label>
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="h-7 rounded border border-slate-300 bg-white px-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
