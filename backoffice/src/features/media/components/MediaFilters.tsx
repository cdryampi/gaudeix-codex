import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
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
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      {/* Search */}
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="search"
          placeholder="Buscar archivos..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Type and page size filters */}
      <div className="flex gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="type" className="text-xs text-muted-foreground">
            Tipo:
          </Label>
          <select
            id="type"
            value={typeFilter}
            onChange={(e) => onTypeFilter(e.target.value as MediaType | "all")}
            className="h-9 rounded-lg border border-border bg-card px-3 text-sm transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            <option value="all">Todos</option>
            <option value="image">Imágenes</option>
            <option value="document">Documentos</option>
            <option value="video">Vídeos</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="pageSize" className="text-xs text-muted-foreground">
            Mostrar:
          </Label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="h-9 rounded-lg border border-border bg-card px-3 text-sm transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
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
