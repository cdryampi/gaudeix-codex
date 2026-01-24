import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MediaItem } from "../types";
import { Trash2, Pencil, ImageIcon, FileText } from "lucide-react";

export type MediaLink = {
  label: string;
  subtitle?: string;
};

type Props = {
  items: MediaItem[];
  onDelete: (item: MediaItem) => void;
  onRename: (item: MediaItem) => void;
  linkedMap?: Record<string, MediaLink[]>;
};

export function MediaTable({ items, onDelete, onRename, linkedMap = {} }: Props) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <ScrollArea className="w-full">
        <table className="w-full min-w-[860px] table-auto caption-bottom text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr className="[&_th]:px-5 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold">
              <th>Archivo</th>
              <th>Tipo</th>
              <th>Vinculado</th>
              <th>Tamaño</th>
              <th>Creado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-muted-foreground"
                >
                  No hay archivos.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={`${item.type}-${item.id}`}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      <Thumb item={item} />
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">
                          {item.original_name}
                        </p>
                        <a
                          href={item.file}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary underline"
                        >
                          Ver archivo
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <Badge variant="secondary" className="gap-1">
                      {item.type === "image" ? (
                        <ImageIcon className="h-3.5 w-3.5" />
                      ) : (
                        <FileText className="h-3.5 w-3.5" />
                      )}
                      {item.type === "image" ? "Imagen" : "Documento"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <LinkedModelCell item={item} linkedMap={linkedMap} />
                  </td>
                  <td className="px-5 py-4 align-middle text-muted-foreground">
                    {formatSize(item.size_bytes)}
                  </td>
                  <td className="px-5 py-4 align-middle text-muted-foreground">
                    {item.created_at ? formatDate(item.created_at) : "-"}
                  </td>
                  <td className="px-5 py-4 align-middle text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => onRename(item)}
                        aria-label={`Renombrar ${item.original_name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(item)}
                        aria-label={`Eliminar ${item.original_name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}

function Thumb({ item }: { item: MediaItem }) {
  if (item.type === "image" && (item.thumbnail_url || item.variant_thumbnail)) {
    const src = item.thumbnail_url || item.variant_thumbnail || item.file;
    return (
      <img
        src={src}
        alt={item.original_name}
        className="h-10 w-10 min-h-10 min-w-10 shrink-0 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 min-h-10 min-w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
      <FileText className="h-5 w-5" />
    </div>
  );
}

function LinkedModelCell({
  item,
  linkedMap,
}: {
  item: MediaItem;
  linkedMap: Record<string, MediaLink[]>;
}) {
  const key = `${item.type}-${item.id}`;
  const linked = linkedMap[key] || [];

  if (linked.length === 0) {
    return <span className="text-muted-foreground">Sin vínculo</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      {linked.map((link, index) => (
        <div key={`${key}-${index}`} className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-[11px] font-semibold">
            {link.label}
          </Badge>
          {link.subtitle && (
            <span className="text-xs text-muted-foreground">{link.subtitle}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function formatSize(bytes: number) {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes.length - 1
  );
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
