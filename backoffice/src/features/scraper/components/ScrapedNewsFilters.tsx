/**
 * ScrapedNewsFilters - Filter controls for scraped news list
 */
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { ScraperSource, ScrapedNewsStatus } from "../types";

interface ScrapedNewsFiltersProps {
  search: string;
  onSearch: (value: string) => void;
  status: ScrapedNewsStatus | "all";
  onStatus: (value: ScrapedNewsStatus | "all") => void;
  source: string;
  onSource: (value: string) => void;
  sources: ScraperSource[];
  pageSize: number;
  onPageSize: (value: number) => void;
}

export function ScrapedNewsFilters({
  search,
  onSearch,
  status,
  onStatus,
  source,
  onSource,
  sources,
  pageSize,
  onPageSize,
}: ScrapedNewsFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Source filter */}
      <Select value={source} onValueChange={onSource}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Todas las fuentes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las fuentes</SelectItem>
          {sources.map((s) => (
            <SelectItem key={s.slug} value={s.slug}>
              {s.name} ({s.pending_count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select
        value={status}
        onValueChange={(v) => onStatus(v as ScrapedNewsStatus | "all")}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="pending">Pendiente</SelectItem>
          <SelectItem value="imported">Importada</SelectItem>
          <SelectItem value="skipped">Omitida</SelectItem>
          <SelectItem value="error">Error</SelectItem>
        </SelectContent>
      </Select>

      {/* Page size */}
      <Select
        value={String(pageSize)}
        onValueChange={(v) => onPageSize(Number(v))}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="25">25</SelectItem>
          <SelectItem value="50">50</SelectItem>
          <SelectItem value="100">100</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
