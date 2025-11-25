import { SocialLink } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, ExternalLink, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  links: SocialLink[];
  onEdit: (link: SocialLink) => void;
  onDelete: (id: number) => void;
};

export function SocialLinksTable({ links, onEdit, onDelete }: Props) {
  return (
    <div className="w-full overflow-hidden rounded-xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="w-full overflow-x-auto">
        <table className="w-full table-auto caption-bottom text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <tr className="[&_th]:px-5 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold">
              <th>Nombre</th>
              <th>URL</th>
              <th>Icono</th>
              <th>Color</th>
              <th>Estado</th>
              <th>Orden</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {links.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  No hay enlaces sociales registrados.
                </td>
              </tr>
            ) : (
              links.map((link) => (
                <tr
                  key={link.id}
                  className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/80"
                >
                  <td className="px-5 py-4 align-middle font-semibold text-foreground">
                    {link.name}
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="truncate max-w-[220px]">{link.url}</span>
                    </a>
                  </td>
                  <td className="px-5 py-4 align-middle text-xs text-muted-foreground">
                    {link.icon_class || "-"}
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <span
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
                        "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                      )}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-slate-200"
                        style={{ backgroundColor: link.color || "#000000" }}
                      />
                      {link.color}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    {link.is_active ? (
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-200">
                        Activo
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 dark:bg-rose-900/30 dark:text-rose-200">
                        Inactivo
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-4 align-middle text-sm text-muted-foreground">
                    {link.order}
                  </td>
                  <td className="px-5 py-4 align-middle text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-200"
                        onClick={() => onEdit(link)}
                        aria-label={`Editar ${link.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-200 dark:hover:bg-rose-900/30"
                        onClick={() => onDelete(link.id)}
                        aria-label={`Eliminar ${link.name}`}
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
      </div>
    </div>
  );
}
