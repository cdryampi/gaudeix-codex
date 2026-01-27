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
  Globe,
} from "lucide-react";
import { llmApi, AutoTranslateEventResponse } from "../api/llm";
import { LANGUAGES } from "@/lib/config/constants";
import { cn } from "@/lib/utils";

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
 * - Language selection with improved visual feedback
 * - Real-time translation
 * - Editable suggestions
 * - Apply/discard functionality
 */
export function TranslationDialog({
  open,
  onOpenChange,
  eventId,
  currentTitle,
  currentSummary,
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
   * Select all available target languages
   */
  const selectAll = () => {
    setSelectedLanguages(
      LANGUAGES.map((l) => l.code).filter((c) => c !== "ca"),
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
        await llmApi.autoTranslateEvent(eventId, {
          title: currentTitle,
          summary: currentSummary,
          description: currentDescription,
        });

      if (response.success) {
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

        if (response.errors) {
          setTranslationErrors(response.errors);
        }

        if (Object.keys(response.errors || {}).length > 0) {
          setError("Algunas traducciones fallaron. Revisa los errores abajo.");
        } else {
          setSuccess(
            `✓ Traducciones generadas con éxito para ${suggestions.length} idioma${suggestions.length > 1 ? "s" : ""}. Revisa los textos antes de confirmar.`,
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

  const getLanguageInfo = (code: string) => {
    return LANGUAGES.find((lang) => lang.code === code);
  };

  const currentStep = translations.length > 0 ? 2 : 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-2 text-primary-600 mb-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold">
              {currentStep}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Paso {currentStep} de 2
            </span>
          </div>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Languages className="h-6 w-6 text-primary-500" />
            {currentStep === 1 ? "Seleccionar idiomas" : "Revisar traducciones"}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 1
              ? "Elige a qué idiomas quieres traducir el contenido del evento usando IA."
              : "Verifica y edita las traducciones generadas antes de aplicarlas al evento."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 px-6 py-2 overflow-hidden flex flex-col">
          {/* Step 1: Language Selection Grid */}
          {currentStep === 1 && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-gray-500 uppercase">
                  Idiomas disponibles
                </Label>
                <Button
                  variant="link"
                  size="sm"
                  onClick={selectAll}
                  className="h-auto p-0 text-xs"
                >
                  Seleccionar todos
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {LANGUAGES.filter((l) => l.code !== "ca").map((lang) => {
                  const isSelected = selectedLanguages.includes(lang.code);
                  return (
                    <button
                      key={lang.code}
                      onClick={() => toggleLanguage(lang.code)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left",
                        isSelected
                          ? "border-primary-500 bg-primary-50/50 ring-1 ring-primary-500"
                          : "border-border bg-card hover:border-primary-200 hover:bg-muted/30",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <div className="flex flex-col">
                          <span
                            className={cn(
                              "text-sm font-bold",
                              isSelected
                                ? "text-primary-900"
                                : "text-foreground",
                            )}
                          >
                            {lang.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase">
                            {lang.code}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/30 p-4 border border-indigo-100 dark:border-indigo-900 flex items-start gap-3">
                <Globe className="h-5 w-5 text-indigo-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    Idioma de origen: Català
                  </p>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed">
                    Se utilizará el Título, Resumen y Descripción en Catalán
                    para generar las traducciones automáticas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-900 mb-4">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Step 2: Translation Suggestions List */}
          {currentStep === 2 && (
            <ScrollArea className="flex-1 -mr-4 pr-4">
              <div className="space-y-6 py-2">
                {translations.map((trans) => {
                  const langInfo = getLanguageInfo(trans.lang);
                  const hasError = translationErrors[trans.lang];

                  return (
                    <div
                      key={trans.lang}
                      className={cn(
                        "border rounded-2xl overflow-hidden transition-all",
                        trans.edited
                          ? "border-amber-200 shadow-sm"
                          : "border-border bg-muted/20",
                      )}
                    >
                      <div className="bg-muted/50 px-4 py-3 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{langInfo?.flag}</span>
                          <h3 className="font-bold text-sm">
                            Traducción al {langInfo?.name}
                          </h3>
                          {trans.edited && (
                            <Badge
                              variant="outline"
                              className="text-[9px] bg-amber-50 text-amber-700 border-amber-200 uppercase tracking-tight"
                            >
                              Editado
                            </Badge>
                          )}
                          {hasError && (
                            <Badge
                              variant="destructive"
                              className="text-[9px] uppercase"
                            >
                              Error
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600"
                          onClick={() => removeTranslation(trans.lang)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="p-4 space-y-4">
                        {hasError && (
                          <Alert variant="destructive" className="py-2">
                            <AlertCircle className="h-3 w-3" />
                            <AlertDescription className="text-xs">
                              {translationErrors[trans.lang]}
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            Título
                          </Label>
                          <Input
                            value={trans.title}
                            onChange={(e) =>
                              updateTranslation(
                                trans.lang,
                                "title",
                                e.target.value,
                              )
                            }
                            className="bg-background font-medium"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            Resumen breve
                          </Label>
                          <textarea
                            value={trans.summary}
                            onChange={(e) =>
                              updateTranslation(
                                trans.lang,
                                "summary",
                                e.target.value,
                              )
                            }
                            className="w-full min-h-[60px] px-3 py-2 text-sm rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                            rows={2}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            Descripción
                          </Label>
                          <textarea
                            value={trans.description}
                            onChange={(e) =>
                              updateTranslation(
                                trans.lang,
                                "description",
                                e.target.value,
                              )
                            }
                            className="w-full min-h-[120px] px-3 py-2 text-sm rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                            rows={4}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="p-6 border-t bg-muted/20">
          {currentStep === 1 ? (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isTranslating}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleTranslate}
                className="bg-primary-600 hover:bg-primary-700 min-w-[140px]"
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
                    Generar traducciones
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Descartar cambios
              </Button>
              <Button
                onClick={handleApply}
                className="bg-green-600 hover:bg-green-700 min-w-[180px]"
                disabled={translations.length === 0}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirmar y Aplicar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
