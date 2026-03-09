import { Search } from "lucide-react";

import { FilterBar } from "@/components/site/primitives";
import { DateRangeFilter } from "@/features/agenda/utils";

const CATEGORIES: Array<{ value: string; label: string }> = [
  { value: "all", label: "Todas las categorias" },
  { value: "Cultura", label: "Cultura" },
  { value: "Infantil", label: "Infantil" },
  { value: "Esports", label: "Esports" },
  { value: "Fires i mercats", label: "Fires i mercats" },
  { value: "Formacio", label: "Formacion" },
  { value: "Musica", label: "Musica" },
  { value: "Teatre", label: "Teatro" },
  { value: "Altres", label: "Otros" },
];

const RANGES: Array<{ value: DateRangeFilter; label: string }> = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "all", label: "Todo el calendario" },
];

export function AgendaFilters({
  category,
  range,
  query,
  onChange,
}: {
  category: string;
  range: DateRangeFilter;
  query: string;
  onChange: (next: {
    category: string;
    range: DateRangeFilter;
    query: string;
  }) => void;
}) {
  return (
    <FilterBar className="mt-10">
      <div className="grid gap-4 md:grid-cols-12">
        <label className="md:col-span-3">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Categoria
          </span>
          <select
            className="h-12 w-full rounded-2xl border border-[color:var(--color-border-soft)] bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            value={category}
            onChange={(e) => onChange({ category: e.target.value, range, query })}
          >
            {CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="md:col-span-3">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Rango
          </span>
          <select
            className="h-12 w-full rounded-2xl border border-[color:var(--color-border-soft)] bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            value={range}
            onChange={(e) =>
              onChange({ category, range: e.target.value as DateRangeFilter, query })
            }
          >
            {RANGES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="md:col-span-6">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Buscar
          </span>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="h-12 w-full rounded-2xl border border-[color:var(--color-border-soft)] bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
              placeholder="Buscar por titulo o recinto..."
              value={query}
              onChange={(e) => onChange({ category, range, query: e.target.value })}
            />
          </div>
        </label>
      </div>
    </FilterBar>
  );
}
