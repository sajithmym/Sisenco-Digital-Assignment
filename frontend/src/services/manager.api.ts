import apiClient from "@/lib/api-client";
import type {
  Report,
  SubmissionRow,
  PaginatedResponse,
  DashboardSummary,
  StatusDistribution,
  TaskTrend,
  ProjectWorkload,
  TimeDistribution,
  ActivityItem,
} from "@/types";

export const managerApi = {
  async getRoster(params: {
    page?: number;
    limit?: number;
    weekStart?: string;
    weekEnd?: string;
    userId?: string;
    status?: string;
  }): Promise<PaginatedResponse<SubmissionRow>> {
    const response = await apiClient.get("/manager/dashboard/roster", {
      params,
    });
    return { data: response.data.data, meta: response.data.meta };
  },
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
    return { data: response.data.data, meta: response.data.meta };
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
  async getSummary(
    weekStart?: string,
    weekEnd?: string,
  ): Promise<DashboardSummary> {
    const response = await apiClient.get("/manager/dashboard/summary", {
      params: { weekStart, weekEnd },
    });
    return response.data.data;
  },

  async getStatusDistribution(
    weekStart?: string,
    weekEnd?: string,
  ): Promise<StatusDistribution[]> {
    const response = await apiClient.get(
      "/manager/dashboard/status-distribution",
      {
        params: { weekStart, weekEnd },
      },
    );
    return response.data.data;
  },

  async getTaskTrends(weeks?: number, weekEnd?: string): Promise<TaskTrend[]> {
    const response = await apiClient.get("/manager/dashboard/task-trends", {
      params: { weeks, weekEnd },
    });
    return response.data.data;
  },

  async getProjectWorkload(
    weekStart?: string,
    weekEnd?: string,
  ): Promise<ProjectWorkload[]> {
    const response = await apiClient.get(
      "/manager/dashboard/project-workload",
      {
        params: { weekStart, weekEnd },
      },
    );
    return response.data.data;
  },

  async getTimeDistribution(
    weekStart?: string,
    weekEnd?: string,
  ): Promise<TimeDistribution[]> {
    const response = await apiClient.get(
      "/manager/dashboard/time-distribution",
      {
        params: { weekStart, weekEnd },
      },
    );
    return response.data.data;
  },

  async getRecentActivity(
    limit?: number,
    weekStart?: string,
    weekEnd?: string,
  ): Promise<ActivityItem[]> {
    const response = await apiClient.get("/manager/dashboard/activity", {
      params: { limit, weekStart, weekEnd },
    });
    return response.data.data;
  },
};
