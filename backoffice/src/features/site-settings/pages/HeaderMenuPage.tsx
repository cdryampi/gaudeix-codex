import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert, Plus } from "lucide-react";
import { toast } from "sonner";

import { categoriesApi } from "@/features/categories/api/categories";
import { Category } from "@/features/categories/types";
import { staticPagesApi } from "@/features/static-pages/api/staticPages";
import { StaticPage } from "@/features/static-pages/types";
import { menuItemsApi } from "../api/menuItems";
import { MenuItem, MenuItemPayload, MenuItemType } from "../types/menuItems";

type MenuItemWithDepth = { item: MenuItem; depth: number };

type FormState = {
  id?: number;
  location: "header";
  parent: number | null;
  order: number;
  type: MenuItemType;
  category_id: number | null;
  static_page_id: number | null;
  url: string;
  label: string;
};

function defaults(): FormState {
  return {
    location: "header",
    parent: null,
    order: 0,
    type: "category",
    category_id: null,
    static_page_id: null,
    url: "",
    label: "",
  };
}

function getDisplayLabel(item: MenuItem): string {
  if (item.type === "category") {
    return (
      item.category?.nombre ||
      (item.category_id ? `Categoría #${item.category_id}` : "Categoría")
    );
  }
  if (item.type === "static_page") {
    return (
      item.static_page?.titulo ||
      (item.static_page_id ? `Página #${item.static_page_id}` : "Página")
    );
  }
  return item.label || item.url || "Link";
}

function buildOrderedWithDepth(items: MenuItem[]): MenuItemWithDepth[] {
  const byParent = new Map<number | null, MenuItem[]>();
  for (const item of items) {
    const key = item.parent ?? null;
    const bucket = byParent.get(key) ?? [];
    bucket.push(item);
    byParent.set(key, bucket);
  }
  for (const siblings of byParent.values()) {
    siblings.sort((a, b) => a.order - b.order || a.id - b.id);
  }

  const result: MenuItemWithDepth[] = [];
  const seen = new Set<number>();

  const walk = (parentId: number | null, depth: number, stack: Set<number>) => {
    const children = byParent.get(parentId) ?? [];
    for (const child of children) {
      if (stack.has(child.id)) continue; // safety against inconsistent data
      if (!seen.has(child.id)) {
        result.push({ item: child, depth });
        seen.add(child.id);
      }
      const nextStack = new Set(stack);
      nextStack.add(child.id);
      walk(child.id, depth + 1, nextStack);
    }
  };

  walk(null, 0, new Set());

  // Orphans fallback (should not happen normally)
  const orphans = items
    .filter((i) => !seen.has(i.id))
    .sort((a, b) => a.order - b.order || a.id - b.id);
  for (const orphan of orphans) {
    result.push({ item: orphan, depth: 0 });
  }

  return result;
}

