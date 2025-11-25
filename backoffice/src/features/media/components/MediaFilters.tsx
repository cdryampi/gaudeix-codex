import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaType } from "../types";

type Props = {
  search: string;
  onSearch: (value: string) => void;
  typeFilter: MediaType | "all";
  onTypeFilter: (value: MediaType | "all") => void;
  pageSize: number;
  onPageSize: (value: number) => void;
};

export function MediaFilters({
  search,
  onSearch,
  typeFilter,
  onTypeFilter,
  pageSize,
  onPageSize,
}: Props) {
  return (
    <div className="mb-4 grid gap-3 md:grid-cols-3">
      <div className="space-y-1">
        <Label htmlFor="search">Buscar</Label>
        <Input
          id="search"
          placeholder="Nombre de archivo..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="type">Tipo</Label>
        <select
          id="type"
          value={typeFilter}
          onChange={(e) => onTypeFilter(e.target.value as any)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <option value="all">Todos</option>
          <option value="image">Imágenes</option>
          <option value="document">Documentos</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="pageSize">Por página</Label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => onPageSize(Number(e.target.value))}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
