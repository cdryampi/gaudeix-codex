import apiClient from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/config/constants';

// Types
export type NotificationType = 'urgent' | 'info' | 'success' | 'event';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  action_url?: string;
}

// Mock API Functions
export const notificationsApi = {
  getNotifications: async (): Promise<Notification[]> => {
    // const { data } = await apiClient.get<Notification[]>('/notifications/');
    // return data;

    // MOCK DATA
    return [
      {
        id: '1',
        type: 'urgent',
        title: 'Cambio de ubicación',
        message: 'El concierto de jazz se mueve al pabellón por lluvia.',
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
        is_read: false,
      },
      {
        id: '2',
        type: 'info',
        title: 'Abiertas las inscripciones',
        message: 'Ya puedes apuntarte al taller de cerámica.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        is_read: true,
      },
      {
        id: '3',
        type: 'success',
        title: '+50 Puntos ganados',
        message: 'Por asistir a la Fiesta Mayor.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
        is_read: true,
      },
      {
        id: '4',
        type: 'event',
        title: 'Mañana: Caminata Popular',
        message: 'Recuerda traer agua y calzado cómodo.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        is_read: true,
      },
    ];
  },
};

// Hooks
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getNotifications,
  });
};
