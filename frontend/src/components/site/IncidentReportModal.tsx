import { useEffect, useRef, useState } from "react";
import { X, CheckCircle, Send, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface IncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "contact" | "error" | "accessibility";
}

export function IncidentReportModal({
  isOpen,
  onClose,
  type,
}: IncidentReportModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const getTitleAndDesc = () => {
    switch (type) {
      case "error":
        return {
          title: "Reportar error de contenido",
          description:
            "¿Has encontrado algún dato incorrecto, desactualizado o erróneo en nuestro portal? Háznoslo saber para corregirlo lo antes posible.",
          subjectPlaceholder:
            "Ej: Horario incorrecto en el Castillo de Burriac",
        };
      case "accessibility":
        return {
          title: "Reportar barrera de accesibilidad",
          description:
            "Nos esforzamos por ofrecer una experiencia sin barreras (WCAG 2.1 AA). Si has tenido dificultades para navegar, descríbelas aquí.",
          subjectPlaceholder: "Ej: Falta de contraste en el listado de playas",
        };
      case "contact":
      default:
        return {
          title: "Contactar con Oficina de Turismo",
          description:
            "¿Tienes dudas sobre tu visita a Cabrera de Mar? Envíanos tus consultas y te responderemos lo antes posible.",
          subjectPlaceholder: "Ej: Duda sobre aparcamientos de autocaravanas",
        };
    }
  };

  const { title, description, subjectPlaceholder } = getTitleAndDesc();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      }
      document.body.style.overflow = "hidden"; // Prevent background scroll
    } else {
      if (typeof dialog.close === "function") {
        dialog.close();
      }
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    // Only close if the backdrop itself was clicked
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger success state
    setIsSubmitted(true);
    toast.success(
      type === "contact"
        ? "Mensaje enviado correctamente"
        : "Incidencia registrada correctamente. ¡Gracias por ayudarnos a mejorar!",
    );
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onClose={onClose}
      className="fixed inset-0 z-50 m-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-[color:var(--color-border-soft)] bg-white p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm dark:bg-slate-900 transition-colors duration-400 focus-visible:outline-none"
    >
      <div className="relative flex flex-col p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[color:var(--color-border-soft)] pb-4">
          <div className="flex items-center gap-2.5">
            {type === "accessibility" || type === "error" ? (
              <AlertTriangle className="h-5 w-5 text-accent shrink-0" />
            ) : (
              <Send className="h-5 w-5 text-primary shrink-0 dark:text-sky-400" />
            )}
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100/80 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        {!isSubmitted ? (
          <div className="mt-6 space-y-6">
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {description}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="report-name"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  id="report-name"
                  required
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-[color:var(--color-border-soft)] bg-slate-50/50 px-4 py-3 text-sm text-slate-950 focus:border-primary focus:bg-white focus:outline-none dark:bg-slate-800 dark:text-slate-100 dark:focus:border-sky-400 focus-visible:ring-0 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="report-email"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Email de Contacto *
                </label>
                <input
                  type="email"
                  id="report-email"
                  required
                  placeholder="ejemplo@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-xl border border-[color:var(--color-border-soft)] bg-slate-50/50 px-4 py-3 text-sm text-slate-950 focus:border-primary focus:bg-white focus:outline-none dark:bg-slate-800 dark:text-slate-100 dark:focus:border-sky-400 focus-visible:ring-0 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="report-subject"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Asunto / Tema *
                </label>
                <input
                  type="text"
                  id="report-subject"
                  required
                  placeholder={subjectPlaceholder}
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full rounded-xl border border-[color:var(--color-border-soft)] bg-slate-50/50 px-4 py-3 text-sm text-slate-950 focus:border-primary focus:bg-white focus:outline-none dark:bg-slate-800 dark:text-slate-100 dark:focus:border-sky-400 focus-visible:ring-0 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="report-message"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Descripción Detallada *
                </label>
                <textarea
                  id="report-message"
                  required
                  rows={4}
                  placeholder="Por favor, proporciónanos el máximo detalle posible..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full rounded-xl border border-[color:var(--color-border-soft)] bg-slate-50/50 px-4 py-3 text-sm text-slate-950 focus:border-primary focus:bg-white focus:outline-none dark:bg-slate-800 dark:text-slate-100 dark:focus:border-sky-400 focus-visible:ring-0 transition-all resize-none"
                />
              </div>

              <div className="text-[10px] text-slate-400 dark:text-slate-500">
                Al enviar este formulario, aceptas que tratemos tus datos con el
                único fin de gestionar y dar respuesta a tu solicitud.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-[color:var(--color-border-soft)] py-3 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-secondary transition-colors"
                >
                  Enviar solicitud
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-emerald-500 animate-in zoom-in duration-300" />
            <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              ¡Envío Completado!
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Hemos registrado la información correctamente. Nuestro equipo
              municipal o el personal de la Oficina de Turismo revisará tu
              solicitud a la mayor brevedad.
            </p>
            <button
              onClick={onClose}
              className="mt-4 rounded-xl bg-primary px-8 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-secondary transition-colors"
            >
              Cerrar Ventana
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
