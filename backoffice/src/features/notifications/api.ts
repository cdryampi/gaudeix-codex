import { NotificationDraft, NotificationLog } from "./types";

export const sendNotification = async (
  _draft: NotificationDraft,
): Promise<boolean> => {
  void _draft;
  // TODO: implementar llamada real al endpoint de notificaciones
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return true;
};

export const getNotificationHistory = async (): Promise<NotificationLog[]> => {
  return [
    {
      id: 1,
      title: "Bienvenida al Carnaval",
      sent_at: "2024-02-01 10:00",
      recipient_count: 1500,
      status: "sent",
    },
    {
      id: 2,
      title: "Aviso de Mantenimiento",
      sent_at: "2024-01-28 09:00",
      recipient_count: 1500,
      status: "sent",
    },
  ];
};
