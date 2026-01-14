import apiClient from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/config/constants';

// Types
export interface Event {
  id: string;
  title: string;
  slug: string;
  summary: string;
  start_at: string;
  end_at: string;
  location_text: string;
  is_featured: boolean;
  featured_media?: {
    thumbnail: string;
    medium: string;
    large: string;
  };
  category: {
    id: number;
    name: string;
    icon?: string;
  };
}

export interface EventsResponse {
  results: Event[];
  count: number;
}

// API Functions
export const eventsApi = {
  getFeaturedEvents: async (): Promise<Event[]> => {
    // const { data } = await apiClient.get<EventsResponse>('/events/', {
    //   params: { is_featured: true, limit: 5 }
    // });
    // return data.results;

    // MOCK DATA until backend is ready/populated
    return [
      {
        id: '1',
        title: 'Fiesta Mayor 2026',
        slug: 'fiesta-mayor-2026',
        summary: 'La celebración más grande del año con música y actividades.',
        start_at: new Date(Date.now() + 86400000).toISOString(),
        end_at: new Date(Date.now() + 172800000).toISOString(),
        location_text: 'Plaza del Ayuntamiento',
        is_featured: true,
        category: { id: 1, name: 'Cultura', icon: '🎭' }
      },
      {
        id: '2',
        title: 'Concierto de Jazz',
        slug: 'concierto-jazz',
        summary: 'Noche de jazz bajo las estrellas en el castillo.',
        start_at: new Date(Date.now() + 259200000).toISOString(),
        end_at: new Date(Date.now() + 266400000).toISOString(),
        location_text: 'Castillo de Gaudeix',
        is_featured: true,
        category: { id: 1, name: 'Música', icon: '🎵' }
      }
    ];
  },

  getUpcomingEvents: async (): Promise<Event[]> => {
    // const { data } = await apiClient.get<EventsResponse>('/events/', {
    //   params: { upcoming: true, limit: 10 }
    // });
    // return data.results;

     // MOCK DATA
     return [
      {
        id: '3',
        title: 'Taller de Cerámica',
        slug: 'taller-ceramica',
        summary: 'Aprende las técnicas básicas de la cerámica local.',
        start_at: new Date(Date.now() + 345600000).toISOString(),
        end_at: new Date(Date.now() + 352800000).toISOString(),
        location_text: 'Centro Cívico',
        is_featured: false,
        category: { id: 2, name: 'Talleres', icon: '🎨' }
      },
      {
        id: '4',
        title: 'Caminata Popular',
        slug: 'caminata-popular',
        summary: 'Recorrido por los senderos naturales del municipio.',
        start_at: new Date(Date.now() + 432000000).toISOString(),
        end_at: new Date(Date.now() + 446400000).toISOString(),
        location_text: 'Salida desde el Polideportivo',
        is_featured: false,
        category: { id: 3, name: 'Deporte', icon: '🏃' }
      }
    ];
  }
};

// React Query Hooks
export const useFeaturedEvents = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.EVENTS, 'featured'],
    queryFn: eventsApi.getFeaturedEvents,
  });
};

export const useUpcomingEvents = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.EVENTS, 'upcoming'],
    queryFn: eventsApi.getUpcomingEvents,
  });
};
