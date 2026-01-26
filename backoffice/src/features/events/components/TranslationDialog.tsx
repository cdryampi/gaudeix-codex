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
import { llmApi, AutoTranslateEventResponse } from "../api/llm";
import { LANGUAGES } from "@/lib/config/constants";

/**
 * Translation suggestion for a single language
 */
interface TranslationSuggestion {
  lang: string;
  title: string;
  summary: string;
  description: string;
  edited: boolean;
}

/**
 * TranslationDialog Props
 */
interface TranslationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  currentTitle: string;
  currentSummary: string;
  currentDescription: string;
  onApplyTranslations: (translations: {
    [lang: string]: { title: string; summary: string; description: string };
  }) => void;
}

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
}: TranslationDialogProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [translations, setTranslations] = useState<TranslationSuggestion[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [translationErrors, setTranslationErrors] = useState<{
    [lang: string]: string;
  }>({});

  /**
   * Toggle language selection
   */
  const toggleLanguage = (langCode: string) => {
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
      const response: AutoTranslateEventResponse =
        await llmApi.autoTranslateEvent(eventId);

      if (response.success) {
        // Convert response to translation suggestions
        const suggestions: TranslationSuggestion[] = selectedLanguages
          .filter((lang) => response.translations[lang])
          .map((lang) => ({
            lang,
            title: response.translations[lang].title,
            summary: response.translations[lang].summary || "",
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
  const updateTranslation = (
    lang: string,
    field: "title" | "summary" | "description",
    value: string,
  ) => {
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
  const removeTranslation = (lang: string) => {
    setTranslations((prev) => prev.filter((trans) => trans.lang !== lang));
    setSelectedLanguages((prev) => prev.filter((code) => code !== lang));
  };

  /**
   * Apply translations and close dialog
   */
  const handleApply = () => {
    const translationsToApply = translations.reduce(
      (acc, trans) => {
        acc[trans.lang] = {
          title: trans.title,
          summary: trans.summary,
          description: trans.description,
        };
        return acc;
      },
      {} as {
        [lang: string]: { title: string; summary: string; description: string };
      },
    );

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
  const getLanguageInfo = (code: string) => {
    return LANGUAGES.find((lang) => lang.code === code);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Traducir Evento con IA
          </DialogTitle>
          <DialogDescription>
            Selecciona los idiomas a los que quieres traducir este evento. Las
            traducciones se guardan automáticamente en el servidor y puedes
            revisarlas antes de cerrar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Language Selection */}
          {translations.length === 0 && (
            <div className="space-y-2">
              <Label>Idiomas</Label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <Badge
                    key={lang.code}
                    variant={
                      selectedLanguages.includes(lang.code)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer text-base px-3 py-1.5"
                    onClick={() => toggleLanguage(lang.code)}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-900">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Translation Suggestions */}
          {translations.length > 0 && (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6">
                {translations.map((trans) => {
                  const langInfo = getLanguageInfo(trans.lang);
                  const hasError = translationErrors[trans.lang];

                  return (
                    <div
                      key={trans.lang}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{langInfo?.flag}</span>
                          <h3 className="font-semibold text-lg">
                            {langInfo?.name}
                          </h3>
                          {trans.edited && (
                            <Badge variant="secondary" className="text-xs">
                              Editado
                            </Badge>
                          )}
                          {hasError && (
                            <Badge variant="destructive" className="text-xs">
                              Error
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTranslation(trans.lang)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {hasError && (
                        <Alert variant="destructive" className="py-2">
                          <AlertCircle className="h-3 w-3" />
                          <AlertDescription className="text-xs">
                            {translationErrors[trans.lang]}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor={`title-${trans.lang}`}>Título</Label>
                        <Input
                          id={`title-${trans.lang}`}
                          value={trans.title}
                          onChange={(e) =>
                            updateTranslation(
                              trans.lang,
                              "title",
                              e.target.value,
                            )
                          }
                          placeholder="Título traducido"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`summary-${trans.lang}`}>
                          Resumen breve
                        </Label>
                        <textarea
                          id={`summary-${trans.lang}`}
                          value={trans.summary}
                          onChange={(e) =>
                            updateTranslation(
                              trans.lang,
                              "summary",
                              e.target.value,
                            )
                          }
                          placeholder="Resumen breve traducido"
                          className="w-full min-h-[60px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`description-${trans.lang}`}>
                          Descripción
                        </Label>
                        <textarea
                          id={`description-${trans.lang}`}
                          value={trans.description}
                          onChange={(e) =>
                            updateTranslation(
                              trans.lang,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="Descripción traducida"
                          className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          rows={4}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="gap-2">
          {translations.length === 0 ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleTranslate}
                disabled={isTranslating || selectedLanguages.length === 0}
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traduciendo...
                  </>
                ) : (
                  <>
                    <Languages className="mr-2 h-4 w-4" />
                    Traducir
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cerrar sin Guardar
              </Button>
              <Button
                onClick={handleApply}
                disabled={translations.length === 0}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirmar Traducciones
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
