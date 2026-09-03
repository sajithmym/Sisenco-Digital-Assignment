import apiClient from "@/lib/api-client";
import type { User, PaginatedResponse } from "@/types";

export const usersApi = {
  async getAll(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get("/users", { params });
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  async updateRole(id: string, role: string): Promise<User> {
    const response = await apiClient.patch(`/users/${id}/role`, { role });
    return response.data;
  },

  async updateStatus(id: string, isActive: boolean): Promise<User> {
    const response = await apiClient.patch(`/users/${id}/status`, { isActive });
    return response.data;
  },
};
