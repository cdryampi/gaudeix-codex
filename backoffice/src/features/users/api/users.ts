import apiClient from "@/lib/api/client";
import { User, CreateUserDTO, UpdateUserDTO } from "../types";

export const usersApi = {
  getAll: async () => {
    const response = await apiClient.get<User[]>("/users/");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<User>(`/users/${id}/`);
    return response.data;
  },

  create: async (data: CreateUserDTO) => {
    const response = await apiClient.post<User>("/users/", data);
    return response.data;
  },

  update: async (id: number, data: UpdateUserDTO) => {
    const response = await apiClient.patch<User>(`/users/${id}/`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/users/${id}/`);
  },
};
