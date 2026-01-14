import apiClient from '@/lib/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/config/constants';
import { Event } from './index';

// Extended Event Type
export interface EventDetail extends Event {
  description: string;
  price_text?: string;
  venue_name?: string;
  organizer?: string;
  tags: string[];
  latitude?: number;
  longitude?: number;
  has_checkin?: boolean;
  is_favorite?: boolean;
  attachments?: Array<{
    id: string;
    title: string;
    file: string;
    file_type: string;
  }>;
}

export const eventDetailApi = {
  getEventDetail: async (id: string): Promise<EventDetail> => {
    // const { data } = await apiClient.get<EventDetail>(`/events/${id}/`);
    // return data;

    // MOCK DATA
    return {
      id,
      title: 'Fiesta Mayor 2026',
      slug: 'fiesta-mayor-2026',
      summary: 'La celebración más grande del año con música y actividades.',
      description: 'Disfruta de la mejor fiesta del año con actividades para toda la familia. Tendremos conciertos, talleres, gastronomía local y mucho más. No te pierdas el gran cierre con fuegos artificiales.\n\nHorario:\n10:00 - Apertura\n12:00 - Vermut popular\n20:00 - Conciertos',
      start_at: new Date(Date.now() + 86400000).toISOString(),
      end_at: new Date(Date.now() + 172800000).toISOString(),
      location_text: 'Plaza del Ayuntamiento',
      is_featured: true,
      category: { id: 1, name: 'Cultura', icon: '🎭' },
      price_text: 'Gratuito',
      venue_name: 'Ayuntamiento de Gaudeix',
      tags: ['Fiesta', 'Música', 'Familiar'],
      has_checkin: false,
      is_favorite: false,
      attachments: [
        { id: '1', title: 'Programa Completo', file: 'url', file_type: 'pdf' }
      ]
    };
  },

  checkIn: async (id: string): Promise<void> => {
    // await apiClient.post(`/events/${id}/checkin/`);
    return new Promise(resolve => setTimeout(resolve, 1000));
  },

  toggleFavorite: async (id: string): Promise<void> => {
    // await apiClient.post(`/events/${id}/favorite/`);
    return new Promise(resolve => setTimeout(resolve, 500));
  }
};

// Hooks
export const useEventDetail = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.EVENTS, 'detail', id],
    queryFn: () => eventDetailApi.getEventDetail(id),
  });
};

export const useEventCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventDetailApi.checkIn,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENTS, 'detail', id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] }); // Update points
    },
  });
};
