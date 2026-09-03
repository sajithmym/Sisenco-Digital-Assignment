// ─── User ────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: "TEAM_MEMBER" | "MANAGER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: { reports: number };
}

// ─── Project ─────────────────────────────────────────────
export interface Project {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Report ──────────────────────────────────────────────
export interface Report {
  id: string;
  userId: string;
  projectId: string | null;
  weekStart: string;
  weekEnd: string;
  status: "DRAFT" | "SUBMITTED" | "NEEDS_CORRECTION" | "APPROVED";
  notes: string | null;
  latestVersionNumber: number;
  submittedAt: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string };
  project?: Project;
  tasks?: ReportTask[];
  nextWeekTasks?: NextWeekTask[];
  blockers?: Blocker[];
  achievements?: Achievement[];
  workHours?: WorkHour[];
  versions?: ReportVersion[];
  reviews?: Review[];
}

export interface ReportTask {
  id: string;
  reportId: string;
  taskName: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  plannedPercentage: number;
  actualPercentage: number;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
  plannedMinutes: number;
  actualMinutes: number;
  deliverable: string | null;
}

export interface NextWeekTask {
  id: string;
  reportId: string;
  description: string;
  sortOrder: number;
}

export interface Blocker {
  id: string;
  reportId: string;
  description: string;
  isKeyIssue: boolean;
  isResolved: boolean;
}

export interface Achievement {
  id: string;
  reportId: string;
  description: string;
  isKeyAchievement: boolean;
}

export interface WorkHour {
  id: string;
  reportId: string;
  type: "DEVELOPMENT" | "TESTING" | "MEETINGS" | "DOCUMENTATION" | "OTHER";
  minutes: number;
}

// ─── Report Version ──────────────────────────────────────
export interface ReportVersion {
  id: string;
  reportId: string;
  versionNumber: number;
  snapshotJson: any;
  submittedAt: string;
  createdById: string;
  createdBy?: { id: string; name: string };
  reviews?: Review[];
}

// ─── Review ──────────────────────────────────────────────
export interface Review {
  id: string;
  reportId: string;
  reportVersionId: string | null;
  reviewerId: string;
  action: "APPROVED" | "CHANGES_REQUESTED";
  comment: string | null;
  createdAt: string;
  reviewer?: { id: string; name: string };
  reportVersion?: ReportVersion;
  report?: Report;
}

// ─── Dashboard ───────────────────────────────────────────
export interface DashboardSummary {
  totalReports: number;
  submittedCount: number;
  approvedCount: number;
  needsCorrectionCount: number;
  draftCount: number;
  totalTeamMembers: number;
  openBlockers: number;
  complianceRate: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface TaskTrend {
  week: string;
  total: number;
  completed: number;
}

export interface ProjectWorkload {
  projectId: string;
  projectName: string;
  reportCount: number;
  totalMinutes: number;
}

export interface TimeDistribution {
  type: string;
  totalMinutes: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  comment: string | null;
  createdAt: string;
  reviewer: { id: string; name: string };
  report: {
    id: string;
    weekStart: string;
    weekEnd: string;
    user: { id: string; name: string };
    project: { id: string; name: string } | null;
  };
}

// ─── Pagination ──────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Auth ────────────────────────────────────────────────
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
