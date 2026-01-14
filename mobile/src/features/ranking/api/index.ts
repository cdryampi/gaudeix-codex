import apiClient from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/config/constants';

// Types
export interface RankedUser {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  rank: number;
  events_completed: number;
  is_current_user?: boolean;
}

export interface RankingResponse {
  results: RankedUser[];
  user_rank: RankedUser;
}

// Mock API
export const rankingApi = {
  getRanking: async (type: 'global' | 'monthly'): Promise<RankingResponse> => {
    // const { data } = await apiClient.get<RankingResponse>('/ranking/', { params: { type } });
    // return data;

    // MOCK DATA
    const mockUsers: RankedUser[] = [
      { id: '1', name: 'Laura M.', points: 3200, rank: 1, events_completed: 45, avatar: 'LM' },
      { id: '2', name: 'Marc T.', points: 2950, rank: 2, events_completed: 40, avatar: 'MT' },
      { id: '3', name: 'Anna S.', points: 2800, rank: 3, events_completed: 38, avatar: 'AS' },
      { id: '4', name: 'Joan P.', points: 2600, rank: 4, events_completed: 35, avatar: 'JP' },
      { id: '5', name: 'Maria R.', points: 2450, rank: 5, events_completed: 32, avatar: 'MR' },
      // ... more users
    ];

    // Add current user at rank 12
    const currentUser: RankedUser = {
      id: 'me',
      name: 'Carlos G.',
      points: 1450,
      rank: 12,
      events_completed: 18,
      is_current_user: true,
      avatar: 'CG'
    };

    return {
      results: [...mockUsers, ...Array(6).fill(null).map((_, i) => ({
        id: `mock-${i+6}`,
        name: `User ${i+6}`,
        points: 2000 - (i * 100),
        rank: i + 6,
        events_completed: 20,
        avatar: `U${i+6}`
      }))],
      user_rank: currentUser
    };
  }
};

// Hooks
export const useRanking = (type: 'global' | 'monthly') => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, 'ranking', type],
    queryFn: () => rankingApi.getRanking(type),
  });
};
