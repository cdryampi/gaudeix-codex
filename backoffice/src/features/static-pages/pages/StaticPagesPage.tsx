import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { staticPagesApi } from "../api/staticPages";
import { StaticPage, StaticPagePayload, StaticPageTemplate } from "../types";
import { StaticPagesTable } from "../components/StaticPagesTable";
import { StaticPageDialog } from "../components/StaticPageDialog";
import { TEMPLATE_OPTIONS } from "../constants/templates";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

export function StaticPagesPage() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [search, setSearch] = useState("");
  const [templateFilter, setTemplateFilter] = useState<string>("");
  const [publishedFilter, setPublishedFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StaticPage | undefined>();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return pages.filter((p) => {
      const matchesSearch = `${p.slug} ${p.titulo} ${p.cuerpo ?? ""} ${p.template}`.toLowerCase().includes(q);
      const matchesTemplate = templateFilter ? p.template === templateFilter : true;
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
    } catch (err: any) {
      console.error(err);
      const detail = err?.response?.data?.template?.[0];
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
            <Button variant="outline" size="sm" onClick={fetchPages}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Recargar
            </Button>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva página
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por slug, título o cuerpo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
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
        <Badge variant="outline" className="font-normal">
          Total: {filtered.length}
        </Badge>
      </div>

      <Alert variant="destructive" className="mb-4">
        <TriangleAlert className="h-4 w-4" />
        <AlertTitle>Menús y estáticas son sensibles</AlertTitle>
        <AlertDescription className="text-sm">
          Cada plantilla es única y se muestra en la web pública. Evita cambios innecesarios en slugs, plantillas o documentos
          legales. Para crear nuevas páginas usa solo las plantillas predefinidas y revisa enlaces en el header/footer.
        </AlertDescription>
      </Alert>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">Cargando...</div>
          ) : error ? (
            <div className="flex h-40 items-center justify-center text-destructive">{error}</div>
          ) : (
            <StaticPagesTable pages={filtered} onEdit={(p) => { setEditing(p); setDialogOpen(true); }} onDelete={handleDelete} />
          )}
        </CardContent>
      </Card>

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
