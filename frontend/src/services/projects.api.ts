import apiClient from "@/lib/api-client";
import type { Project, PaginatedResponse } from "@/types";

export type CreateProjectPayload = {
  name: string;
  description?: string;
};

export type UpdateProjectPayload = Partial<
  Pick<Project, "name" | "description" | "isActive">
>;

export const projectsApi = {
  async getAll(params?: { page?: number; limit?: number; search?: string; isActive?: boolean }): Promise<PaginatedResponse<Project>> {
    const response = await apiClient.get("/projects", { params });
    return { data: response.data.data, meta: response.data.meta };
  },

  async getById(id: string): Promise<Project> {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data.data;
  },

  async create(data: CreateProjectPayload): Promise<Project> {
    const response = await apiClient.post("/projects", data);
    return response.data.data;
  },

  async update(id: string, data: UpdateProjectPayload): Promise<Project> {
    const response = await apiClient.patch(`/projects/${id}`, data);
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },
};
