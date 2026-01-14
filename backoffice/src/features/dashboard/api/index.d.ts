export interface DashboardStats {
    totalUsers: number;
    activeEvents: number;
    totalPlaces: number;
    pendingNotifications: number;
    recentActivity: Array<{
        id: string;
        type: 'user_joined' | 'event_created' | 'place_updated';
        message: string;
        timestamp: string;
    }>;
}
export declare const dashboardApi: {
    getStats: () => Promise<DashboardStats>;
};
