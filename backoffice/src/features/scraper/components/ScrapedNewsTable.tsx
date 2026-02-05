/**
 * ScrapedNewsTable - Table component for displaying scraped news
 */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ExternalLink,
  Eye,
  Import,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { ScrapedNewsListItem, ScrapedNewsStatus } from "../types";
import React from "react";

interface ScrapedNewsTableProps {
  items: ScrapedNewsListItem[];
  selectedIds: number[];
  onSelect: (ids: number[]) => void;
  onView: (item: ScrapedNewsListItem) => void;
  onImport: (item: ScrapedNewsListItem) => void;
  onDelete: (item: ScrapedNewsListItem) => void;
}

const statusConfig: Record<
  ScrapedNewsStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ReactNode;
  }
> = {
  pending: {
    label: "Pendiente",
    variant: "outline",
    icon: <Clock className="h-3 w-3" />,
  },
  imported: {
    label: "Importada",
    variant: "default",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  skipped: {
    label: "Omitida",
    variant: "secondary",
    icon: <XCircle className="h-3 w-3" />,
  },
  error: {
    label: "Error",
    variant: "destructive",
    icon: <AlertCircle className="h-3 w-3" />,
  },
};

export function ScrapedNewsTable({
  items,
  selectedIds,
  onSelect,
  onView,
  onImport,
  onDelete,
}: ScrapedNewsTableProps) {
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelect(items.map((item) => item.id));
    } else {
      onSelect([]);
    }
  };

  const handleSelectOne = (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.checked) {
      onSelect([...selectedIds, id]);
    } else {
      onSelect(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        No hay noticias scrapeadas
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox checked={allSelected} onChange={handleSelectAll} />
          </TableHead>
          <TableHead>Título</TableHead>
          <TableHead className="w-32">Fuente</TableHead>
          <TableHead className="w-28">Fecha</TableHead>
          <TableHead className="w-28">Estado</TableHead>
          <TableHead className="w-32 text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const status = statusConfig[item.status];
          const isSelected = selectedIds.includes(item.id);

          return (
            <TableRow
              key={item.id}
              className={isSelected ? "bg-muted/50" : undefined}
            >
              <TableCell>
                <Checkbox
                  checked={isSelected}
                  onChange={(e) => handleSelectOne(item.id, e)}
                />
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-medium line-clamp-1">{item.title}</span>
                  {item.summary && (
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {item.summary}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{item.source_name}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm">{formatDate(item.published_at)}</span>
              </TableCell>
              <TableCell>
                <Badge variant={status.variant} className="gap-1">
                  {status.icon}
                  {status.label}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(item.source_url, "_blank")}
                    title="Ver original"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(item)}
                    title="Ver detalle"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {item.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onImport(item)}
                      title="Importar"
                      className="text-primary hover:text-primary"
                    >
                      <Import className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(item)}
                    title="Eliminar"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
