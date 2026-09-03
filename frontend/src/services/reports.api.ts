import apiClient from "@/lib/api-client";
import type { Report, PaginatedResponse, ReportVersion } from "@/types";

export const reportsApi = {
  async create(data: any): Promise<Report> {
    const response = await apiClient.post("/reports", data);
    return response.data.data;
  },

  async getMyReports(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Report>> {
    const response = await apiClient.get("/reports/my", { params });
    return response.data.data;
  },

  async getById(id: string): Promise<Report> {
    const response = await apiClient.get(`/reports/${id}`);
    return response.data.data;
  },

  async update(id: string, data: any): Promise<Report> {
    const response = await apiClient.patch(`/reports/${id}`, data);
    return response.data.data;
  },

  async submit(id: string): Promise<Report> {
    const response = await apiClient.post(`/reports/${id}/submit`);
    return response.data.data;
  },

  async getVersions(id: string): Promise<ReportVersion[]> {
    const response = await apiClient.get(`/reports/${id}/versions`);
    return response.data.data;
  },
};
