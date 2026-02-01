import { UserPoints, Achievement } from "./types";

// Mock data for development
const MOCK_USER_POINTS: UserPoints = {
  user_id: 1,
  username: "ExploradorNovato",
  points: 1250,
  level: 5,
  next_level_points: 2000,
  rank_name: "Caminante de la Costa",
};

const MOCK_RANKINGS: UserPoints[] = [
  {
    ...MOCK_USER_POINTS,
    user_id: 2,
    username: "MasterGuide",
    points: 5000,
    level: 12,
    rank_name: "Leyenda Local",
  },
  {
    ...MOCK_USER_POINTS,
    user_id: 3,
    username: "FoodieBcn",
    points: 4200,
    level: 10,
    rank_name: "Gourmet",
  },
  MOCK_USER_POINTS,
  {
    ...MOCK_USER_POINTS,
    user_id: 4,
    username: "WeekendWarrior",
    points: 800,
    level: 3,
    rank_name: "Turista",
  },
];

export const getUserPoints = async (): Promise<UserPoints> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_USER_POINTS;
};

export const getRankings = async (
  period: "global" | "monthly" = "global",
): Promise<UserPoints[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return period === "global" ? MOCK_RANKINGS : MOCK_RANKINGS.slice(0, 2);
};

export const getAchievements = async (): Promise<Achievement[]> => {
  return [
    {
      id: 1,
      title: "Primeros Pasos",
      description: "Completa tu registro",
      icon_url: "",
      is_unlocked: true,
      points_reward: 50,
      unlocked_at: "2023-01-01",
    },
    {
      id: 2,
      title: "Reseñador",
      description: "Escribe tu primera reseña",
      icon_url: "",
      is_unlocked: false,
      points_reward: 100,
    },
  ];
};
