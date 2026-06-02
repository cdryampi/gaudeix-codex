import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MediaThumbnail } from "@/components/common/MediaThumbnail";
import { BookOpen, Edit, ExternalLink, FileText, Trash2 } from "lucide-react";
import { Story } from "../types";

type Props = {
  stories: Story[];
  onEdit: (story: Story) => void;
  onDelete: (story: Story) => void;
};

const difficultyLabels: Record<string, string> = {
  easy: "Facil",
  medium: "Media",
  hard: "Alta",
};

export function StoryTable({ stories, onEdit, onDelete }: Props) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <ScrollArea className="w-full">
        <table className="w-full min-w-[920px] table-auto caption-bottom text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.04em] text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr className="[&_th]:px-5 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold">
              <th>Relato</th>
              <th>Periodo</th>
              <th>Lectura</th>
              <th>Fuente</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {stories.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-slate-500 dark:text-slate-400"
                >
                  No hay relatos creados.
                </td>
              </tr>
            ) : (
              stories.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-slate-50/90 dark:hover:bg-slate-800/40"
                >
                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-start gap-3">
                      <StoryThumbnail story={item} />
                      <div className="min-w-0 space-y-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {item.title}
                        </p>
                        <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {item.slug}
                        </p>
                        {item.summary ? (
                          <p className="max-w-xl line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                            {item.summary}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-middle">
                    {item.historical_period ? (
                      <Badge
                        variant="outline"
                        className="border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/20 dark:text-slate-300"
                      >
                        {item.historical_period}
                      </Badge>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  <td className="px-5 py-4 align-middle">
                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <p className="inline-flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                        {item.reading_time} min
                      </p>
                      <p className="inline-flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        {difficultyLabels[item.difficulty] || item.difficulty}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-middle">
                    <div className="max-w-[180px] space-y-1">
                      <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {item.source_name || "Sin fuente"}
                      </p>
                      {item.source_url ? (
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-secondary"
                        >
                          Abrir
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
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

function StoryThumbnail({ story }: { story: Story }) {
  const src =
    story.featured_media?.thumbnail_url ||
    story.featured_media?.variant_thumbnail ||
    story.featured_media?.file ||
    "";
  return <MediaThumbnail src={src} alt={story.title} />;
}
