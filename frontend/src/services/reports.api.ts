import apiClient from "@/lib/api-client";
import type { Report, PaginatedResponse, ReportVersion } from "@/types";
import type { ReportFormData } from "@/features/reports/schemas/report.schema";

export type CreateReportPayload = ReportFormData;
export type UpdateReportPayload = Partial<ReportFormData>;

export const reportsApi = {
  async getMySummary(): Promise<Record<string, number>> {
    const response = await apiClient.get("/reports/my/summary");
    return response.data.data;
  },
  async create(data: CreateReportPayload): Promise<Report> {
    const response = await apiClient.post("/reports", data);
    return response.data.data;
  },

  async getMyReports(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Report>> {
    const response = await apiClient.get("/reports/my", { params });
    return { data: response.data.data, meta: response.data.meta };
  },

  async getById(id: string): Promise<Report> {
    const response = await apiClient.get(`/reports/${id}`);
    return response.data.data;
  },

  async update(id: string, data: UpdateReportPayload): Promise<Report> {
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
