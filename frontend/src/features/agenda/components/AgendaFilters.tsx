import { DateRangeFilter } from "@/features/agenda/utils";

// TODO: Fetch categories from backend or keep this list in sync with DB
const CATEGORIES: Array<{ value: string; label: string }> = [
  { value: "all", label: "Todas las categorías" },
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
    <div className="mt-12 grid gap-4 md:grid-cols-12">
      <label className="md:col-span-3">
        <span className="sr-only">Categoría</span>
        <select
          className="h-16 w-full rounded-2xl border border-white/10 bg-white/5 px-6 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all appearance-none cursor-pointer"
          value={category}
          onChange={(e) => onChange({ category: e.target.value, range, query })}
        >
          {CATEGORIES.map((c) => (
            <option
              key={c.value}
              value={c.value}
              className="bg-slate-900 text-white"
            >
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="md:col-span-3">
        <span className="sr-only">Rango</span>
        <select
          className="h-16 w-full rounded-2xl border border-white/10 bg-white/5 px-6 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all appearance-none cursor-pointer"
          value={range}
          onChange={(e) =>
            onChange({ category, range: e.target.value as any, query })
          }
        >
          {RANGES.map((r) => (
            <option
              key={r.value}
              value={r.value}
              className="bg-slate-900 text-white"
            >
              {r.label}
            </option>
          ))}
        </select>
      </label>

      <label className="md:col-span-6">
        <span className="sr-only">Buscar</span>
        <input
          className="h-16 w-full rounded-2xl border border-white/10 bg-white/5 px-8 text-sm font-bold text-white outline-none placeholder:text-white/30 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
          placeholder="Buscar por título o recinto..."
          value={query}
          onChange={(e) => onChange({ category, range, query: e.target.value })}
        />
      </label>
    </div>
  );
}
