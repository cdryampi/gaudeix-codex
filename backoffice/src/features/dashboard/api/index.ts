import client from "@/lib/api/client";

export interface DashboardStats {
  totalUsers: number;
  activeEvents: number;
  totalPlaces: number;
  pendingNotifications: number;
  recentActivity: Array<{
    id: string;
    type: "user_joined" | "event_created" | "place_updated";
    message: string;
    timestamp: string;
  }>;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await client.get<DashboardStats>("/dashboard/");
    return data;
  },
};
