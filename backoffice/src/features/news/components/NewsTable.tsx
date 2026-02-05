/**
 * NewsTable component - displays news items in a table format
 */
import { News } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Edit, Trash2 } from "lucide-react";
import { MediaThumbnail } from "@/components/common/MediaThumbnail";

type Props = {
  news: News[];
  onEdit: (news: News) => void;
  onDelete: (news: News) => void;
};

export function NewsTable({ news, onEdit, onDelete }: Props) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <ScrollArea className="w-full">
        <table className="w-full min-w-[820px] table-auto caption-bottom text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr className="[&_th]:px-5 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold">
              <th>Titulo</th>
              <th>Categoria</th>
              <th>Fecha publicacion</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {news.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-muted-foreground"
                >
                  No hay noticias creadas.
                </td>
              </tr>
            ) : (
              news.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-start gap-3">
                      <NewsThumbnail news={item} />
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.slug}
                        </p>
                        {item.excerpt && (
                          <p className="text-xs text-muted-foreground line-clamp-2 max-w-md">
                            {item.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-middle">
                    {(item.category_name || item.category_slug) && (
                      <Badge variant="outline">
                        {item.category_name || item.category_slug}
                      </Badge>
                    )}
                  </td>

                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(item.publish_date)}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-middle">
                    {item.is_published ? (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">
                        Publicado
                      </Badge>
                    ) : (
                      <Badge className="bg-muted text-muted-foreground hover:bg-muted border-border">
                        Borrador
                      </Badge>
                    )}
                  </td>

                  <td className="px-5 py-4 align-middle text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => onEdit(item)}
                        aria-label={`Editar ${item.title}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(item)}
                        aria-label={`Eliminar ${item.title}`}
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

function NewsThumbnail({ news }: { news: News }) {
  const src =
    news.featured_media?.thumbnail_url ||
    news.featured_media?.variant_thumbnail ||
    news.featured_media?.file ||
    "";
  return <MediaThumbnail src={src} alt={news.title} />;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
