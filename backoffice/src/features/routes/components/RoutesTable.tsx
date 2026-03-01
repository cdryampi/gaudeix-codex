/**
 * Routes table component.
 */
import { Route } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, Trash2, Mountain, Bike, Users, Shuffle } from "lucide-react";
import { MediaThumbnail } from "@/components/common/MediaThumbnail";

type Props = {
  routes: Route[];
  onEdit: (route: Route) => void;
  onDelete: (slug: string) => void;
};

const routeTypeIcons: Record<string, typeof Mountain> = {
  walking: Mountain,
  cycling: Bike,
  guided: Users,
  mixed: Shuffle,
};

const routeTypeLabels: Record<string, string> = {
  walking: "A peu",
  cycling: "Bicicleta",
  guided: "Guiada",
  mixed: "Mixta",
};

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-700 border-green-200",
  moderate: "bg-yellow-100 text-yellow-700 border-yellow-200",
  difficult: "bg-orange-100 text-orange-700 border-orange-200",
  expert: "bg-red-100 text-red-700 border-red-200",
};

const difficultyLabels: Record<string, string> = {
  easy: "Fàcil",
  moderate: "Moderada",
  difficult: "Difícil",
  expert: "Expert",
};

export function RoutesTable({ routes, onEdit, onDelete }: Props) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <ScrollArea className="w-full">
        <table className="w-full min-w-[820px] table-auto caption-bottom text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr className="[&_th]:px-5 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold">
              <th>Título</th>
              <th>Tipo</th>
              <th>Dificultad</th>
              <th>Distancia</th>
              <th>Duración</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {routes.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-0">
                  <EmptyState
                    title="No hay rutas"
                    description="Actualmente no hay rutas creadas. Haz clic en 'Nueva ruta' para empezar."
                    icon={Shuffle}
                  />
                </td>
              </tr>
            ) : (
              routes.map((route) => {
                const TypeIcon = routeTypeIcons[route.route_type] || Mountain;
                return (
                  <tr
                    key={route.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-start gap-3">
                        <RouteThumbnail route={route} />
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">
                            {route.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {route.slug}
                          </p>
                          {route.is_circular && (
                            <Badge variant="outline" className="text-[10px]">
                              Circular
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {routeTypeLabels[route.route_type] ||
                            route.route_type}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <Badge
                        variant="outline"
                        className={difficultyColors[route.difficulty] || ""}
                      >
                        {difficultyLabels[route.difficulty] || route.difficulty}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <span className="text-sm">
                        {route.distance_km ? `${route.distance_km} km` : "-"}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <span className="text-sm">
                        {route.duration_formatted || "-"}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      {route.is_published ? (
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">
                          Publicada
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
                          onClick={() => onEdit(route)}
                          aria-label={`Editar ${route.title}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onDelete(route.slug)}
                          aria-label={`Eliminar ${route.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}

function RouteThumbnail({ route }: { route: Route }) {
  const src =
    route.featured_media?.thumbnail_url ||
    route.featured_media?.file ||
    route.image_url ||
    "";
  return <MediaThumbnail src={src} alt={route.title} />;
}
