import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search, ShieldCheck, Share2, Stamp } from "lucide-react";
import { toast } from "sonner";

import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageSelector } from "@/features/media/components/ImageSelector";
import { MediaItem } from "@/features/media/types";
import { categoriesApi } from "@/features/categories/api/categories";
import { Category } from "@/features/categories/types";
import { staticPagesApi } from "@/features/static-pages/api/staticPages";
import { StaticPage } from "@/features/static-pages/types";
import { ROUTES } from "@/lib/config/constants";
import { footerBadgesApi } from "../api/footerBadges";
import { footerLinksApi } from "../api/footerLinks";
import { footerSettingsApi } from "../api/footerSettings";
import {
  FooterBadge,
  FooterBadgePayload,
  FooterLink,
  FooterLinkPayload,
  FooterLinkSection,
  FooterLinkType,
  FooterPublicPayload,
  FooterSettings,
  FooterSettingsPayload,
  LinkedImage,
} from "../types";

const TAB_VALUES = ["settings", "links", "badges"] as const;
type FooterTab = (typeof TAB_VALUES)[number];

type FooterSettingsForm = FooterSettingsPayload;

type FooterLinkForm = {
  id?: number;
  section: FooterLinkSection;
  type: FooterLinkType;
  category_id: number | null;
  static_page_id: number | null;
  label: string;
  url: string;
  order: number;
  is_active: boolean;
};

type FooterBadgeForm = {
  id?: number;
  title: string;
  alt_text: string;
  url: string;
  image_id: number | null;
  image: LinkedImage | null;
  order: number;
  is_active: boolean;
};

const SECTION_LABELS: Record<FooterLinkSection, string> = {
  explore: "Explorar",
  institutional: "Institucional",
};

const TYPE_LABELS: Record<FooterLinkType, string> = {
  category: "Categoria",
  static_page: "Pagina estatica",
  custom: "Link personalizado",
};

function getTabValue(rawValue: string | null): FooterTab {
  if (rawValue && TAB_VALUES.includes(rawValue as FooterTab)) {
    return rawValue as FooterTab;
  }
  return "settings";
}

function createDefaultSettingsForm(): FooterSettingsForm {
  return {
    eyebrow: "",
    title: "",
    description: "",
    show_social_links: true,
    show_contact_block: true,
    show_badges_block: true,
    copyright_text: "",
  };
}

function createDefaultLinkForm(): FooterLinkForm {
  return {
    section: "explore",
    type: "category",
    category_id: null,
    static_page_id: null,
    label: "",
    url: "",
    order: 0,
    is_active: true,
  };
}

function createDefaultBadgeForm(): FooterBadgeForm {
  return {
    title: "",
    alt_text: "",
    url: "",
    image_id: null,
    image: null,
    order: 0,
    is_active: true,
  };
}

function mapSettingsToForm(settings: FooterSettings): FooterSettingsForm {
  return {
    eyebrow: settings.eyebrow || "",
    title: settings.title || "",
    description: settings.description || "",
    show_social_links: settings.show_social_links,
    show_contact_block: settings.show_contact_block,
    show_badges_block: settings.show_badges_block,
    copyright_text: settings.copyright_text || "",
  };
}

function mapLinkToForm(link: FooterLink): FooterLinkForm {
  return {
    id: link.id,
    section: link.section,
    type: link.type,
    category_id: link.category?.id ?? link.category_id ?? null,
    static_page_id: link.static_page?.id ?? link.static_page_id ?? null,
    label: link.label || "",
    url: link.url || "",
    order: link.order ?? 0,
    is_active: link.is_active ?? true,
  };
}

function mapBadgeToForm(badge: FooterBadge): FooterBadgeForm {
  return {
    id: badge.id,
    title: badge.title || "",
    alt_text: badge.alt_text || "",
    url: badge.url || "",
    image_id: badge.image?.id ?? badge.image_id ?? null,
    image: badge.image ?? null,
    order: badge.order ?? 0,
    is_active: badge.is_active ?? true,
  };
}

function buildLinkPayload(form: FooterLinkForm): FooterLinkPayload {
  return {
    section: form.section,
    type: form.type,
    label: form.type === "custom" ? form.label : "",
    url: form.type === "custom" ? form.url : "",
    category_id: form.type === "category" ? form.category_id : null,
    static_page_id: form.type === "static_page" ? form.static_page_id : null,
    order: Number(form.order) || 0,
    is_active: form.is_active,
  };
}

