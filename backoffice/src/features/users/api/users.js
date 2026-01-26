import apiClient from "@/lib/api/client";
export const usersApi = {
  getAll: async () => {
    const response = await apiClient.get("/users/");
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/users/${id}/`);
    return response.data;
  },
  create: async (data) => {
    const response = await apiClient.post("/users/", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.patch(`/users/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    await apiClient.delete(`/users/${id}/`);
  },
};
