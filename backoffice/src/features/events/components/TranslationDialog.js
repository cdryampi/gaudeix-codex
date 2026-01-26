import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Languages,
  AlertCircle,
  CheckCircle2,
  X,
  Check,
} from "lucide-react";
import { llmApi } from "../api/llm";
import { LANGUAGES } from "@/lib/config/constants";
/**
 * TranslationDialog Component
 *
 * Provides AI-powered translation suggestions for events with:
 * - Language selection with flags
 * - Real-time translation
 * - Editable suggestions
 * - Apply/discard functionality
 */
export function TranslationDialog({
  open,
  onOpenChange,
  eventId,
  currentTitle,
  currentDescription,
  onApplyTranslations,
}) {
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [translationErrors, setTranslationErrors] = useState({});
  /**
   * Toggle language selection
   */
  const toggleLanguage = (langCode) => {
    setSelectedLanguages((prev) =>
      prev.includes(langCode)
        ? prev.filter((code) => code !== langCode)
        : [...prev, langCode],
    );
  };
  /**
   * Translate to selected languages
   */
  const handleTranslate = async () => {
    if (selectedLanguages.length === 0) {
      setError("Selecciona al menos un idioma para traducir");
      return;
    }
    setIsTranslating(true);
    setError(null);
    setSuccess(null);
    setTranslationErrors({});
    try {
      const response = await llmApi.autoTranslateEvent(eventId);
      if (response.success) {
        // Convert response to translation suggestions
        const suggestions = selectedLanguages
          .filter((lang) => response.translations[lang])
          .map((lang) => ({
            lang,
            title: response.translations[lang].title,
            description: response.translations[lang].description,
            edited: false,
          }));
        setTranslations(suggestions);
        // Store any errors for specific languages
        if (response.errors) {
          setTranslationErrors(response.errors);
        }
        // Show success or warning message
        if (Object.keys(response.errors || {}).length > 0) {
          setError("Algunas traducciones fallaron. Revisa los errores abajo.");
        } else {
          setSuccess(
            `✓ Traducciones guardadas correctamente en el servidor para ${suggestions.length} idioma${suggestions.length > 1 ? "s" : ""}.`,
          );
        }
      } else {
        setError("Error al traducir el evento. Verifica la configuración LLM.");
      }
    } catch (err) {
      console.error("Translation error:", err);
      setError(
        "Error al conectar con el servicio de traducción. Inténtalo de nuevo.",
      );
    } finally {
      setIsTranslating(false);
    }
  };
  /**
   * Update translation suggestion
   */
  const updateTranslation = (lang, field, value) => {
    setTranslations((prev) =>
      prev.map((trans) =>
        trans.lang === lang
          ? { ...trans, [field]: value, edited: true }
          : trans,
      ),
    );
  };
  /**
   * Remove a translation suggestion
   */
  const removeTranslation = (lang) => {
    setTranslations((prev) => prev.filter((trans) => trans.lang !== lang));
    setSelectedLanguages((prev) => prev.filter((code) => code !== lang));
  };
  /**
   * Apply translations and close dialog
   */
  const handleApply = () => {
    const translationsToApply = translations.reduce((acc, trans) => {
      acc[trans.lang] = {
        title: trans.title,
        description: trans.description,
      };
      return acc;
    }, {});
    onApplyTranslations(translationsToApply);
    handleClose();
  };
  /**
   * Close dialog and reset state
   */
  const handleClose = () => {
    setSelectedLanguages([]);
    setTranslations([]);
    setError(null);
    setSuccess(null);
    setTranslationErrors({});
    onOpenChange(false);
  };
  /**
   * Get language name and flag from code
   */
  const getLanguageInfo = (code) => {
    return LANGUAGES.find((lang) => lang.code === code);
  };
  return _jsx(Dialog, {
    open: open,
    onOpenChange: onOpenChange,
    children: _jsxs(DialogContent, {
      className: "max-w-4xl max-h-[90vh] flex flex-col",
      children: [
        _jsxs(DialogHeader, {
          children: [
            _jsxs(DialogTitle, {
              className: "flex items-center gap-2",
              children: [
                _jsx(Languages, { className: "h-5 w-5" }),
                "Traducir Evento con IA",
              ],
            }),
            _jsx(DialogDescription, {
              children:
                "Selecciona los idiomas a los que quieres traducir este evento. Las traducciones se guardan autom\u00E1ticamente en el servidor y puedes revisarlas antes de cerrar.",
            }),
          ],
        }),
        _jsxs("div", {
          className: "flex-1 space-y-4 overflow-hidden",
          children: [
            translations.length === 0 &&
              _jsxs("div", {
                className: "space-y-2",
                children: [
                  _jsx(Label, { children: "Idiomas" }),
                  _jsx("div", {
                    className: "flex flex-wrap gap-2",
                    children: LANGUAGES.map((lang) =>
                      _jsxs(
                        Badge,
                        {
                          variant: selectedLanguages.includes(lang.code)
                            ? "default"
                            : "outline",
                          className: "cursor-pointer text-base px-3 py-1.5",
                          onClick: () => toggleLanguage(lang.code),
                          children: [
                            _jsx("span", {
                              className: "mr-2",
                              children: lang.flag,
                            }),
                            lang.name,
                          ],
                        },
                        lang.code,
                      ),
                    ),
                  }),
                ],
              }),
            error &&
              _jsxs(Alert, {
                variant: "destructive",
                children: [
                  _jsx(AlertCircle, { className: "h-4 w-4" }),
                  _jsx(AlertDescription, { children: error }),
                ],
              }),
            success &&
              _jsxs(Alert, {
                className: "border-green-200 bg-green-50 text-green-900",
                children: [
                  _jsx(Check, { className: "h-4 w-4 text-green-600" }),
                  _jsx(AlertDescription, { children: success }),
                ],
              }),
            translations.length > 0 &&
              _jsx(ScrollArea, {
                className: "flex-1 pr-4",
                children: _jsx("div", {
                  className: "space-y-6",
                  children: translations.map((trans) => {
                    const langInfo = getLanguageInfo(trans.lang);
                    const hasError = translationErrors[trans.lang];
                    return _jsxs(
                      "div",
                      {
                        className: "border rounded-lg p-4 space-y-3",
                        children: [
                          _jsxs("div", {
                            className: "flex items-center justify-between",
                            children: [
                              _jsxs("div", {
                                className: "flex items-center gap-2",
                                children: [
                                  _jsx("span", {
                                    className: "text-2xl",
                                    children: langInfo?.flag,
                                  }),
                                  _jsx("h3", {
                                    className: "font-semibold text-lg",
                                    children: langInfo?.name,
                                  }),
                                  trans.edited &&
                                    _jsx(Badge, {
                                      variant: "secondary",
                                      className: "text-xs",
                                      children: "Editado",
                                    }),
                                  hasError &&
                                    _jsx(Badge, {
                                      variant: "destructive",
                                      className: "text-xs",
                                      children: "Error",
                                    }),
                                ],
                              }),
                              _jsx(Button, {
                                variant: "ghost",
                                size: "sm",
                                onClick: () => removeTranslation(trans.lang),
                                children: _jsx(X, { className: "h-4 w-4" }),
                              }),
                            ],
                          }),
                          hasError &&
                            _jsxs(Alert, {
                              variant: "destructive",
                              className: "py-2",
                              children: [
                                _jsx(AlertCircle, { className: "h-3 w-3" }),
                                _jsx(AlertDescription, {
                                  className: "text-xs",
                                  children: translationErrors[trans.lang],
                                }),
                              ],
                            }),
                          _jsxs("div", {
                            className: "space-y-2",
                            children: [
                              _jsx(Label, {
                                htmlFor: `title-${trans.lang}`,
                                children: "T\u00EDtulo",
                              }),
                              _jsx(Input, {
                                id: `title-${trans.lang}`,
                                value: trans.title,
                                onChange: (e) =>
                                  updateTranslation(
                                    trans.lang,
                                    "title",
                                    e.target.value,
                                  ),
                                placeholder: "T\u00EDtulo traducido",
                              }),
                            ],
                          }),
                          _jsxs("div", {
                            className: "space-y-2",
                            children: [
                              _jsx(Label, {
                                htmlFor: `description-${trans.lang}`,
                                children: "Descripci\u00F3n",
                              }),
                              _jsx("textarea", {
                                id: `description-${trans.lang}`,
                                value: trans.description,
                                onChange: (e) =>
                                  updateTranslation(
                                    trans.lang,
                                    "description",
                                    e.target.value,
                                  ),
                                placeholder: "Descripci\u00F3n traducida",
                                className:
                                  "w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                rows: 4,
                              }),
                            ],
                          }),
                        ],
                      },
                      trans.lang,
                    );
                  }),
                }),
              }),
          ],
        }),
        _jsx(DialogFooter, {
          className: "gap-2",
          children:
            translations.length === 0
              ? _jsxs(_Fragment, {
                  children: [
                    _jsx(Button, {
                      variant: "outline",
                      onClick: handleClose,
                      children: "Cancelar",
                    }),
                    _jsx(Button, {
                      onClick: handleTranslate,
                      disabled: isTranslating || selectedLanguages.length === 0,
                      children: isTranslating
                        ? _jsxs(_Fragment, {
                            children: [
                              _jsx(Loader2, {
                                className: "mr-2 h-4 w-4 animate-spin",
                              }),
                              "Traduciendo...",
                            ],
                          })
                        : _jsxs(_Fragment, {
                            children: [
                              _jsx(Languages, { className: "mr-2 h-4 w-4" }),
                              "Traducir",
                            ],
                          }),
                    }),
                  ],
                })
              : _jsxs(_Fragment, {
                  children: [
                    _jsx(Button, {
                      variant: "outline",
                      onClick: handleClose,
                      children: "Cerrar sin Guardar",
                    }),
                    _jsxs(Button, {
                      onClick: handleApply,
                      disabled: translations.length === 0,
                      children: [
                        _jsx(CheckCircle2, { className: "mr-2 h-4 w-4" }),
                        "Confirmar Traducciones",
                      ],
                    }),
                  ],
                }),
        }),
      ],
    }),
  });
}
