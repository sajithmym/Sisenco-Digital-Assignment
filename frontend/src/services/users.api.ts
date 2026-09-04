import apiClient from "@/lib/api-client";
import type { User, PaginatedResponse } from "@/types";

export type UserRole = User["role"];
export type CreateUserPayload = { name: string; email: string; password: string; role?: UserRole };

export const usersApi = {
  async getAll(params?: { page?: number; limit?: number; search?: string; role?: UserRole; isActive?: boolean }): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get("/users", { params });
    return { data: response.data.data, meta: response.data.meta };
  },

  async create(data: CreateUserPayload): Promise<User> {
    const response = await apiClient.post("/users", data);
    return response.data.data;
  },

  async getById(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data.data;
  },

  async updateRole(id: string, role: UserRole): Promise<User> {
    const response = await apiClient.patch(`/users/${id}/role`, { role });
    return response.data.data;
  },

  async updateStatus(id: string, isActive: boolean): Promise<User> {
    const response = await apiClient.patch(`/users/${id}/status`, { isActive });
    return response.data.data;
  },
};
