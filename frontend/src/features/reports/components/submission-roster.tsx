"use client";
import { useCallback, useState } from "react";
import Link from "next/link";
import { managerApi } from "@/services/manager.api";
import { useResource } from "@/lib/use-resource";
import { formatDate } from "@/lib/utils";
import { Pagination } from "@/components/shared/pagination";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SubmissionRoster({
  weekStart,
  weekEnd,
}: {
  weekStart: string;
  weekEnd: string;
}) {
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const loader = useCallback(
    () =>
      managerApi.getRoster({
        weekStart,
        weekEnd,
        page,
        limit: 20,
        status: status === "ALL" ? undefined : status,
      }),
    [weekStart, weekEnd, page, status],
  );
  const { data, error, loading, reload } = useResource(loader);
  return (
    <Card>
      <CardHeader className="gap-3">
        <CardTitle>Submission tracking</CardTitle>
        <p className="text-sm text-muted-foreground">
          Current active members, one report per week. Due Sunday at 23:59 UTC.
          Draft contents stay private. Late includes overdue missing reports and
          reports first submitted after the deadline.
        </p>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger
            aria-label="Filter submission status"
            className="w-full sm:w-64"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[
              "ALL",
              "NOT_STARTED",
              "DRAFT",
              "SUBMITTED",
              "NEEDS_CORRECTION",
              "APPROVED",
              "PENDING",
              "LATE",
            ].map((value) => (
              <SelectItem key={value} value={value}>
                {value.replaceAll("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data?.data.length ? (
          <p>No members match this status.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm text-left">
                <thead>
                  <tr>
                    {["Member", "Week", "Status", "Timing", "Report"].map(
                      (label) => (
                        <th key={label} className="border-b p-2">
                          {label}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((row) => (
                    <tr key={`${row.userId}:${row.weekStart}`}>
                      <td className="border-b p-2">{row.name}</td>
                      <td className="border-b p-2">
                        {formatDate(row.weekStart)}
                      </td>
                      <td className="border-b p-2">
                        {row.status.replaceAll("_", " ")}
                      </td>
                      <td className="border-b p-2">
                        {row.late
                          ? "Late"
                          : row.submitted
                            ? "On time"
                            : "Pending"}
                      </td>
                      <td className="border-b p-2">
                        {row.reportId ? (
                          <Link
                            className="text-primary underline"
                            href={`/manager/reports/${row.reportId}`}
                          >
                            Review report
                          </Link>
                        ) : row.status === "DRAFT" ? (
                          "Private draft"
                        ) : (
                          "Not started"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={data.meta} onPage={setPage} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