function buildBadgePayload(form: FooterBadgeForm): FooterBadgePayload {
  return {
    title: form.title,
    alt_text: form.alt_text,
    url: form.url,
    image_id: form.image_id,
    order: Number(form.order) || 0,
    is_active: form.is_active,
  };
}

function getLinkDestination(link: FooterLink): string {
  if (link.type === "category") {
    return (
      link.category?.nombre ||
      (link.category_id ? `Categoria #${link.category_id}` : "Categoria")
    );
  }
  if (link.type === "static_page") {
    return (
      link.static_page?.titulo ||
      (link.static_page_id ? `Pagina #${link.static_page_id}` : "Pagina")
    );
  }
  return link.label || link.url || "Link personalizado";
}

function getLegalSummary(publicData?: FooterPublicPayload | null) {
  if (!publicData) return [];
  return [
    {
      key: "privacy",
      label: "Privacidad",
      page: publicData.legal.privacy_page,
    },
    { key: "cookies", label: "Cookies", page: publicData.legal.cookies_page },
    { key: "legal", label: "Aviso legal", page: publicData.legal.legal_page },
    {
      key: "inclusion",
      label: "Inclusion",
      page: publicData.legal.inclusion_page,
    },
  ];
}

function getSocialSummary(publicData?: FooterPublicPayload | null) {
  if (!publicData) return [];
  return [
    {
      key: "facebook",
      label: "Facebook",
      value: publicData.social.facebook_url,
    },
    {
      key: "instagram",
      label: "Instagram",
      value: publicData.social.instagram_url,
    },
    { key: "twitter", label: "Twitter", value: publicData.social.twitter_url },
    { key: "youtube", label: "YouTube", value: publicData.social.youtube_url },
  ];
}

