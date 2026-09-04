"use client";

import { useEffect, useState } from "react";
import { managerApi } from "@/services/manager.api";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateTime, formatMinutes } from "@/lib/utils";
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Users,
  ShieldAlert,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type {
  DashboardSummary,
  StatusDistribution,
  TaskTrend,
  ProjectWorkload,
  TimeDistribution,
  ActivityItem,
} from "@/types";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function ManagerDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [statusDist, setStatusDist] = useState<StatusDistribution[]>([]);
  const [taskTrends, setTaskTrends] = useState<TaskTrend[]>([]);
  const [projectWorkload, setProjectWorkload] = useState<ProjectWorkload[]>([]);
  const [timeDist, setTimeDist] = useState<TimeDistribution[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, st, tt, pw, td, act] = await Promise.all([
        managerApi.getSummary(),
        managerApi.getStatusDistribution(),
        managerApi.getTaskTrends(8),
        managerApi.getProjectWorkload(),
        managerApi.getTimeDistribution(),
        managerApi.getRecentActivity(10),
      ]);
      setSummary(s);
      setStatusDist(st);
      setTaskTrends(tt);
      setProjectWorkload(pw);
      setTimeDist(td);
      setActivity(act);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Manager Dashboard"
        description="Team overview and analytics"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        <MetricCard
          title="Reports Submitted"
          value={summary?.submittedCount || 0}
          icon={<FileText className="h-4 w-4" />}
        />
        <MetricCard
          title="Approved"
          value={summary?.approvedCount || 0}
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <MetricCard
          title="Needs Correction"
          value={summary?.needsCorrectionCount || 0}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <MetricCard
          title="Team Members"
          value={summary?.totalTeamMembers || 0}
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Open Blockers"
          value={summary?.openBlockers || 0}
          icon={<ShieldAlert className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {statusDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDist}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {statusDist.map((entry, index) => (
                      <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data</p>
            )}
          </CardContent>
        </Card>

        {/* Task Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {taskTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={taskTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#8884d8" name="Total" />
                  <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data</p>
            )}
          </CardContent>
        </Card>

        {/* Project Workload */}
        <Card>
          <CardHeader>
            <CardTitle>Project Workload</CardTitle>
          </CardHeader>
          <CardContent>
            {projectWorkload.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectWorkload}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="projectName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="reportCount" fill="#8884d8" name="Reports" />
                  <Bar dataKey="totalMinutes" fill="#FFBB28" name="Minutes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data</p>
            )}
          </CardContent>
        </Card>

        {/* Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Time Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {timeDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={timeDist}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, totalMinutes }) =>
                      `${type}: ${formatMinutes(totalMinutes)}`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="totalMinutes"
                  >
                    {timeDist.map((entry, index) => (
                      <Cell key={entry.type} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length > 0 ? (
            <div className="space-y-3">
              {activity.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-3 border rounded-md">
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{item.reviewer.name}</span>{" "}
                      {item.action === "APPROVED" ? "approved" : "requested changes on"}{" "}
                      <span className="font-medium">{item.report.user.name}&apos;s</span>{" "}
                      report
                      {item.report.project && (
                        <span> for {item.report.project.name}</span>
                      )}
                    </p>
                    {item.comment && (
                      <p className="text-sm text-muted-foreground mt-1">
                        &quot;{item.comment}&quot;
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
