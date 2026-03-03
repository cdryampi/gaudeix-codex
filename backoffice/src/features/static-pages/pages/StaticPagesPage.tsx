import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { staticPagesApi } from "../api/staticPages";
import { StaticPage, StaticPagePayload } from "../types";
import { StaticPagesTable } from "../components/StaticPagesTable";
import { StaticPageDialog } from "../components/StaticPageDialog";
import { TEMPLATE_OPTIONS } from "../constants/templates";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import { envConfig } from "@/lib/config/env";

export function StaticPagesPage() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [search, setSearch] = useState("");
  const [templateFilter, setTemplateFilter] = useState<string>("");
  const [publishedFilter, setPublishedFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StaticPage | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(envConfig.events.pageSizeDefault);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return pages.filter((p) => {
      const matchesSearch =
        `${p.slug} ${p.titulo} ${p.cuerpo ?? ""} ${p.template}`
          .toLowerCase()
          .includes(q);
      const matchesTemplate = templateFilter
        ? p.template === templateFilter
        : true;
      const matchesPublished =
        publishedFilter === ""
          ? true
          : publishedFilter === "true"
            ? p.is_published
            : publishedFilter === "false"
              ? !p.is_published
              : true;
      return matchesSearch && matchesTemplate && matchesPublished;
    });
  }, [pages, search, templateFilter, publishedFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await staticPagesApi.list();
      setPages(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las páginas estáticas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, templateFilter, publishedFilter, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleSubmit = async (payload: StaticPagePayload) => {
    try {
      if (editing) {
        await staticPagesApi.update(editing.id, payload);
        toast.success("Página actualizada");
      } else {
        await staticPagesApi.create(payload);
        toast.success("Página creada");
      }
      setDialogOpen(false);
      setEditing(undefined);
      fetchPages();
    } catch (err: unknown) {
      console.error(err);
      const apiError = err as { response?: { data?: { template?: string[] } } };
      const detail = apiError?.response?.data?.template?.[0];
      toast.error("No se pudo guardar la página", { description: detail });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await staticPagesApi.remove(id);
      toast.success("Página eliminada");
      fetchPages();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar la página");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Páginas estáticas"
        description="Gestiona plantillas predefinidas (info point, privacidad, legal, cookies, contacto, inclusió)."
        actions={
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva página
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
          <Input
            placeholder="Buscar por slug, título o cuerpo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <option value="">Todas las plantillas</option>
              {TEMPLATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={publishedFilter}
              onChange={(e) => setPublishedFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <option value="">Publicación (todas)</option>
              <option value="true">Publicadas</option>
              <option value="false">Borradores</option>
            </select>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} / pág
                </option>
              ))}
            </select>
          </div>
        </div>
        <Badge variant="secondary" className="w-fit px-3 py-1 text-xs">
          {filtered.length} páginas
        </Badge>
      </div>

      <Alert variant="destructive" className="mb-4">
        <TriangleAlert className="h-4 w-4" />
        <AlertTitle>Menús y estáticas son sensibles</AlertTitle>
        <AlertDescription className="text-sm">
          Cada plantilla es única y se muestra en la web pública. Evita cambios
          innecesarios en slugs, plantillas o documentos legales. Para crear
          nuevas páginas usa solo las plantillas predefinidas y revisa enlaces
          en el header/footer.
        </AlertDescription>
      </Alert>

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
            <StaticPagesTable
              pages={paginated}
              onEdit={(p) => {
                setEditing(p);
                setDialogOpen(true);
              }}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <span>
          Página {page} de {totalPages} • {filtered.length} resultados
        </span>
        <div className="w-full md:w-auto">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      <StaticPageDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setEditing(undefined);
        }}
        onSubmit={handleSubmit}
        page={editing}
      />
    </PageContainer>
  );
}
