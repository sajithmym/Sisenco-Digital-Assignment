"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { managerApi } from "@/services/manager.api";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { REPORT_STATUSES } from "@/constants";
import type { Report, PaginatedResponse } from "@/types";

export default function ManagerReportsPage() {
  const [data, setData] = useState<PaginatedResponse<Report> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    weekStart: "",
    weekEnd: "",
  });

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: 1, limit: 50 };
      if (filters.status) params.status = filters.status;
      if (filters.weekStart) params.weekStart = filters.weekStart;
      if (filters.weekEnd) params.weekEnd = filters.weekEnd;

      const result = await managerApi.getTeamReports(params);
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

  const reports = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Reports"
        description="Review and manage team weekly reports"
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.values(REPORT_STATUSES).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Week Start</Label>
              <Input
                type="date"
                value={filters.weekStart}
                onChange={(e) => setFilters({ ...filters, weekStart: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Week End</Label>
              <Input
                type="date"
                value={filters.weekEnd}
                onChange={(e) => setFilters({ ...filters, weekEnd: e.target.value })}
              />
            </div>
            <Button onClick={fetchReports}>Apply Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchReports} />
      ) : reports.length === 0 ? (
        <EmptyState title="No reports found" description="No reports match your filters." />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Link key={report.id} href={`/manager/reports/${report.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{report.user?.name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">
                      Week of {formatDate(report.weekStart)} — {formatDate(report.weekEnd)} •{" "}
                      {report.project?.name || "No project"}
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
  );
}
