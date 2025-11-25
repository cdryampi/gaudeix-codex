import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  search: string;
  onSearch: (value: string) => void;
  status: "all" | "published" | "draft";
  onStatus: (value: "all" | "published" | "draft") => void;
  pageSize: number;
  onPageSize: (value: number) => void;
};

export function EventsFilters({
  search,
  onSearch,
  status,
  onStatus,
  pageSize,
  onPageSize,
}: Props) {
  return (
    <div className="mb-4 grid gap-3 md:grid-cols-3">
      <div className="space-y-1">
        <Label htmlFor="search">Buscar</Label>
        <Input
          id="search"
          placeholder="Título o descripción..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="status">Estado</Label>
        <select
          id="status"
          value={status}
          onChange={(e) => onStatus(e.target.value as any)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <option value="all">Todos</option>
          <option value="published">Publicados</option>
          <option value="draft">Borradores</option>
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
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
