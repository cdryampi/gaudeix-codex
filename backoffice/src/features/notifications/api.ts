import { NotificationDraft, NotificationLog } from "./types";

export const sendNotification = async (
  draft: NotificationDraft,
): Promise<boolean> => {
  console.log("Sending notification:", draft);
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
