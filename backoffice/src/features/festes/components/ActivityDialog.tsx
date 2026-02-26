/**
 * Activity create/edit dialog component.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LANGUAGES } from "@/lib/config/constants";
import { eventsApi } from "@/features/events/api/events";
import { Event } from "@/features/events/types";
import {
  Activity,
  ActivityStatus,
  CreateActivityDTO,
  Program,
  Venue,
} from "../types";

type LocalActivityTranslations = {
  [lang: string]: {
    title: string;
    summary?: string;
    description?: string;
  };
};

type ActivityForm = {
  program_id: number;
  venue_id: number | null;
  event_id: number | null;
  category: string;
  start_at: string;
  end_at: string;
  is_free: boolean;
  price: number | null;
  price_text: string;
  ticket_url: string;
  status: ActivityStatus;
};

const emptyForm: ActivityForm = {
  program_id: 0,
  venue_id: null,
  event_id: null,
  category: "",
  start_at: "",
  end_at: "",
  is_free: true,
  price: null,
  price_text: "",
  ticket_url: "",
  status: "draft",
};

const emptyBaseTranslation = {
  title: "",
  summary: "",
  description: "",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateActivityDTO) => void;
  activity?: Activity;
  programs: Program[];
  venues: Venue[];
};

export function ActivityDialog({
  open,
  onOpenChange,
  onSubmit,
  activity,
  programs,
  venues,
}: Props) {
  const [form, setForm] = useState<ActivityForm>(emptyForm);
  const [activeLang, setActiveLang] = useState("ca");
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventSearch, setEventSearch] = useState("");
  const [eventError, setEventError] = useState<string | null>(null);
  const [translations, setTranslations] = useState<LocalActivityTranslations>({
    ca: emptyBaseTranslation,
  });

  const getActivityEventId = (value?: Activity): number | null => {
    if (!value) return null;
    if (!value.event) return null;
    return value.event.id ?? null;
  };

  useEffect(() => {
    if (activity) {
      setForm({
        program_id: activity.program,
        venue_id: activity.venue,
        event_id: getActivityEventId(activity),
        category: activity.category || "",
        start_at: activity.start_at ? activity.start_at.slice(0, 16) : "",
        end_at: activity.end_at ? activity.end_at.slice(0, 16) : "",
        is_free: activity.is_free,
        price: activity.price,
        price_text: activity.price_text || "",
        ticket_url: activity.ticket_url || "",
        status: activity.status,
      });
      setTranslations({
        ...activity.translations,
        ca: {
          title: activity.title,
          summary: activity.summary || "",
          description: activity.description || "",
        },
      });
    } else {
      setForm({
        ...emptyForm,
        program_id: programs[0]?.id || 0,
      });
      setTranslations({ ca: emptyBaseTranslation });
      setActiveLang("ca");
    }
    setEventError(null);
    setEventSearch("");
  }, [activity?.id, open, programs]);

  useEffect(() => {
    if (!open) return;

    const loadEvents = async () => {
      try {
        setEventsLoading(true);
        const data = await eventsApi.getAll({ exclude_children: true });
        setEvents(data);
      } catch (error) {
        console.error("Error loading agenda events:", error);
      } finally {
        setEventsLoading(false);
      }
    };

    loadEvents();
  }, [open]);

  const filteredEvents = useMemo(() => {
    const term = eventSearch.trim().toLowerCase();
    if (!term) return events;
    return events.filter((event) => {
      const haystack =
        `${event.title || ""} ${event.summary || ""} ${event.venue_name || ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [eventSearch, events]);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === form.event_id) || null,
    [events, form.event_id],
  );

  const selectableEvents = useMemo(() => {
    if (!selectedEvent) return filteredEvents;
    if (filteredEvents.some((event) => event.id === selectedEvent.id)) {
      return filteredEvents;
    }
    return [selectedEvent, ...filteredEvents];
  }, [filteredEvents, selectedEvent]);

  const getTranslation = (lang: string) => {
    return translations[lang] || emptyBaseTranslation;
  };

  const updateTranslatedField = (
    lang: string,
    field: "title" | "summary" | "description",
    value: string,
  ) => {
    setTranslations((prev) => ({
      ...prev,
      [lang]: {
        ...(prev[lang] || emptyBaseTranslation),
        [field]: value,
      },
    }));
  };

  const buildTranslationsPayload = () => {
    const next: CreateActivityDTO["translations"] = {};

    Object.entries(translations).forEach(([lang, value]) => {
      const title = value.title.trim();
      const summary = value.summary?.trim();
      const description = value.description?.trim();
      if (!title && !summary && !description) return;

      next[lang] = {
        title,
        summary: summary || undefined,
        description: description || undefined,
      };
    });

    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setEventError(null);
    if (form.event_id && !events.some((event) => event.id === form.event_id)) {
      setEventError("El evento seleccionado ya no es valido o no existe.");
      return;
    }

    const payload: CreateActivityDTO = {
      program_id: form.program_id,
      venue_id: form.venue_id,
      event: form.event_id,
      category: form.category || "general",
      start_at: form.start_at,
      end_at: form.end_at,
      is_free: form.is_free,
      price: form.is_free ? null : form.price,
      price_text: form.is_free ? "" : form.price_text,
      ticket_url: form.ticket_url || null,
      status: form.status,
      translations: buildTranslationsPayload(),
    };

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[860px] px-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {activity ? "Editar actividad" : "Nueva actividad"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Programa</Label>
              <select
                value={form.program_id}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    program_id: Number(e.target.value),
                  }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                required
              >
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Lugar (opcional)</Label>
              <select
                value={form.venue_id || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    venue_id: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Sin lugar específico</option>
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Evento de Agenda Municipal (opcional)</Label>
            <Input
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
              placeholder="Buscar evento por titulo, resumen o lugar"
              disabled={eventsLoading}
            />
            <select
              value={form.event_id || ""}
              onChange={(e) => {
                setEventError(null);
                setForm((prev) => ({
                  ...prev,
                  event_id: e.target.value ? Number(e.target.value) : null,
                }));
              }}
              className={`h-10 w-full rounded-md border bg-background px-3 text-sm ${
                eventError ? "border-red-500" : "border-input"
              }`}
              disabled={eventsLoading}
            >
              <option value="">Sin vincular a agenda</option>
              {selectableEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
            {eventError ? (
              <p className="text-xs text-red-600">{eventError}</p>
            ) : selectedEvent ? (
              <p className="text-xs text-muted-foreground">
                Evento seleccionado: {selectedEvent.title}
              </p>
            ) : filteredEvents.length === 0 && eventSearch.trim() ? (
              <p className="text-xs text-muted-foreground">
                No hay coincidencias para la busqueda actual.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Vincula esta actividad con un evento existente de agenda.
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Input
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value }))
                }
                placeholder="Ej: música, theater, family"
              />
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    status: e.target.value as ActivityStatus,
                  }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                required
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Inicio</Label>
              <Input
                type="datetime-local"
                value={form.start_at}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, start_at: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Fin</Label>
              <Input
                type="datetime-local"
                value={form.end_at}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, end_at: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_free}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, is_free: e.target.checked }))
                }
                className="h-4 w-4"
              />
              Actividad gratuita
            </Label>
          </div>

          {!form.is_free && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Precio (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      price: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Texto de precio</Label>
                <Input
                  value={form.price_text}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, price_text: e.target.value }))
                  }
                  placeholder="Ej: Entrada + consumición"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>URL de entradas</Label>
            <Input
              value={form.ticket_url}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, ticket_url: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>

          <Tabs value={activeLang} onValueChange={setActiveLang}>
            <TabsList className="grid w-full grid-cols-4">
              {LANGUAGES.map((lang) => (
                <TabsTrigger key={lang.code} value={lang.code}>
                  {lang.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {LANGUAGES.map((lang) => {
              const content = getTranslation(lang.code);
              const isBase = lang.code === "ca";
              return (
                <TabsContent
                  key={lang.code}
                  value={lang.code}
                  className="space-y-3 pt-4"
                >
                  <div className="space-y-2">
                    <Label>Título {isBase ? "" : `(${lang.name})`}</Label>
                    <Input
                      value={content.title || ""}
                      onChange={(e) =>
                        updateTranslatedField(
                          lang.code,
                          "title",
                          e.target.value,
                        )
                      }
                      required={isBase}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Resumen</Label>
                    <Textarea
                      value={content.summary || ""}
                      onChange={(e) =>
                        updateTranslatedField(
                          lang.code,
                          "summary",
                          e.target.value,
                        )
                      }
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      value={content.description || ""}
                      onChange={(e) =>
                        updateTranslatedField(
                          lang.code,
                          "description",
                          e.target.value,
                        )
                      }
                      className="min-h-[100px]"
                    />
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="submit">
              {activity ? "Guardar cambios" : "Crear actividad"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
