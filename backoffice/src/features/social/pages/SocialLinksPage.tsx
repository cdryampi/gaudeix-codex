import { useEffect, useMemo, useState, type ElementType } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Globe2, Link2, Plus, Share2 } from "lucide-react";
import { SocialLinkDialog } from "../components/SocialLinkDialog";
import { SocialLinksTable } from "../components/SocialLinksTable";
import { CreateSocialLinkDTO, SocialLink } from "../types";
import { socialLinksApi } from "../api/socialLinks";

export function SocialLinksPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | undefined>();

  const stats = useMemo(() => {
    const total = links.length;
    const active = links.filter((l) => l.is_active).length;
    const multiLang = links.filter(
      (l) =>
        l.available_in_ca ||
        l.available_in_es ||
        l.available_in_en ||
        l.available_in_fr
    ).length;
    return { total, active, multiLang };
  }, [links]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const data = await socialLinksApi.getAll();
      setLinks(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching social links:", err);
      setError("Error al cargar los enlaces.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleCreate = () => {
    setEditingLink(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (link: SocialLink) => {
    setEditingLink(link);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Eliminar este enlace social?")) {
      try {
        await socialLinksApi.delete(id);
        await fetchLinks();
      } catch (err) {
        console.error("Error deleting social link:", err);
        alert("No se pudo eliminar el enlace.");
      }
    }
  };

  const handleSubmit = async (data: CreateSocialLinkDTO) => {
    try {
      if (editingLink) {
        await socialLinksApi.update(editingLink.id, data);
      } else {
        await socialLinksApi.create(data);
      }
      setIsDialogOpen(false);
      await fetchLinks();
    } catch (err) {
      console.error("Error saving social link:", err);
      alert("No se pudo guardar el enlace.");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Enlaces sociales"
        description="Gestiona los links de redes y canales externos"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo enlace
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <StatPill icon={Share2} label="Total" value={stats.total} tone="primary" />
        <StatPill icon={Globe2} label="Activos" value={stats.active} />
        <StatPill icon={Link2} label="Con idiomas" value={stats.multiLang} />
      </div>

      <Card className="border shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Cargando enlaces...
            </div>
          ) : error ? (
            <div className="flex h-48 items-center justify-center text-red-500">
              {error}
            </div>
          ) : (
            <SocialLinksTable
              links={links}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <SocialLinkDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        link={editingLink}
      />
    </PageContainer>
  );
}

type StatPillProps = {
  icon: ElementType;
  label: string;
  value: number;
  tone?: "primary" | "neutral";
};

function StatPill({ icon: Icon, label, value, tone = "neutral" }: StatPillProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          tone === "primary" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold text-foreground">{value}</p>
      </div>
      <Badge variant="outline" className="ml-auto text-xs">
        En vivo
      </Badge>
    </div>
  );
}
