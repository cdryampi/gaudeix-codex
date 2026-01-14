export const dashboardApi = {
    getStats: async () => {
        // Ideally this endpoint exists on backend
        // For now we can mock it or try to fetch count from multiple endpoints if needed
        // Assuming a dedicated dashboard endpoint for efficiency
        // MOCK IMPLEMENTATION until backend ready
        return {
            totalUsers: 1250,
            activeEvents: 42,
            totalPlaces: 18,
            pendingNotifications: 5,
            recentActivity: [
                { id: '1', type: 'user_joined', message: 'Nuevo usuario registrado: Maria P.', timestamp: new Date().toISOString() },
                { id: '2', type: 'event_created', message: 'Evento creado: Taller de Cerámica', timestamp: new Date(Date.now() - 3600000).toISOString() },
                { id: '3', type: 'place_updated', message: 'Lugar actualizado: Parc Guell', timestamp: new Date(Date.now() - 7200000).toISOString() },
            ]
        };
    }
};