export function FooterSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = getTabValue(searchParams.get("tab"));

  const [publicData, setPublicData] = useState<FooterPublicPayload | null>(
    null,
  );
  const [links, setLinks] = useState<FooterLink[]>([]);
  const [badges, setBadges] = useState<FooterBadge[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [settingsForm, setSettingsForm] = useState<FooterSettingsForm>(
    createDefaultSettingsForm(),
  );
  const [linkForm, setLinkForm] = useState<FooterLinkForm>(
    createDefaultLinkForm(),
  );
  const [badgeForm, setBadgeForm] = useState<FooterBadgeForm>(
    createDefaultBadgeForm(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingLink, setSavingLink] = useState(false);
  const [savingBadge, setSavingBadge] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false);
  const [badgeImageSelectorOpen, setBadgeImageSelectorOpen] = useState(false);
  const [linkSearch, setLinkSearch] = useState("");
  const [badgeSearch, setBadgeSearch] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        footerSettings,
        footerPublic,
        footerLinks,
        footerBadges,
        siteCategories,
        staticPages,
      ] = await Promise.all([
        footerSettingsApi.get(),
        footerSettingsApi.getPublic(),
        footerLinksApi.list(),
        footerBadgesApi.list(),
        categoriesApi.list(),
        staticPagesApi.list(),
      ]);

      setPublicData(footerPublic);
      setLinks(footerLinks);
      setBadges(footerBadges);
      setCategories(siteCategories);
      setPages(staticPages);
      setSettingsForm(mapSettingsToForm(footerSettings));
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la configuracion del footer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const legalSummary = useMemo(() => getLegalSummary(publicData), [publicData]);
  const socialSummary = useMemo(
    () => getSocialSummary(publicData),
    [publicData],
  );

  const filteredLinks = useMemo(() => {
    const query = linkSearch.trim().toLowerCase();
    const sorted = [...links].sort((a, b) => a.order - b.order || a.id - b.id);
    if (!query) return sorted;

    return sorted.filter((link) => {
      const destination = getLinkDestination(link);
      return `${SECTION_LABELS[link.section]} ${TYPE_LABELS[link.type]} ${destination} ${link.url} ${link.order}`
        .toLowerCase()
        .includes(query);
    });
  }, [links, linkSearch]);

  const filteredBadges = useMemo(() => {
    const query = badgeSearch.trim().toLowerCase();
    const sorted = [...badges].sort((a, b) => a.order - b.order || a.id - b.id);
    if (!query) return sorted;

    return sorted.filter((badge) =>
      `${badge.title} ${badge.alt_text} ${badge.url} ${badge.order}`
        .toLowerCase()
        .includes(query),
    );
  }, [badges, badgeSearch]);

  const updateTab = (tab: FooterTab) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", tab);
    setSearchParams(nextParams, { replace: true });
  };

  const updateSettingsField = <K extends keyof FooterSettingsForm>(
    field: K,
    value: FooterSettingsForm[K],
  ) => {
    setSettingsForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateLinkField = <K extends keyof FooterLinkForm>(
    field: K,
    value: FooterLinkForm[K],
  ) => {
    setLinkForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateBadgeField = <K extends keyof FooterBadgeForm>(
    field: K,
    value: FooterBadgeForm[K],
  ) => {
    setBadgeForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreateLink = () => {
    setLinkForm(createDefaultLinkForm());
    setLinkDialogOpen(true);
  };

  const openEditLink = (link: FooterLink) => {
    setLinkForm(mapLinkToForm(link));
    setLinkDialogOpen(true);
  };

  const openCreateBadge = () => {
    setBadgeForm(createDefaultBadgeForm());
    setBadgeDialogOpen(true);
  };

  const openEditBadge = (badge: FooterBadge) => {
    setBadgeForm(mapBadgeToForm(badge));
    setBadgeDialogOpen(true);
  };

  const handleLinkTypeChange = (type: FooterLinkType) => {
    setLinkForm((prev) => ({
      ...prev,
      type,
      category_id: type === "category" ? prev.category_id : null,
      static_page_id: type === "static_page" ? prev.static_page_id : null,
      label: type === "custom" ? prev.label : "",
      url: type === "custom" ? prev.url : "",
    }));
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const updatedSettings = await footerSettingsApi.update(settingsForm);
      const refreshedPublicData = await footerSettingsApi.getPublic();
      setPublicData(refreshedPublicData);
      setSettingsForm(mapSettingsToForm(updatedSettings));
      toast.success("Footer actualizado.");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo guardar la configuracion del footer.");
    } finally {
      setSavingSettings(false);
    }
  };

  const refreshLinks = async () => {
    const data = await footerLinksApi.list();
    setLinks(data);
  };

  const refreshBadges = async () => {
    const data = await footerBadgesApi.list();
    setBadges(data);
  };

  const handleSaveLink = async () => {
    setSavingLink(true);
    try {
      const payload = buildLinkPayload(linkForm);

      if (linkForm.id) {
        await footerLinksApi.update(linkForm.id, payload);
        toast.success("Enlace actualizado.");
      } else {
        await footerLinksApi.create(payload);
        toast.success("Enlace creado.");
      }

      await refreshLinks();
      setLinkDialogOpen(false);
      setLinkForm(createDefaultLinkForm());
    } catch (err) {
      console.error(err);
      toast.error("No se pudo guardar el enlace.");
    } finally {
      setSavingLink(false);
    }
  };

  const handleDeleteLink = async (id: number) => {
    try {
      await footerLinksApi.remove(id);
      await refreshLinks();
      toast.success("Enlace eliminado.");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar el enlace.");
    }
  };

  const handleSaveBadge = async () => {
    setSavingBadge(true);
    try {
      const payload = buildBadgePayload(badgeForm);

      if (badgeForm.id) {
        await footerBadgesApi.update(badgeForm.id, payload);
        toast.success("Sello actualizado.");
      } else {
        await footerBadgesApi.create(payload);
        toast.success("Sello creado.");
      }

      await refreshBadges();
      setBadgeDialogOpen(false);
      setBadgeForm(createDefaultBadgeForm());
    } catch (err) {
      console.error(err);
      toast.error("No se pudo guardar el sello.");
    } finally {
      setSavingBadge(false);
    }
  };

  const handleDeleteBadge = async (id: number) => {
    try {
      await footerBadgesApi.remove(id);
      await refreshBadges();
      toast.success("Sello eliminado.");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar el sello.");
    }
  };

  const pageActions =
    activeTab === "links" ? (
      <Button size="sm" onClick={openCreateLink}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo enlace
      </Button>
    ) : activeTab === "badges" ? (
      <Button size="sm" onClick={openCreateBadge}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo sello
      </Button>
    ) : null;

  return (
    <PageContainer>
      <PageHeader
        title="Footer"
        description="Gestiona la configuracion, enlaces y sellos del footer modular."
        actions={pageActions}
      />

      {loading ? (
        <Card>
          <CardContent className="flex h-40 items-center justify-center text-muted-foreground">
            Cargando footer...
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="flex h-40 items-center justify-center text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={(value) => updateTab(value as FooterTab)}
        >
          <TabsList className="mb-2">
            <TabsTrigger value="settings">Configuracion</TabsTrigger>
            <TabsTrigger value="links">Enlaces</TabsTrigger>
            <TabsTrigger value="badges">Sellos</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <Card>
                <CardHeader>
                  <CardTitle>Configuracion general</CardTitle>
                  <CardDescription>
                    Edita el contenido propio del footer y deja el resto de
                    fuentes de verdad en sus modulos originales.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="footer-eyebrow">Eyebrow</Label>
                    <Input
                      id="footer-eyebrow"
                      value={settingsForm.eyebrow || ""}
                      onChange={(event) =>
                        updateSettingsField("eyebrow", event.target.value)
                      }
                      placeholder="Descubre Gaudeix"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer-title">Titulo</Label>
                    <Input
                      id="footer-title"
                      value={settingsForm.title || ""}
                      onChange={(event) =>
                        updateSettingsField("title", event.target.value)
                      }
                      placeholder="Un pie de pagina con personalidad"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer-description">Descripcion</Label>
                    <Textarea
                      id="footer-description"
                      rows={5}
                      value={settingsForm.description || ""}
                      onChange={(event) =>
                        updateSettingsField("description", event.target.value)
                      }
                      placeholder="Resume la propuesta institucional o turistica del sitio."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer-copyright">Copyright</Label>
                    <Input
                      id="footer-copyright"
                      value={settingsForm.copyright_text || ""}
                      onChange={(event) =>
                        updateSettingsField(
                          "copyright_text",
                          event.target.value,
                        )
                      }
                      placeholder="Ajuntament de..."
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">Redes sociales</p>
                          <p className="text-sm text-muted-foreground">
                            Muestra las redes configuradas en su modulo.
                          </p>
                        </div>
                        <Switch
                          checked={settingsForm.show_social_links ?? false}
                          onCheckedChange={(checked) =>
                            updateSettingsField("show_social_links", checked)
                          }
                        />
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">Bloque de contacto</p>
                          <p className="text-sm text-muted-foreground">
                            Reutiliza telefonos, emails y direccion desde Site
                            settings.
                          </p>
                        </div>
                        <Switch
                          checked={settingsForm.show_contact_block ?? false}
                          onCheckedChange={(checked) =>
                            updateSettingsField("show_contact_block", checked)
                          }
                        />
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">Bloque de sellos</p>
                          <p className="text-sm text-muted-foreground">
                            Activa el listado de insignias municipales o de
                            sostenibilidad.
                          </p>
                        </div>
                        <Switch
                          checked={settingsForm.show_badges_block ?? false}
                          onCheckedChange={(checked) =>
                            updateSettingsField("show_badges_block", checked)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveSettings}
                      disabled={savingSettings}
                    >
                      {savingSettings
                        ? "Guardando..."
                        : "Guardar configuracion"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary-600" />
                      <CardTitle className="text-lg">
                        Legales actuales
                      </CardTitle>
                    </div>
                    <CardDescription>
                      Este bloque se lee desde Site Settings y se edita desde su
                      pantalla principal.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {legalSummary.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.page?.titulo || "Sin pagina asignada"}
                          </p>
                        </div>
                        <Badge variant={item.page ? "default" : "outline"}>
                          {item.page ? "Configurado" : "Pendiente"}
                        </Badge>
                      </div>
                    ))}

                    <Link
                      to={ROUTES.SITE_SETTINGS}
                      className="inline-flex text-sm font-medium text-primary-600 hover:underline"
                    >
                      Ir a Site settings
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-primary-600" />
                      <CardTitle className="text-lg">Redes sociales</CardTitle>
                    </div>
                    <CardDescription>
                      El footer solo decide si mostrarlas. Las URLs siguen
                      viviendo en el modulo de redes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="rounded-lg border p-3">
                      <p className="font-medium">Visibilidad en footer</p>
                      <p className="text-sm text-muted-foreground">
                        {settingsForm.show_social_links
                          ? "Activa"
                          : "Desactivada"}
                      </p>
                    </div>

                    {socialSummary.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="truncate text-sm text-muted-foreground">
                            {item.value || "Sin URL configurada"}
                          </p>
                        </div>
                        <Badge variant={item.value ? "default" : "outline"}>
                          {item.value ? "Lista" : "Pendiente"}
                        </Badge>
                      </div>
                    ))}

                    <Link
                      to={ROUTES.SOCIAL}
                      className="inline-flex text-sm font-medium text-primary-600 hover:underline"
                    >
                      Ir a Redes sociales
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="links" className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={linkSearch}
                  onChange={(event) => setLinkSearch(event.target.value)}
                  placeholder="Buscar por seccion, tipo o destino"
                  className="pl-9"
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Seccion</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Etiqueta / destino</TableHead>
                      <TableHead>Orden</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLinks.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No hay enlaces para mostrar.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLinks.map((link) => (
                        <TableRow key={link.id}>
                          <TableCell>{SECTION_LABELS[link.section]}</TableCell>
                          <TableCell>{TYPE_LABELS[link.type]}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">
                                {getLinkDestination(link)}
                              </p>
                              {link.type === "custom" && link.url ? (
                                <p className="text-sm text-muted-foreground">
                                  {link.url}
                                </p>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell>{link.order}</TableCell>
                          <TableCell>
                            <Badge
                              variant={link.is_active ? "default" : "outline"}
                            >
                              {link.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditLink(link)}
                              >
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteLink(link.id)}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={badgeSearch}
                  onChange={(event) => setBadgeSearch(event.target.value)}
                  placeholder="Buscar por titulo o URL"
                  className="pl-9"
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titulo</TableHead>
                      <TableHead>Imagen</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Orden</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBadges.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No hay sellos para mostrar.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBadges.map((badge) => (
                        <TableRow key={badge.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{badge.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {badge.alt_text}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {badge.image ? (
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    badge.image.thumbnail_url ||
                                    badge.image.variant_thumbnail ||
                                    badge.image.file
                                  }
                                  alt={badge.alt_text || badge.title}
                                  className="h-10 w-10 rounded object-cover"
                                />
                                <Badge>Lista</Badge>
                              </div>
                            ) : (
                              <Badge variant="outline">Sin imagen</Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[240px] truncate">
                            {badge.url || "Sin URL"}
                          </TableCell>
                          <TableCell>{badge.order}</TableCell>
                          <TableCell>
                            <Badge
                              variant={badge.is_active ? "default" : "outline"}
                            >
                              {badge.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditBadge(badge)}
                              >
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteBadge(badge.id)}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {linkForm.id ? "Editar enlace" : "Nuevo enlace"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="footer-link-section">Seccion</Label>
              <select
                id="footer-link-section"
                value={linkForm.section}
                onChange={(event) =>
                  updateLinkField(
                    "section",
                    event.target.value as FooterLinkSection,
                  )
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <option value="explore">Explorar</option>
                <option value="institutional">Institucional</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="footer-link-type">Tipo</Label>
              <select
                id="footer-link-type"
                value={linkForm.type}
                onChange={(event) =>
                  handleLinkTypeChange(event.target.value as FooterLinkType)
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <option value="category">Categoria</option>
                <option value="static_page">Pagina estatica</option>
                <option value="custom">Link personalizado</option>
              </select>
            </div>

            {linkForm.type === "category" ? (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="footer-link-category">Categoria</Label>
                <select
                  id="footer-link-category"
                  value={linkForm.category_id ?? ""}
                  onChange={(event) =>
                    updateLinkField(
                      "category_id",
                      event.target.value ? Number(event.target.value) : null,
                    )
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <option value="">Selecciona una categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nombre} ({category.slug})
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {linkForm.type === "static_page" ? (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="footer-link-page">Pagina estatica</Label>
                <select
                  id="footer-link-page"
                  value={linkForm.static_page_id ?? ""}
                  onChange={(event) =>
                    updateLinkField(
                      "static_page_id",
                      event.target.value ? Number(event.target.value) : null,
                    )
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <option value="">Selecciona una pagina</option>
                  {pages.map((page) => (
                    <option key={page.id} value={page.id}>
                      {page.titulo} ({page.template})
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {linkForm.type === "custom" ? (
              <>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="footer-link-label">Etiqueta</Label>
                  <Input
                    id="footer-link-label"
                    value={linkForm.label}
                    onChange={(event) =>
                      updateLinkField("label", event.target.value)
                    }
                    placeholder="Turismo sostenible"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="footer-link-url">URL</Label>
                  <Input
                    id="footer-link-url"
                    value={linkForm.url}
                    onChange={(event) =>
                      updateLinkField("url", event.target.value)
                    }
                    placeholder="https://..."
                  />
                </div>
              </>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="footer-link-order">Orden</Label>
              <Input
                id="footer-link-order"
                type="number"
                value={linkForm.order}
                onChange={(event) =>
                  updateLinkField("order", Number(event.target.value))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footer-link-active">Estado</Label>
              <div
                id="footer-link-active"
                className="flex h-10 items-center justify-between rounded-md border px-3"
              >
                <span className="text-sm text-muted-foreground">
                  {linkForm.is_active ? "Activo" : "Inactivo"}
                </span>
                <Switch
                  checked={linkForm.is_active}
                  onCheckedChange={(checked) =>
                    updateLinkField("is_active", checked)
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLinkDialogOpen(false)}
              disabled={savingLink}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveLink} disabled={savingLink}>
              {savingLink ? "Guardando..." : "Guardar enlace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={badgeDialogOpen} onOpenChange={setBadgeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {badgeForm.id ? "Editar sello" : "Nuevo sello"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="footer-badge-title">Titulo</Label>
              <Input
                id="footer-badge-title"
                value={badgeForm.title}
                onChange={(event) =>
                  updateBadgeField("title", event.target.value)
                }
                placeholder="Sello municipal"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="footer-badge-alt-text">Alt text</Label>
              <Input
                id="footer-badge-alt-text"
                value={badgeForm.alt_text}
                onChange={(event) =>
                  updateBadgeField("alt_text", event.target.value)
                }
                placeholder="Descripcion accesible del sello"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="footer-badge-url">URL</Label>
              <Input
                id="footer-badge-url"
                value={badgeForm.url}
                onChange={(event) =>
                  updateBadgeField("url", event.target.value)
                }
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Imagen</Label>
              <div className="rounded-lg border p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    {badgeForm.image ? (
                      <>
                        <img
                          src={
                            badgeForm.image.thumbnail_url ||
                            badgeForm.image.variant_thumbnail ||
                            badgeForm.image.file
                          }
                          alt={badgeForm.alt_text || badgeForm.title}
                          className="h-14 w-14 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium">
                            {badgeForm.image.original_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Imagen vinculada al sello.
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Stamp className="h-4 w-4" />
                        Este sello aun no tiene imagen.
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {badgeForm.image ? (
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                          updateBadgeField("image", null);
                          updateBadgeField("image_id", null);
                        }}
                      >
                        Quitar imagen
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setBadgeImageSelectorOpen(true)}
                    >
                      Seleccionar imagen
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="footer-badge-order">Orden</Label>
              <Input
                id="footer-badge-order"
                type="number"
                value={badgeForm.order}
                onChange={(event) =>
                  updateBadgeField("order", Number(event.target.value))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footer-badge-active">Estado</Label>
              <div
                id="footer-badge-active"
                className="flex h-10 items-center justify-between rounded-md border px-3"
              >
                <span className="text-sm text-muted-foreground">
                  {badgeForm.is_active ? "Activo" : "Inactivo"}
                </span>
                <Switch
                  checked={badgeForm.is_active}
                  onCheckedChange={(checked) =>
                    updateBadgeField("is_active", checked)
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBadgeDialogOpen(false)}
              disabled={savingBadge}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveBadge} disabled={savingBadge}>
              {savingBadge ? "Guardando..." : "Guardar sello"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImageSelector
        open={badgeImageSelectorOpen}
        onOpenChange={setBadgeImageSelectorOpen}
        value={badgeForm.image_id}
        onSelect={(image: MediaItem) => {
          updateBadgeField("image_id", image.id);
          updateBadgeField("image", {
            id: image.id,
            original_name: image.original_name,
            file: image.file,
            mime_type: image.mime_type,
            variant_thumbnail: image.variant_thumbnail,
            thumbnail_url: image.thumbnail_url,
          });
          setBadgeImageSelectorOpen(false);
        }}
      />
    </PageContainer>
  );
}
