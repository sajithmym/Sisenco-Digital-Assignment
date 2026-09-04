import { ROUTES, USER_ROLES } from "@/lib/settings";

export { ROUTES, USER_ROLES };

// ─── Report Statuses ─────────────────────────────────────
export const REPORT_STATUSES = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  NEEDS_CORRECTION: "NEEDS_CORRECTION",
  APPROVED: "APPROVED",
} as const;

export const REPORT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  NEEDS_CORRECTION: "Needs Correction",
  APPROVED: "Approved",
};

export const REPORT_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SUBMITTED: "bg-blue-100 text-blue-800",
  NEEDS_CORRECTION: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
};

// ─── User Roles ──────────────────────────────────────────
export const USER_ROLE_LABELS: Record<string, string> = {
  [USER_ROLES.TEAM_MEMBER]: "Team Member",
  [USER_ROLES.MANAGER]: "Manager",
  [USER_ROLES.ADMIN]: "Admin",
};

// ─── Task Priorities ─────────────────────────────────────
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

// ─── Task Statuses ───────────────────────────────────────
export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE", "BLOCKED"] as const;

export const TASK_STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
  BLOCKED: "Blocked",
};

// ─── Work Hour Types ─────────────────────────────────────
export const WORK_HOUR_TYPES = [
  "DEVELOPMENT",
  "TESTING",
  "MEETINGS",
  "DOCUMENTATION",
  "OTHER",
] as const;

export const WORK_HOUR_TYPE_LABELS: Record<string, string> = {
  DEVELOPMENT: "Development",
  TESTING: "Testing",
  MEETINGS: "Meetings",
  DOCUMENTATION: "Documentation",
  OTHER: "Other",
};

// ─── Pagination ──────────────────────────────────────────
import { PAGINATION_SETTINGS } from "@/lib/settings";

export const PAGINATION = {
  DEFAULT_PAGE: PAGINATION_SETTINGS.defaultPage,
  DEFAULT_LIMIT: PAGINATION_SETTINGS.defaultLimit,
  PAGE_SIZE_OPTIONS: [...PAGINATION_SETTINGS.pageSizeOptions],
} as const;
