"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { reportsApi } from "@/services/reports.api";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { Report, PaginatedResponse } from "@/types";

export default function MemberDashboardPage() {
  const [data, setData] = useState<PaginatedResponse<Report> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsApi.getMyReports({ page: 1, limit: 10 });
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchReports} />;

  const recentReports = data?.data || [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Dashboard"
        description="View and manage your weekly reports"
        action={
          <Link href="/reports/new">
            <Button>New Report</Button>
          </Link>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.meta.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {recentReports.filter((r) => r.status === "APPROVED").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {recentReports.filter((r) => r.status === "SUBMITTED").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Needs Correction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {recentReports.filter((r) => r.status === "NEEDS_CORRECTION").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
        {recentReports.length === 0 ? (
          <EmptyState
            title="No reports yet"
            description="Create your first weekly report to get started."
            action={
              <Link href="/reports/new">
                <Button>Create Report</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {recentReports.map((report) => (
              <Link key={report.id} href={`/reports/${report.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        Week of {formatDate(report.weekStart)} — {formatDate(report.weekEnd)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {report.project?.name || "No project"} • Version {report.latestVersionNumber}
                      </p>
                    </div>
                    <StatusBadge status={report.status} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
