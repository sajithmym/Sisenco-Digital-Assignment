"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { reportsApi } from "@/services/reports.api";
import { WeeklyReportForm } from "@/features/reports/components/weekly-report-form";
import type { ReportFormData } from "@/features/reports/schemas/report.schema";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { useToast } from "@/components/ui/toast";
import type { Report } from "@/types";

export default function EditReportPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchReport = async () => { setLoading(true); setError(null); try { setReport(await reportsApi.getById(id)); } catch (err: any) { setError(err.response?.data?.message || "Could not load report"); } finally { setLoading(false); } };
  useEffect(() => { fetchReport(); }, [id]);
  const save = async (data: ReportFormData) => { setSaving(true); try { await reportsApi.update(id, data); toast({ variant: "success", title: "Draft saved", description: "Your changes are ready for submission." }); router.push(`/reports/${id}`); } catch (err: any) { toast({ variant: "error", title: "Could not save report", description: err.response?.data?.message || "Please try again." }); } finally { setSaving(false); } };
  if (loading) return <LoadingState message="Loading report editor..." />;
  if (error) return <ErrorState message={error} onRetry={fetchReport} />;
  if (!report) return <ErrorState message="Report not found" />;
  if (report.status !== "DRAFT" && report.status !== "NEEDS_CORRECTION") return <ErrorState message="This report is read-only and can no longer be edited." />;
  return <div className="space-y-6"><PageHeader title="Edit weekly report" description="Update the draft before submitting it for review." /><WeeklyReportForm initialReport={report} submitLabel="Save changes" saving={saving} onSave={save} onCancel={() => router.push(`/reports/${id}`)} /></div>;
}
