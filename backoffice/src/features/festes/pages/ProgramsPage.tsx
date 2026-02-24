/**
 * Programs management page.
 */
import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ProgramDialog } from "../components/ProgramDialog";
import { festesApi } from "../api/festes";
import { programsApi } from "../api/programs";
import { CreateProgramDTO, Festa, Program } from "../types";

export function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [festes, setFestes] = useState<Festa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | undefined>();
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [festaSlug, setFestaSlug] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const festesById = useMemo(() => {
    return new Map(festes.map((festa) => [festa.id, festa]));
  }, [festes]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, any> = {
        page,
        page_size: pageSize,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (status !== "all") {
        params.status = status;
      }

      if (festaSlug) {
        params.festa = festaSlug;
      }

      const programsData = await programsApi.getAll(params);
      setPrograms(programsData.results);
      setTotalCount(programsData.count);
    } catch (err) {
      console.error("Error fetching programs:", err);
      setError("Error al cargar los programas.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFestes = async () => {
    try {
      const festesData = await festesApi.getAll();
      setFestes(festesData);
    } catch (err) {
      console.error("Error fetching festes:", err);
    }
  };

  useEffect(() => {
    fetchFestes();
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [page, pageSize, search, status, festaSlug]);

  const handleCreate = () => {
    setEditingProgram(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (program: Program) => {
    setEditingProgram(program);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteSlug) return;
    try {
      await programsApi.delete(deleteSlug);
      await fetchPrograms();
      toast.success("Programa eliminado correctamente");
    } catch (err) {
      console.error("Error deleting program:", err);
      toast.error("No se pudo eliminar el programa");
    } finally {
      setDeleteSlug(null);
    }
  };

  const handleSubmit = async (data: CreateProgramDTO) => {
    try {
      if (editingProgram) {
        const { festa_id, ...updatePayload } = data;
        await programsApi.update(editingProgram.slug, updatePayload);
        toast.success("Programa actualizado correctamente");
      } else {
        await programsApi.create(data);
        toast.success("Programa creado correctamente");
      }
      setIsDialogOpen(false);
      await fetchPrograms();
    } catch (err) {
      console.error("Error saving program:", err);
      toast.error("No se pudo guardar el programa");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Programas"
        description="Gestiona los programas de actividades de cada festa"
        actions={
          <Button onClick={handleCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo programa
          </Button>
        }
      />

      <div className="mb-6 space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Buscar</Label>
            <Input
              placeholder="Título, slug o festa..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Estado</Label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as "all" | "published" | "draft");
                setPage(1);
              }}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">Todos</option>
              <option value="published">Publicados</option>
              <option value="draft">Borradores</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Festa</Label>
            <select
              value={festaSlug}
              onChange={(e) => {
                setFestaSlug(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Todas</option>
              {festes.map((festa) => (
                <option key={festa.slug} value={festa.slug}>
                  {festa.title} ({festa.year})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Label className="text-xs text-muted-foreground">Ver:</Label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="h-8 rounded border border-border bg-card px-2 text-xs"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Cargando programas...
            </div>
          ) : error ? (
            <div className="flex h-48 items-center justify-center text-destructive">
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] table-auto caption-bottom text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr className="[&_th]:px-5 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold">
                    <th>Título</th>
                    <th>Festa</th>
                    <th>Fechas</th>
                    <th>Orden</th>
                    <th>Estado</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {programs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-6 text-center text-muted-foreground"
                      >
                        No hay programas creados.
                      </td>
                    </tr>
                  ) : (
                    programs.map((program) => (
                      <tr key={program.id} className="transition-colors hover:bg-muted/30">
                        <td className="px-5 py-4">
                          <p className="font-semibold">{program.title}</p>
                          <p className="text-xs text-muted-foreground">{program.slug}</p>
                          {program.subtitle && (
                            <p className="text-xs text-muted-foreground mt-1">{program.subtitle}</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {festesById.get(program.festa)?.title || program.festa_slug}
                        </td>
                        <td className="px-5 py-4">
                          <span>
                            {program.start_date || "-"} {"->"} {program.end_date || "-"}
                          </span>
                        </td>
                        <td className="px-5 py-4">{program.order}</td>
                        <td className="px-5 py-4">
                          {program.is_published ? (
                            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                              Publicado
                            </Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground border-border hover:bg-muted">
                              Borrador
                            </Badge>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(program)}
                              aria-label={`Editar ${program.title}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteSlug(program.slug)}
                              aria-label={`Eliminar ${program.title}`}
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
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <span>
          Página {page} de {totalPages} • {totalCount} resultados
        </span>
        <div className="w-full md:w-auto">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      <ProgramDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        program={editingProgram}
        festes={festes}
      />

      <AlertDialog open={deleteSlug !== null} onOpenChange={() => setDeleteSlug(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar programa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
