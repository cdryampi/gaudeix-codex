import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/config/constants';
import { Event } from '@/features/events/api';

// Types
export interface UserStats {
  total_points: number;
  points_this_month: number;
  ranking_position: number;
  ranking_percentile: number;
  level: string;
  level_number: number;
  member_since: string;
}

export interface UserProfileResponse {
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    avatar?: string;
  };
  stats: UserStats;
  favorites: Event[];
}

// Mock API
export const profileApi = {
  getProfile: async (): Promise<UserProfileResponse> => {
    // const { data } = await apiClient.get<UserProfileResponse>('/users/me/full/');
    // return data;

    return {
      user: {
        id: '1',
        username: 'carlos.gaudeix',
        email: 'carlos@gaudeix.cat',
        name: 'Carlos Gaudeix',
      },
      stats: {
        total_points: 2450,
        points_this_month: 150,
        ranking_position: 12,
        ranking_percentile: 5,
        level: 'Explorador',
        level_number: 5,
        member_since: '2023-06-15T10:00:00Z',
      },
      favorites: [
        {
          id: '1',
          title: 'Fiesta Mayor 2026',
          slug: 'fiesta-mayor',
          summary: 'La mejor fiesta del año',
          start_at: new Date(Date.now() + 86400000).toISOString(),
          end_at: new Date(Date.now() + 172800000).toISOString(),
          location_text: 'Plaza del Ayuntamiento',
          is_featured: true,
          category: { id: 1, name: 'Cultura', icon: '🎭' },
        },
        {
          id: '3',
          title: 'Taller de Cerámica',
          slug: 'taller-ceramica',
          summary: 'Aprende cerámica',
          start_at: new Date(Date.now() + 345600000).toISOString(),
          end_at: new Date(Date.now() + 352800000).toISOString(),
          location_text: 'Centro Cívico',
          is_featured: false,
          category: { id: 2, name: 'Talleres', icon: '🎨' },
        },
      ],
    };
  },
};

// Hooks
export const useUserProfile = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, 'profile'],
    queryFn: profileApi.getProfile,
  });
};
