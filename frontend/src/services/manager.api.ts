import apiClient from "@/lib/api-client";
import type {
  Report,
  PaginatedResponse,
  DashboardSummary,
  StatusDistribution,
  TaskTrend,
  ProjectWorkload,
  TimeDistribution,
  ActivityItem,
} from "@/types";

export const managerApi = {
  // ─── Reports ──────────────────────────────────────────
  async getTeamReports(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    projectId?: string;
    status?: string;
    weekStart?: string;
    weekEnd?: string;
  }): Promise<PaginatedResponse<Report>> {
    const response = await apiClient.get("/manager/reports", { params });
    return response.data.data;
  },

  async getTeamReportById(id: string): Promise<Report> {
    const response = await apiClient.get(`/manager/reports/${id}`);
    return response.data.data;
  },

  async requestChanges(id: string, comment: string): Promise<void> {
    await apiClient.post(`/manager/reports/${id}/request-changes`, { comment });
  },

  async approve(id: string): Promise<void> {
    await apiClient.post(`/manager/reports/${id}/approve`);
  },

  // ─── Dashboard ────────────────────────────────────────
  async getSummary(weekStart?: string, weekEnd?: string): Promise<DashboardSummary> {
    const response = await apiClient.get("/manager/dashboard/summary", {
      params: { weekStart, weekEnd },
    });
    return response.data.data;
  },

  async getStatusDistribution(weekStart?: string, weekEnd?: string): Promise<StatusDistribution[]> {
    const response = await apiClient.get("/manager/dashboard/status-distribution", {
      params: { weekStart, weekEnd },
    });
    return response.data.data;
  },

  async getTaskTrends(weeks?: number): Promise<TaskTrend[]> {
    const response = await apiClient.get("/manager/dashboard/task-trends", {
      params: { weeks },
    });
    return response.data.data;
  },

  async getProjectWorkload(weekStart?: string, weekEnd?: string): Promise<ProjectWorkload[]> {
    const response = await apiClient.get("/manager/dashboard/project-workload", {
      params: { weekStart, weekEnd },
    });
    return response.data.data;
  },

  async getTimeDistribution(weekStart?: string, weekEnd?: string): Promise<TimeDistribution[]> {
    const response = await apiClient.get("/manager/dashboard/time-distribution", {
      params: { weekStart, weekEnd },
    });
    return response.data.data;
  },

  async getRecentActivity(limit?: number): Promise<ActivityItem[]> {
    const response = await apiClient.get("/manager/dashboard/activity", {
      params: { limit },
    });
    return response.data.data;
  },
};
