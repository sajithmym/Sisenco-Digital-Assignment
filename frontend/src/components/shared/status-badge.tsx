"use client";

import { Badge } from "@/components/ui/badge";
import { REPORT_STATUSES, REPORT_STATUS_LABELS } from "@/constants";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusVariantMap: Record<string, "default" | "secondary" | "outline" | "success" | "warning" | "info" | "destructive"> = {
  [REPORT_STATUSES.DRAFT]: "secondary",
  [REPORT_STATUSES.SUBMITTED]: "info",
  [REPORT_STATUSES.NEEDS_CORRECTION]: "warning",
  [REPORT_STATUSES.APPROVED]: "success",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = statusVariantMap[status] || "outline";
  const label = REPORT_STATUS_LABELS[status] || status;

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
