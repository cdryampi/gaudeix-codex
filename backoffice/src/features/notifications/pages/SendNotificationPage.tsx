import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Send,
  Bell,
  Smartphone,
  Users,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { sendNotification, getNotificationHistory } from "../api";
import { NotificationDraft } from "../types";

export const SendNotificationPage = () => {
  const [draft, setDraft] = useState<NotificationDraft>({
    title: "",
    body: "",
    target_audience: "all",
    action_url: "",
  });

  const { data: history } = useQuery({
    queryKey: ["notification-history"],
    queryFn: getNotificationHistory,
  });

  const mutation = useMutation({
    mutationFn: sendNotification,
    onSuccess: () => {
      alert("Notificación enviada correctamente");
      setDraft({ title: "", body: "", target_audience: "all", action_url: "" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(draft);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Push Notifications
          </h1>
          <p className="text-slate-500">
            Envía alertas a los usuarios de la aplicación móvil.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Form Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Nueva Campaña
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Título
              </label>
              <input
                id="title"
                type="text"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Ej: ¡Nuevo restaurante añadido!"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label
                htmlFor="body"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Mensaje
              </label>
              <textarea
                id="body"
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                placeholder="Escribe tu mensaje aquí..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="audience"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Audiencia
                </label>
                <select
                  id="audience"
                  value={draft.target_audience}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      target_audience: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                >
                  <option value="all">Todos los usuarios</option>
                  <option value="specific_users">Usuarios específicos</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="action_url"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Enlace de Acción (Opcional)
                </label>
                <input
                  id="action_url"
                  type="text"
                  value={draft.action_url}
                  onChange={(e) =>
                    setDraft({ ...draft, action_url: e.target.value })
                  }
                  placeholder="/lugares/..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-primary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {mutation.isPending ? "Enviando..." : "Enviar Notificación"}
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Preview & History Section */}
        <div className="space-y-8">
          {/* Live Preview */}
          <div className="bg-slate-100 p-8 rounded-3xl flex flex-col items-center justify-center min-h-[300px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
              Vista Previa iOS
            </p>

            <div className="w-[320px] bg-white rounded-[2rem] shadow-2xl overflow-hidden">
              <div className="bg-slate-50/80 backdrop-blur-md p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-primary rounded-md flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">G</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">
                    AHORA
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-slate-900 mb-1">
                  {draft.title || "Título de la notificación"}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {draft.body ||
                    "El cuerpo del mensaje aparecerá aquí. Asegúrate de que sea claro y atractivo."}
                </p>
              </div>
            </div>
          </div>

          {/* History Mini List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100">
            <h3 className="text-sm font-bold mb-4 text-slate-900">
              Envíos Recientes
            </h3>
            <div className="space-y-4">
              {history?.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between text-sm p-3 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {log.status === "sent" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium text-slate-700">
                      {log.title}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{log.sent_at}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
