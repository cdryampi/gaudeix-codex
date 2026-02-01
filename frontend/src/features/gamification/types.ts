export interface UserPoints {
  user_id: number;
  username: string;
  avatar_url?: string;
  points: number;
  level: number;
  next_level_points: number;
  rank_name: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon_url: string;
  is_unlocked: boolean;
  unlocked_at?: string;
  points_reward: number;
}
