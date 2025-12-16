import type { EventCategory } from "@/data/mockEvents";
import type { DateRangeFilter } from "@/features/agenda/utils";

const CATEGORIES: Array<{ value: EventCategory | "all"; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "Cultura", label: "Cultura" },
  { value: "Infantil", label: "Infantil" },
  { value: "Esports", label: "Esports" },
  { value: "Fires i mercats", label: "Fires i mercats" },
  { value: "Formació", label: "Formació" },
  { value: "Música", label: "Música" },
  { value: "Teatre", label: "Teatre" },
  { value: "Altres", label: "Altres" },
];

const RANGES: Array<{ value: DateRangeFilter; label: string }> = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "all", label: "Todo" },
];

export function AgendaFilters({
  category,
  range,
  query,
  onChange,
}: {
  category: EventCategory | "all";
  range: DateRangeFilter;
  query: string;
  onChange: (next: { category: EventCategory | "all"; range: DateRangeFilter; query: string }) => void;
}) {
  return (
    <div className="mt-6 grid gap-3 md:grid-cols-12">
      <label className="md:col-span-3">
        <span className="sr-only">Categoría</span>
        <select
          className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-puerto-rico-500 focus:ring-2 focus:ring-puerto-rico-500/20"
          value={category}
          onChange={(e) => onChange({ category: e.target.value as any, range, query })}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="md:col-span-3">
        <span className="sr-only">Rango</span>
        <select
          className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-puerto-rico-500 focus:ring-2 focus:ring-puerto-rico-500/20"
          value={range}
          onChange={(e) => onChange({ category, range: e.target.value as any, query })}
        >
          {RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </label>

      <label className="md:col-span-6">
        <span className="sr-only">Buscar</span>
        <input
          className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm outline-none placeholder:text-gray-500 focus:border-puerto-rico-500 focus:ring-2 focus:ring-puerto-rico-500/20"
          placeholder="Buscar por título o lugar"
          value={query}
          onChange={(e) => onChange({ category, range, query: e.target.value })}
        />
      </label>
    </div>
  );
}

