import apiClient from "@/lib/api-client";
import type { Project, PaginatedResponse } from "@/types";

export const projectsApi = {
  async getAll(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Project>> {
    const response = await apiClient.get("/projects", { params });
    return { data: response.data.data, meta: response.data.meta };
  },

  async getById(id: string): Promise<Project> {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data.data;
  },

  async create(data: { name: string; description?: string }): Promise<Project> {
    const response = await apiClient.post("/projects", data);
    return response.data.data;
  },

  async update(id: string, data: Partial<Project>): Promise<Project> {
    const response = await apiClient.patch(`/projects/${id}`, data);
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },
};
