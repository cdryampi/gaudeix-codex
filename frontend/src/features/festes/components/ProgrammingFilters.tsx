/**
 * ProgrammingFilters - URL-synced filters for Festa programming list.
 */

export interface ProgrammingFiltersState {
  dateFrom: string;
  dateTo: string;
  category: string;
  location: string;
  isFree: "all" | "true" | "false";
  query: string;
}

interface ProgrammingFiltersProps {
  value: ProgrammingFiltersState;
  onChange: (next: ProgrammingFiltersState) => void;
  onReset: () => void;
}

export const ProgrammingFilters = ({
  value,
  onChange,
  onReset,
}: ProgrammingFiltersProps) => {
  return (
    <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 md:grid-cols-12 md:p-6">
      <label className="md:col-span-2">
        <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-white/60">
          Desde
        </span>
        <input
          type="date"
          value={value.dateFrom}
          onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
          className="h-12 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-xs font-bold text-white outline-none transition-all focus:border-accent"
        />
      </label>

      <label className="md:col-span-2">
        <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-white/60">
          Hasta
        </span>
        <input
          type="date"
          value={value.dateTo}
          onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
          className="h-12 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-xs font-bold text-white outline-none transition-all focus:border-accent"
        />
      </label>

      <label className="md:col-span-2">
        <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-white/60">
          Categoría
        </span>
        <input
          type="text"
          placeholder="Música"
          value={value.category}
          onChange={(e) => onChange({ ...value, category: e.target.value })}
          className="h-12 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-xs font-bold text-white placeholder:text-white/40 outline-none transition-all focus:border-accent"
        />
      </label>

      <label className="md:col-span-2">
        <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-white/60">
          Ubicación
        </span>
        <input
          type="text"
          placeholder="Plaça"
          value={value.location}
          onChange={(e) => onChange({ ...value, location: e.target.value })}
          className="h-12 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-xs font-bold text-white placeholder:text-white/40 outline-none transition-all focus:border-accent"
        />
      </label>

      <label className="md:col-span-2">
        <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-white/60">
          Precio
        </span>
        <select
          value={value.isFree}
          onChange={(e) =>
            onChange({
              ...value,
              isFree: e.target.value as ProgrammingFiltersState["isFree"],
            })
          }
          className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-white/10 px-3 text-xs font-black uppercase tracking-widest text-white outline-none transition-all focus:border-accent"
        >
          <option value="all" className="bg-slate-900 text-white">
            Todas
          </option>
          <option value="true" className="bg-slate-900 text-white">
            Gratuitas
          </option>
          <option value="false" className="bg-slate-900 text-white">
            De pago
          </option>
        </select>
      </label>

      <label className="md:col-span-8">
        <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-white/60">
          Buscar
        </span>
        <input
          type="text"
          placeholder="Buscar evento, lugar o programa"
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
          className="h-12 w-full rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white placeholder:text-white/40 outline-none transition-all focus:border-accent"
        />
      </label>

      <div className="md:col-span-4 md:flex md:items-end md:justify-end">
        <button
          onClick={onReset}
          className="h-12 w-full rounded-xl border border-white/20 px-4 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-white/10 md:w-auto"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};