export function HeaderMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(defaults());
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [menuItems, cats, staticPages] = await Promise.all([
        menuItemsApi.list({ location: "header" }),
        categoriesApi.list(),
        staticPagesApi.list(),
      ]);
      setItems(menuItems);
      setCategories(cats);
      setPages(staticPages);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los ítems del header");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const ordered = useMemo(() => buildOrderedWithDepth(items), [items]);
  const labelById = useMemo(() => {
    const map = new Map<number, string>();
    for (const entry of ordered) {
      map.set(entry.item.id, getDisplayLabel(entry.item));
    }
    return map;
  }, [ordered]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ordered.filter(({ item }) => {
      const label = getDisplayLabel(item);
      return `${label} ${item.url || ""} ${item.type} ${item.order}`
        .toLowerCase()
        .includes(q);
    });
  }, [ordered, search]);

  const parentsOptions = useMemo(() => {
    const candidates = ordered.filter(({ item }) => item.id !== form.id);
    return candidates.map(({ item, depth }) => ({
      id: item.id,
      depth,
      label: getDisplayLabel(item),
    }));
  }, [form.id, ordered]);

  const openCreate = () => {
    setForm(defaults());
    setDialogOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setForm({
      id: item.id,
      location: "header",
      parent: item.parent ?? null,
      order: item.order ?? 0,
      type: item.type,
      category_id: item.category?.id ?? item.category_id ?? null,
      static_page_id: item.static_page?.id ?? item.static_page_id ?? null,
      url: item.url || "",
      label: item.label || "",
    });
    setDialogOpen(true);
  };

  const handleChange = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload: MenuItemPayload = {
        location: "header",
        parent: form.parent,
        order: Number(form.order) || 0,
        type: form.type,
        label: form.label,
        url: form.url,
        category_id: form.type === "category" ? form.category_id : null,
        static_page_id:
          form.type === "static_page" ? form.static_page_id : null,
      };

      if (form.id) {
        await menuItemsApi.update(form.id, payload);
        toast.success("Ítem actualizado");
      } else {
        await menuItemsApi.create(payload);
        toast.success("Ítem creado");
      }
      setDialogOpen(false);
      fetchAll();
    } catch (err: unknown) {
      console.error(err);
      const apiError = err as {
        response?: {
          data?: { type?: string[]; url?: string[]; label?: string[] };
        };
      };
      const detail =
        apiError?.response?.data?.type?.[0] ||
        apiError?.response?.data?.url?.[0] ||
        apiError?.response?.data?.label?.[0];
      toast.error("No se pudo guardar el ítem", { description: detail });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await menuItemsApi.remove(id);
      toast.success("Ítem eliminado");
      fetchAll();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar el ítem");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Header"
        description="Configura el menú principal del header (categorías, páginas estáticas o links)."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo ítem
          </Button>
        }
      />

      <Alert variant="destructive" className="mb-4 w-3/4">
        <TriangleAlert className="h-4 w-4" />
        <AlertTitle>Menú sensible</AlertTitle>
        <AlertDescription className="text-sm">
          Máximo 3 niveles (raíz → hijo → nieto). Evita ciclos y revisa en web
          tras guardar.
        </AlertDescription>
      </Alert>

      <div className="mb-4 flex items-center gap-3">
        <Input
          placeholder="Buscar por etiqueta o tipo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              Cargando...
            </div>
          ) : error ? (
            <div className="flex h-40 items-center justify-center text-destructive">
              {error}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Etiqueta</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Padre</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(({ item, depth }) => {
                  const displayLabel = getDisplayLabel(item);
                  const parentLabel =
                    item.parent == null
                      ? "—"
                      : labelById.get(item.parent) || `#${item.parent}`;

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div
                          className="flex items-center gap-2"
                          style={{ paddingLeft: depth * 12 }}
                        >
                          {depth > 0 ? (
                            <span className="text-muted-foreground">↳</span>
                          ) : null}
                          <span>{displayLabel}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{parentLabel}</TableCell>
                      <TableCell>{item.order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(item)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(v) => setDialogOpen(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar ítem" : "Nuevo ítem"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <select
                value={form.type}
                onChange={(e) =>
                  handleChange("type", e.target.value as MenuItemType)
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <option value="category">Categoría</option>
                <option value="static_page">Página estática</option>
                <option value="custom">Link personalizado</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Padre (opcional)</Label>
              <select
                value={form.parent ?? ""}
                onChange={(e) =>
                  handleChange(
                    "parent",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <option value="">Sin padre (nivel raíz)</option>
                {parentsOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {`${"\u00A0".repeat(p.depth * 3)}${p.label}`}
                  </option>
                ))}
              </select>
            </div>

            {form.type === "category" && (
              <div className="space-y-2 md:col-span-2">
                <Label>Categoría</Label>
                <select
                  value={form.category_id ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "category_id",
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <option value="">Selecciona categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.slug})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {form.type === "static_page" && (
              <div className="space-y-2 md:col-span-2">
                <Label>Página estática</Label>
                <select
                  value={form.static_page_id ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "static_page_id",
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <option value="">Selecciona página</option>
                  {pages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.titulo} ({p.template})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {form.type === "custom" && (
              <>
                <div className="space-y-2 md:col-span-2">
                  <Label>Etiqueta</Label>
                  <Input
                    value={form.label}
                    onChange={(e) => handleChange("label", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>URL</Label>
                  <Input
                    value={form.url}
                    onChange={(e) => handleChange("url", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Orden</Label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) => handleChange("order", Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Menor = más arriba dentro del mismo nivel.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
