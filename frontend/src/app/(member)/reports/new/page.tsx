"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reportsApi } from "@/services/reports.api";
import { reportFormSchema, type ReportFormData } from "@/features/reports/schemas/report.schema";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function NewReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      tasks: [],
      nextWeekTasks: [],
      blockers: [],
      achievements: [],
      workHours: [],
    },
  });

  const onSubmit = async (data: ReportFormData) => {
    setLoading(true);
    setError(null);
    try {
      const report = await reportsApi.create(data);
      router.push(`/reports/${report.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Weekly Report"
        description="Fill in your report for this week"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        {/* Week Range */}
        <Card>
          <CardHeader>
            <CardTitle>Week Range</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weekStart">Week Start</Label>
              <Input id="weekStart" type="date" {...register("weekStart")} />
              {errors.weekStart && (
                <p className="text-sm text-destructive">{errors.weekStart.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekEnd">Week End</Label>
              <Input id="weekEnd" type="date" {...register("weekEnd")} />
              {errors.weekEnd && (
                <p className="text-sm text-destructive">{errors.weekEnd.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any additional notes for this week..."
              {...register("notes")}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Report"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
