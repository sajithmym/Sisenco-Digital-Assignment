"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { managerApi } from "@/services/manager.api";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatDate, formatMinutes } from "@/lib/utils";
import type { Report } from "@/types";

export default function ManagerReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await managerApi.getTeamReportById(params.id as string);
      setReport(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [params.id]);

  const handleApprove = async () => {
    if (!report) return;
    setActionLoading(true);
    try {
      await managerApi.approve(report.id);
      fetchReport();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve report");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!report || !comment.trim()) return;
    setActionLoading(true);
    try {
      await managerApi.requestChanges(report.id, comment.trim());
      setComment("");
      fetchReport();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to request changes");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchReport} />;
  if (!report) return <ErrorState message="Report not found" />;

  const isReviewable = report.status === "SUBMITTED";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${report.user?.name || "Unknown"} — ${formatDate(report.weekStart)} — ${formatDate(report.weekEnd)}`}
        description={`Version ${report.latestVersionNumber} • ${report.project?.name || "No project"}`}
        action={<StatusBadge status={report.status} />}
      />

      {/* Notes */}
      {report.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{report.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Tasks */}
      {report.tasks && report.tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{task.taskName}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.priority} • {task.status} • {formatMinutes(task.actualMinutes)} / {formatMinutes(task.plannedMinutes)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{task.actualPercentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blockers */}
      {report.blockers && report.blockers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Blockers</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.blockers.map((b) => (
                <li key={b.id} className="flex items-center gap-2 text-sm">
                  <span className={b.isKeyIssue ? "text-red-500" : "text-gray-400"}>●</span>
                  {b.description}
                  {b.isResolved && <span className="text-green-600 text-xs">(Resolved)</span>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      {report.achievements && report.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.achievements.map((a) => (
                <li key={a.id} className="flex items-center gap-2 text-sm">
                  <span className={a.isKeyAchievement ? "text-yellow-500" : "text-gray-400"}>★</span>
                  {a.description}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Work Hours */}
      {report.workHours && report.workHours.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Work Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.workHours.map((wh) => (
                <div key={wh.id} className="flex justify-between text-sm">
                  <span>{wh.type}</span>
                  <span>{formatMinutes(wh.minutes)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>
                  {formatMinutes(report.workHours.reduce((sum, wh) => sum + wh.minutes, 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews */}
      {report.reviews && report.reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Review History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.reviews.map((review) => (
                <div key={review.id} className="p-3 border rounded-md">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{review.reviewer?.name}</p>
                    <StatusBadge status={review.action === "APPROVED" ? "APPROVED" : "NEEDS_CORRECTION"} />
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Actions */}
      {isReviewable && (
        <Card>
          <CardHeader>
            <CardTitle>Review Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comment">Comment (required for changes request)</Label>
              <Textarea
                id="comment"
                placeholder="Enter review comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Button
                onClick={handleApprove}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {actionLoading ? "Processing..." : "Approve"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleRequestChanges}
                disabled={actionLoading || !comment.trim()}
              >
                {actionLoading ? "Processing..." : "Request Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Button variant="outline" onClick={() => router.back()}>
        Back
      </Button>
    </div>
  );
}
