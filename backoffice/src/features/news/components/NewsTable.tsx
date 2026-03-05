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
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <ScrollArea className="w-full">
        <table className="w-full min-w-[820px] table-auto caption-bottom text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.04em] text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr className="[&_th]:px-5 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold">
              <th>Titulo</th>
              <th>Categoria</th>
              <th>Fecha publicacion</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {news.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-slate-500 dark:text-slate-400"
                >
                  No hay noticias creadas.
                </td>
              </tr>
            ) : (
              news.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-slate-50/90 dark:hover:bg-slate-800/40"
                >
                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-start gap-3">
                      <NewsThumbnail news={item} />
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {item.slug}
                        </p>
                        {item.excerpt && (
                          <p className="max-w-md line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                            {item.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-middle">
                    {(item.category_name || item.category_slug) && (
                      <Badge
                        variant="outline"
                        className="border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300"
                      >
                        {item.category_name || item.category_slug}
                      </Badge>
                    )}
                  </td>

                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{formatDate(item.publish_date)}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-middle">
                    {item.is_published ? (
                      <Badge className="border border-secondary-200 bg-secondary-50 text-secondary-700 hover:bg-secondary-50 dark:border-secondary-900 dark:bg-secondary-950/40 dark:text-secondary-300">
                        Publicado
                      </Badge>
                    ) : (
                      <Badge className="border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Borrador
                      </Badge>
                    )}
                  </td>

                  <td className="px-5 py-4 align-middle text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        onClick={() => onEdit(item)}
                        aria-label={`Editar ${item.title}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-300 dark:hover:bg-rose-900/20 dark:hover:text-rose-300"
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
