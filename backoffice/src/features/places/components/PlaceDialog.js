import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { LANGUAGES } from "@/lib/config/constants";
import { envConfig } from "@/lib/config/env";
import { loadGoogleMaps } from "@/lib/maps/googleMaps";
import { mediaApi } from "@/features/media/api/media";
import { categoriesApi } from "@/features/categories/api/categories";
import { placesApi } from "../api/places";
import { toast } from "sonner";
const emptyForm = {
  title: "",
  description: "",
  location_text: "",
  latitude: null,
  longitude: null,
  phone: "",
  email: "",
  website: "",
  booking_url: "",
  is_published: true,
  category_id: null,
  featured_media_id: null,
  attachments_ids: [],
  translations: {},
};
const DEFAULT_CENTER = { lat: 41.3874, lng: 2.1686 };
export function PlaceDialog({ open, onOpenChange, onSubmit, place }) {
  const [form, setForm] = useState(emptyForm);
  const [activeLang, setActiveLang] = useState("ca");
  const [translations, setTranslations] = useState({});
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingTranslate, setLoadingTranslate] = useState(false);
  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState(null);
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);
  const locationInputRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const autocompleteRef = useRef(null);
  const selectedImage = useMemo(
    () => images.find((img) => img.id === form.featured_media_id),
    [images, form.featured_media_id],
  );
  const attachmentIds = form.attachments_ids || [];
  const getLatLng = (payload) => {
    if (payload.latitude == null || payload.longitude == null) {
      return null;
    }
    return { lat: payload.latitude, lng: payload.longitude };
  };
  useEffect(() => {
    if (place) {
      setForm({
        title: place.title,
        description: place.description || "",
        location_text: place.location_text || "",
        latitude: place.latitude ?? null,
        longitude: place.longitude ?? null,
        phone: place.phone || "",
        email: place.email || "",
        website: place.website || "",
        booking_url: place.booking_url || "",
        is_published: place.is_published,
        category_id: place.category ?? null,
        featured_media_id: place.featured_media?.id ?? null,
        attachments_ids: (place.attachments || []).map((a) => a.id),
      });
      setTranslations(place.translations || {});
    } else {
      setForm(emptyForm);
      setTranslations({});
    }
  }, [place, open]);
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [imgs, docs, cats] = await Promise.all([
          mediaApi.listImages(),
          mediaApi.listDocuments(),
          categoriesApi.list({ taxonomy: "template" }),
        ]);
        setImages(imgs);
        setDocuments(docs);
        setCategories(cats);
      } catch (err) {
        console.error("Error cargando opciones", err);
      }
    };
    if (open) loadOptions();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    if (!envConfig.googleMapsApiKey) {
      setMapsError("Configura VITE_GOOGLE_MAPS_API_KEY para usar Google Maps.");
      setMapsReady(false);
      return;
    }
    let isActive = true;
    setMapsError(null);
    loadGoogleMaps()
      .then((googleMaps) => {
        if (!isActive || !googleMaps || !mapContainerRef.current) return;
        setMapsReady(true);
        const initial = getLatLng(form) || DEFAULT_CENTER;
        mapRef.current = new google.maps.Map(mapContainerRef.current, {
          center: initial,
          zoom: getLatLng(form) ? 15 : 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        markerRef.current = new google.maps.Marker({
          map: mapRef.current,
          position: initial,
          draggable: true,
        });
        markerRef.current.addListener("dragend", () => {
          const position = markerRef.current?.getPosition();
          if (!position) return;
          updateCoordinates(position.lat(), position.lng());
          reverseGeocode({ lat: position.lat(), lng: position.lng() });
        });
        if (mapRef.current) {
          window.setTimeout(() => {
            google.maps.event.trigger(mapRef.current, "resize");
            mapRef.current?.setCenter(initial);
          }, 0);
        }
        if (!autocompleteRef.current && locationInputRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(
            locationInputRef.current,
            {
              fields: ["formatted_address", "geometry", "name"],
            },
          );
          autocompleteRef.current = autocomplete;
          autocomplete.addListener("place_changed", () => {
            const placeResult = autocomplete.getPlace();
            if (!placeResult.geometry?.location) return;
            const position = placeResult.geometry.location;
            const address =
              placeResult.formatted_address || placeResult.name || "";
            updateCoordinates(position.lat(), position.lng(), address);
            mapRef.current?.panTo(position);
            mapRef.current?.setZoom(15);
            markerRef.current?.setPosition(position);
          });
        }
      })
      .catch((error) => {
        console.error("Error cargando Google Maps", error);
        if (isActive) {
          setMapsError("No se pudo cargar Google Maps. Revisa la API key.");
          setMapsReady(false);
        }
      });
    return () => {
      isActive = false;
    };
  }, [open]);
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    const position = getLatLng(form);
    if (!position) return;
    markerRef.current.setPosition(position);
    mapRef.current.setCenter(position);
  }, [form.latitude, form.longitude]);
  const getContent = (lang) => {
    if (lang === "ca") {
      return { title: form.title, description: form.description };
    }
    return translations[lang] || { title: "", description: "" };
  };
  const updateField = (lang, field, value) => {
    if (lang === "ca") {
      setForm((prev) => ({ ...prev, [field]: value }));
    } else {
      setTranslations((prev) => ({
        ...prev,
        [lang]: {
          ...prev[lang],
          [field]: value,
        },
      }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const translationsPayload = { ...translations };
    delete translationsPayload["ca"];
    const payload = {
      ...form,
      translations: Object.keys(translationsPayload).length
        ? translationsPayload
        : undefined,
    };
    await onSubmit(payload);
  };
  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await mediaApi.upload(file);
      if (uploaded.type === "image") {
        setImages((prev) => [uploaded, ...prev]);
        setForm((prev) => ({ ...prev, featured_media_id: uploaded.id }));
      }
    } catch (err) {
      console.error(err);
      toast.error("No se pudo subir la imagen");
    } finally {
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };
  const handleUploadDoc = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await mediaApi.upload(file);
      setDocuments((prev) => [uploaded, ...prev]);
      setForm((prev) => ({
        ...prev,
        attachments_ids: Array.from(
          new Set([...(prev.attachments_ids || []), uploaded.id]),
        ),
      }));
    } catch (err) {
      console.error(err);
      toast.error("No se pudo subir el documento");
    } finally {
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };
  const handleAutoTranslate = async (targetLang) => {
    if (!place) return;
    if (!form.title) {
      toast.error("No hay título en el idioma base para traducir");
      return;
    }
    setLoadingTranslate(true);
    try {
      const response = await placesApi.autoTranslate(place.id, {
        source_lang: "ca",
        target_langs: [targetLang],
      });
      if (response.success && response.translations[targetLang]) {
        const t = response.translations[targetLang];
        setTranslations((prev) => ({ ...prev, [targetLang]: t }));
        toast.success(`Traducido a ${targetLang.toUpperCase()}`);
      } else {
        toast.error("Error al traducir", {
          description: response.errors?.[targetLang] || "Error desconocido",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("No se pudo traducir el lugar");
    } finally {
      setLoadingTranslate(false);
    }
  };
  const updateCoordinates = (lat, lng, address) => {
    setForm((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location_text: address ?? prev.location_text,
    }));
  };
  const reverseGeocode = (location) => {
    if (!geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }
    geocoderRef.current.geocode({ location }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        setForm((prev) => ({
          ...prev,
          location_text: results[0].formatted_address || prev.location_text,
        }));
      }
    });
  };
  return _jsx(Dialog, {
    open: open,
    onOpenChange: onOpenChange,
    children: _jsxs(DialogContent, {
      className: "max-w-[720px] px-6",
      children: [
        _jsx(DialogHeader, {
          children: _jsx(DialogTitle, {
            children: place ? "Editar lugar" : "Nuevo lugar",
          }),
        }),
        _jsxs("form", {
          onSubmit: handleSubmit,
          className: "space-y-4",
          children: [
            _jsxs("div", {
              className: "space-y-4",
              children: [
                _jsxs("div", {
                  className: "space-y-2",
                  children: [
                    _jsx(Label, {
                      htmlFor: "location_text",
                      children: "Ubicaci\u00F3n",
                    }),
                    _jsx(Input, {
                      id: "location_text",
                      ref: locationInputRef,
                      value: form.location_text || "",
                      onChange: (e) =>
                        setForm((prev) => ({
                          ...prev,
                          location_text: e.target.value,
                        })),
                      placeholder: "Busca una direcci\u00F3n en Google Maps",
                    }),
                    _jsx("p", {
                      className: "text-xs text-muted-foreground",
                      children:
                        "Escribe para ver sugerencias y seleccionar la direcci\u00F3n exacta.",
                    }),
                  ],
                }),
                _jsx("div", {
                  className:
                    "overflow-hidden rounded-lg border border-border/60 bg-muted/20",
                  children: mapsError
                    ? _jsx("div", {
                        className:
                          "flex h-48 items-center justify-center px-4 text-sm text-muted-foreground",
                        children: mapsError,
                      })
                    : _jsxs("div", {
                        className: "relative",
                        children: [
                          !mapsReady &&
                            _jsx("div", {
                              className:
                                "absolute inset-0 flex items-center justify-center text-sm text-muted-foreground",
                              children: "Cargando mapa...",
                            }),
                          _jsx("div", {
                            ref: mapContainerRef,
                            className: "h-56 w-full",
                          }),
                        ],
                      }),
                }),
                _jsxs("div", {
                  className: "grid grid-cols-2 gap-2",
                  children: [
                    _jsxs("div", {
                      className: "space-y-2",
                      children: [
                        _jsx(Label, {
                          htmlFor: "latitude",
                          children: "Latitud",
                        }),
                        _jsx(Input, {
                          id: "latitude",
                          type: "number",
                          value: form.latitude ?? "",
                          onChange: (e) =>
                            setForm((prev) => ({
                              ...prev,
                              latitude: e.target.value
                                ? Number(e.target.value)
                                : null,
                            })),
                          placeholder: "41.4",
                        }),
                      ],
                    }),
                    _jsxs("div", {
                      className: "space-y-2",
                      children: [
                        _jsx(Label, {
                          htmlFor: "longitude",
                          children: "Longitud",
                        }),
                        _jsx(Input, {
                          id: "longitude",
                          type: "number",
                          value: form.longitude ?? "",
                          onChange: (e) =>
                            setForm((prev) => ({
                              ...prev,
                              longitude: e.target.value
                                ? Number(e.target.value)
                                : null,
                            })),
                          placeholder: "2.17",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            _jsxs("div", {
              className: "grid gap-4 md:grid-cols-2",
              children: [
                _jsxs("div", {
                  className: "space-y-2",
                  children: [
                    _jsx(Label, {
                      htmlFor: "phone",
                      children: "Tel\u00E9fono",
                    }),
                    _jsx(Input, {
                      id: "phone",
                      value: form.phone || "",
                      onChange: (e) =>
                        setForm((prev) => ({ ...prev, phone: e.target.value })),
                    }),
                  ],
                }),
                _jsxs("div", {
                  className: "space-y-2",
                  children: [
                    _jsx(Label, { htmlFor: "email", children: "Email" }),
                    _jsx(Input, {
                      id: "email",
                      type: "email",
                      value: form.email || "",
                      onChange: (e) =>
                        setForm((prev) => ({ ...prev, email: e.target.value })),
                    }),
                  ],
                }),
                _jsxs("div", {
                  className: "space-y-2",
                  children: [
                    _jsx(Label, { htmlFor: "website", children: "Website" }),
                    _jsx(Input, {
                      id: "website",
                      value: form.website || "",
                      onChange: (e) =>
                        setForm((prev) => ({
                          ...prev,
                          website: e.target.value,
                        })),
                    }),
                  ],
                }),
                _jsxs("div", {
                  className: "space-y-2",
                  children: [
                    _jsx(Label, {
                      htmlFor: "booking_url",
                      children: "Booking URL",
                    }),
                    _jsx(Input, {
                      id: "booking_url",
                      value: form.booking_url || "",
                      onChange: (e) =>
                        setForm((prev) => ({
                          ...prev,
                          booking_url: e.target.value,
                        })),
                    }),
                  ],
                }),
              ],
            }),
            _jsxs("div", {
              className: "grid gap-4 md:grid-cols-2",
              children: [
                _jsxs("div", {
                  className: "space-y-2",
                  children: [
                    _jsx(Label, {
                      htmlFor: "category",
                      children: "Categor\u00EDa",
                    }),
                    _jsxs("select", {
                      id: "category",
                      value: form.category_id ?? "",
                      onChange: (e) =>
                        setForm((prev) => ({
                          ...prev,
                          category_id: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })),
                      className:
                        "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                      children: [
                        _jsx("option", {
                          value: "",
                          children: "Sin categor\u00EDa",
                        }),
                        categories.map((cat) =>
                          _jsxs(
                            "option",
                            {
                              value: cat.id,
                              children: [cat.nombre, " (", cat.slug, ")"],
                            },
                            cat.id,
                          ),
                        ),
                      ],
                    }),
                  ],
                }),
                _jsxs("div", {
                  className:
                    "flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm",
                  children: [
                    _jsx(Label, {
                      htmlFor: "place-is-published",
                      className: "cursor-pointer text-sm font-normal",
                      children: "Publicado",
                    }),
                    _jsx(Switch, {
                      id: "place-is-published",
                      checked: !!form.is_published,
                      onCheckedChange: (checked) =>
                        setForm((prev) => ({ ...prev, is_published: checked })),
                    }),
                  ],
                }),
              ],
            }),
            _jsxs(Tabs, {
              value: activeLang,
              onValueChange: setActiveLang,
              defaultValue: "ca",
              children: [
                _jsx(TabsList, {
                  className: "grid w-full grid-cols-4",
                  children: LANGUAGES.map((lang) =>
                    _jsx(
                      TabsTrigger,
                      { value: lang.code, children: lang.name },
                      lang.code,
                    ),
                  ),
                }),
                LANGUAGES.map((lang) => {
                  const content = getContent(lang.code);
                  const isBase = lang.code === "ca";
                  return _jsxs(
                    TabsContent,
                    {
                      value: lang.code,
                      className: "space-y-3 pt-4",
                      children: [
                        _jsxs("div", {
                          className: "flex items-center justify-between",
                          children: [
                            _jsxs(Label, {
                              htmlFor: `title-${lang.code}`,
                              children: [
                                "T\u00EDtulo ",
                                isBase ? "" : `(${lang.name})`,
                              ],
                            }),
                            !isBase &&
                              place &&
                              _jsx(Button, {
                                type: "button",
                                size: "sm",
                                variant: "outline",
                                onClick: () => handleAutoTranslate(lang.code),
                                disabled: loadingTranslate || !form.title,
                                children: loadingTranslate
                                  ? "Traduciendo..."
                                  : "Traducir IA",
                              }),
                          ],
                        }),
                        _jsx(Input, {
                          id: `title-${lang.code}`,
                          value: content.title || "",
                          onChange: (e) =>
                            updateField(lang.code, "title", e.target.value),
                          required: isBase,
                          placeholder: isBase
                            ? ""
                            : "Traducción automática o manual",
                        }),
                        _jsxs("div", {
                          className: "space-y-2",
                          children: [
                            _jsxs(Label, {
                              htmlFor: `description-${lang.code}`,
                              children: [
                                "Descripci\u00F3n ",
                                isBase ? "" : `(${lang.name})`,
                              ],
                            }),
                            _jsx(RichTextEditor, {
                              value: content.description || "",
                              onChange: (value) =>
                                updateField(lang.code, "description", value),
                              placeholder: isBase
                                ? "Descripción del lugar"
                                : "Traducción automática o manual",
                            }),
                          ],
                        }),
                      ],
                    },
                    lang.code,
                  );
                }),
              ],
            }),
            _jsxs("div", {
              className:
                "space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3",
              children: [
                _jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    _jsxs("div", {
                      children: [
                        _jsx("p", {
                          className: "text-sm font-semibold text-foreground",
                          children: "Imagen destacada",
                        }),
                        _jsx("p", {
                          className: "text-xs text-muted-foreground",
                          children: "Miniatura visible en listados",
                        }),
                      ],
                    }),
                    _jsxs("div", {
                      className: "flex gap-2",
                      children: [
                        _jsx("input", {
                          type: "file",
                          accept: "image/*",
                          ref: imageInputRef,
                          onChange: handleUploadImage,
                          className: "hidden",
                        }),
                        _jsx(Button, {
                          type: "button",
                          variant: "outline",
                          size: "sm",
                          onClick: () => imageInputRef.current?.click(),
                          children: "Subir",
                        }),
                        _jsxs("select", {
                          value: form.featured_media_id ?? "",
                          onChange: (e) =>
                            setForm((prev) => ({
                              ...prev,
                              featured_media_id: e.target.value
                                ? Number(e.target.value)
                                : null,
                            })),
                          className:
                            "h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                          children: [
                            _jsx("option", {
                              value: "",
                              children: "Sin imagen",
                            }),
                            images.map((img) =>
                              _jsx(
                                "option",
                                { value: img.id, children: img.original_name },
                                img.id,
                              ),
                            ),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                selectedImage &&
                  _jsxs("div", {
                    className:
                      "flex items-center gap-3 rounded-md bg-background/60 p-2",
                    children: [
                      _jsx("img", {
                        src:
                          selectedImage.thumbnail_url ||
                          selectedImage.variant_thumbnail ||
                          selectedImage.file,
                        alt: "Miniatura",
                        className:
                          "h-14 w-14 rounded object-cover ring-1 ring-border",
                      }),
                      _jsx("p", {
                        className: "text-sm text-foreground",
                        children: selectedImage.original_name,
                      }),
                      _jsx(Button, {
                        type: "button",
                        variant: "ghost",
                        size: "sm",
                        className: "ml-auto text-rose-600",
                        onClick: () =>
                          setForm((prev) => ({
                            ...prev,
                            featured_media_id: null,
                          })),
                        children: "Quitar",
                      }),
                    ],
                  }),
              ],
            }),
            _jsxs("div", {
              className:
                "space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3",
              children: [
                _jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    _jsxs("div", {
                      children: [
                        _jsx("p", {
                          className: "text-sm font-semibold text-foreground",
                          children: "Adjuntos",
                        }),
                        _jsx("p", {
                          className: "text-xs text-muted-foreground",
                          children: "Documentos vinculados al lugar",
                        }),
                      ],
                    }),
                    _jsxs("div", {
                      className: "flex gap-2",
                      children: [
                        _jsx("input", {
                          type: "file",
                          accept: ".pdf,.ics,.txt,.docx,.xlsx",
                          ref: docInputRef,
                          onChange: handleUploadDoc,
                          className: "hidden",
                        }),
                        _jsx(Button, {
                          type: "button",
                          variant: "outline",
                          size: "sm",
                          onClick: () => docInputRef.current?.click(),
                          children: "Subir",
                        }),
                        _jsx("select", {
                          multiple: true,
                          value: (form.attachments_ids || []).map(String),
                          onChange: (e) => {
                            const values = Array.from(
                              e.target.selectedOptions,
                            ).map((opt) => Number(opt.value));
                            setForm((prev) => ({
                              ...prev,
                              attachments_ids: values,
                            }));
                          },
                          className:
                            "h-24 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                          children: documents.map((doc) =>
                            _jsx(
                              "option",
                              { value: doc.id, children: doc.original_name },
                              doc.id,
                            ),
                          ),
                        }),
                      ],
                    }),
                  ],
                }),
                attachmentIds.length > 0 &&
                  _jsx("div", {
                    className: "space-y-1 text-sm",
                    children: attachmentIds.map((id) => {
                      const doc = documents.find((d) => d.id === id);
                      return _jsxs(
                        "div",
                        {
                          className:
                            "flex items-center justify-between rounded-md bg-background/60 px-2 py-1",
                          children: [
                            _jsx("span", {
                              children: doc?.original_name || `Documento ${id}`,
                            }),
                            _jsx(Button, {
                              type: "button",
                              size: "sm",
                              variant: "ghost",
                              className: "text-rose-600",
                              onClick: () =>
                                setForm((prev) => ({
                                  ...prev,
                                  attachments_ids: (
                                    prev.attachments_ids || []
                                  ).filter((docId) => docId !== id),
                                })),
                              children: "Quitar",
                            }),
                          ],
                        },
                        id,
                      );
                    }),
                  }),
              ],
            }),
            _jsxs("div", {
              className: "flex justify-end gap-2",
              children: [
                _jsx(Button, {
                  type: "button",
                  variant: "outline",
                  onClick: () => onOpenChange(false),
                  children: "Cancelar",
                }),
                _jsx(Button, {
                  type: "submit",
                  children: place ? "Guardar" : "Crear",
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
