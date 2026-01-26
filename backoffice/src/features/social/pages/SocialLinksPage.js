import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { Globe2, Link2, Plus, Share2 } from "lucide-react";
import { SocialLinkDialog } from "../components/SocialLinkDialog";
import { SocialLinksTable } from "../components/SocialLinksTable";
import { socialLinksApi } from "../api/socialLinks";
export function SocialLinksPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState();
  const [deleteLinkId, setDeleteLinkId] = useState(null);
  const stats = useMemo(() => {
    const total = links.length;
    const active = links.filter((l) => l.is_active).length;
    const multiLang = links.filter(
      (l) =>
        l.available_in_ca ||
        l.available_in_es ||
        l.available_in_en ||
        l.available_in_fr,
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
  const handleEdit = (link) => {
    setEditingLink(link);
    setIsDialogOpen(true);
  };
  const handleDelete = async (id) => {
    setDeleteLinkId(id);
  };
  const handleDeleteConfirm = async () => {
    if (!deleteLinkId) return;
    try {
      await socialLinksApi.delete(deleteLinkId);
      await fetchLinks();
      toast.success("Enlace eliminado correctamente");
    } catch (err) {
      console.error("Error deleting social link:", err);
      toast.error("No se pudo eliminar el enlace");
    } finally {
      setDeleteLinkId(null);
    }
  };
  const handleSubmit = async (data) => {
    try {
      if (editingLink) {
        await socialLinksApi.update(editingLink.id, data);
        toast.success("Enlace actualizado correctamente");
      } else {
        await socialLinksApi.create(data);
        toast.success("Enlace creado correctamente");
      }
      setIsDialogOpen(false);
      await fetchLinks();
    } catch (err) {
      console.error("Error saving social link:", err);
      toast.error("No se pudo guardar el enlace");
    }
  };
  return _jsxs(PageContainer, {
    children: [
      _jsx(PageHeader, {
        title: "Enlaces sociales",
        description: "Gestiona los links de redes y canales externos",
        actions: _jsxs(Button, {
          onClick: handleCreate,
          children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Nuevo enlace"],
        }),
      }),
      _jsxs("div", {
        className: "mb-4 grid gap-3 md:grid-cols-3",
        children: [
          _jsx(StatPill, {
            icon: Share2,
            label: "Total",
            value: stats.total,
            tone: "primary",
          }),
          _jsx(StatPill, {
            icon: Globe2,
            label: "Activos",
            value: stats.active,
          }),
          _jsx(StatPill, {
            icon: Link2,
            label: "Con idiomas",
            value: stats.multiLang,
          }),
        ],
      }),
      _jsx(Card, {
        className: "border shadow-sm",
        children: _jsx(CardContent, {
          className: "p-0",
          children: loading
            ? _jsx("div", {
                className:
                  "flex h-48 items-center justify-center text-muted-foreground",
                children: "Cargando enlaces...",
              })
            : error
              ? _jsx("div", {
                  className:
                    "flex h-48 items-center justify-center text-red-500",
                  children: error,
                })
              : _jsx(SocialLinksTable, {
                  links: links,
                  onEdit: handleEdit,
                  onDelete: handleDelete,
                }),
        }),
      }),
      _jsx(SocialLinkDialog, {
        open: isDialogOpen,
        onOpenChange: setIsDialogOpen,
        onSubmit: handleSubmit,
        link: editingLink,
      }),
      _jsx(AlertDialog, {
        open: deleteLinkId !== null,
        onOpenChange: () => setDeleteLinkId(null),
        children: _jsxs(AlertDialogContent, {
          children: [
            _jsxs(AlertDialogHeader, {
              children: [
                _jsx(AlertDialogTitle, {
                  children: "\u00BFEst\u00E1s seguro?",
                }),
                _jsx(AlertDialogDescription, {
                  children:
                    "Esta acci\u00F3n no se puede deshacer. El enlace social ser\u00E1 eliminado permanentemente.",
                }),
              ],
            }),
            _jsxs(AlertDialogFooter, {
              children: [
                _jsx(AlertDialogCancel, { children: "Cancelar" }),
                _jsx(AlertDialogAction, {
                  onClick: handleDeleteConfirm,
                  className:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                  children: "Eliminar",
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
}
function StatPill({ icon: Icon, label, value, tone = "neutral" }) {
  return _jsxs("div", {
    className:
      "flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 shadow-sm hover:shadow-md transition-shadow",
    children: [
      _jsx("div", {
        className: `flex h-10 w-10 items-center justify-center rounded-lg ${
          tone === "primary"
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        }`,
        children: _jsx(Icon, { className: "h-5 w-5" }),
      }),
      _jsxs("div", {
        children: [
          _jsx("p", {
            className: "text-xs font-medium text-muted-foreground",
            children: label,
          }),
          _jsx("p", {
            className: "text-lg font-semibold text-foreground",
            children: value,
          }),
        ],
      }),
      _jsx(Badge, {
        variant: "outline",
        className: "ml-auto text-xs",
        children: "En vivo",
      }),
    ],
  });
}
