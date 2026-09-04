// ─── Backend Settings ───────────────────────────────────────
// All configuration values are centralized here.
// Environment variables take priority; these are fallback defaults.

import { ReportStatus } from './common/enums/report-status.enum';
import { UserRole } from './common/enums/user-role.enum';

// ─── Database ───────────────────────────────────────────────
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5432';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_NAME = process.env.DB_NAME || 'weekly_report_db';

export const DB_SETTINGS = {
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  name: DB_NAME,
  /** Full connection string — built from individual fields if DATABASE_URL is missing */
  url:
    process.env.DATABASE_URL ||
    `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
} as const;

// ─── Server ─────────────────────────────────────────────────
export const SERVER_SETTINGS = {
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  apiPrefix: 'api/v1',
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;

// ─── JWT / Auth ─────────────────────────────────────────────
export const AUTH_SETTINGS = {
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  jwtRefreshExpiresInDays: 7,
  passwordHashRounds: 12,
  messages: {
    invalidCredentials: 'Invalid credentials',
    accountDeactivated: 'Account is deactivated',
    invalidRefreshToken: 'Invalid refresh token',
    expiredRefreshToken: 'Refresh token expired',
    usedRefreshToken: 'Refresh token has already been used',
    userNotFoundOrInactive: 'User not found or inactive',
    emailAlreadyRegistered: 'Email already registered',
  },
} as const;

// ─── Domain Defaults and Workflow ──────────────────────────
// Database states belong to enums; these settings define application behavior around them.
export const REPORT_SETTINGS = {
  defaultTaskPriority: 'MEDIUM',
  defaultTaskStatus: 'TODO',
  editableStatuses: [ReportStatus.DRAFT, ReportStatus.NEEDS_CORRECTION] as const,
  messages: {
    invalidWeekRange: 'Week end must be after or equal to week start',
    projectNotFound: 'Project not found',
    inactiveProject: 'Project is deactivated and cannot be used',
    reportNotFound: 'Report not found',
    reportAccessDenied: 'You do not have access to this report',
    reportOwnershipDenied: 'You can only edit your own reports',
    reportReadOnly: 'Report is not editable in current status',
    reportMustBeSubmitted: 'Report is not in SUBMITTED status',
    cannotSubmitInStatus: (status: ReportStatus) => `Cannot submit report in ${status} status`,
    onlyOneKeyIssue: 'Only one blocker can be marked as the key issue',
    onlyOneKeyAchievement: 'Only one achievement can be marked as the key achievement',
    commentRequired: 'Comment is required when requesting changes',
  },
} as const;

export const PROJECT_SETTINGS = {
  messages: {
    notFound: 'Project not found',
  },
} as const;

export const USER_SETTINGS = {
  defaultRole: UserRole.TEAM_MEMBER,
  messages: {
    notFound: 'User not found',
    cannotChangeOwnRole: 'You cannot change your own role',
    cannotChangeOwnStatus: 'You cannot change your own account status',
  },
} as const;

// ─── API Response Messages ─────────────────────────────────
// Centralized so response copy can be kept consistent or later moved to i18n.
export const API_RESPONSE_MESSAGES = {
  auth: {
    registered: 'Account registered successfully',
    loggedIn: 'Logged in successfully',
    refreshed: 'Tokens refreshed successfully',
    loggedOut: 'Logged out successfully',
    userFetched: 'User fetched successfully',
  },
  users: {
    fetched: 'Users fetched successfully',
    created: 'User created successfully',
    userFetched: 'User fetched successfully',
    roleUpdated: 'User role updated successfully',
    statusUpdated: 'User status updated successfully',
  },
  projects: {
    fetched: 'Projects fetched successfully',
    projectFetched: 'Project fetched successfully',
    created: 'Project created successfully',
    updated: 'Project updated successfully',
    deactivated: 'Project deactivated successfully',
  },
  reports: {
    created: 'Report created successfully',
    fetched: 'Reports fetched successfully',
    reportFetched: 'Report fetched successfully',
    updated: 'Report updated successfully',
    submitted: 'Report submitted successfully',
    versionHistoryFetched: 'Version history fetched successfully',
    changesRequested: 'Changes requested successfully',
    approved: 'Report approved successfully',
  },
  dashboard: {
    summaryFetched: 'Summary fetched successfully',
    statusDistributionFetched: 'Status distribution fetched successfully',
    taskTrendsFetched: 'Task trends fetched successfully',
    projectWorkloadFetched: 'Project workload fetched successfully',
    timeDistributionFetched: 'Time distribution fetched successfully',
    recentActivityFetched: 'Recent activity fetched successfully',
  },
} as const;

// ─── Pagination ─────────────────────────────────────────────
export const PAGINATION_SETTINGS = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
} as const;

// ─── Dashboard ──────────────────────────────────────────────
export const DASHBOARD_SETTINGS = {
  defaultTaskTrendWeeks: 8,
  defaultActivityLimit: 20,
  completedTaskStatus: 'DONE',
} as const;

// ─── Validation Limits ──────────────────────────────────────
export const VALIDATION_SETTINGS = {
  name: { min: 2, max: 100 },
  email: { max: 255 },
  password: { min: 8, max: 128 },
  taskName: { max: 500 },
  description: { max: 500 },
  projectDescription: { max: 1000 },
  projectName: { min: 2, max: 200 },
  reportNotes: { max: 2000 },
  percentage: { min: 0, max: 100 },
  reviewCommentRequired: true,
} as const;

// ─── Seed Data ──────────────────────────────────────────────
export const SEED_SETTINGS = {
  defaultPassword: 'password123',
  manager: {
    name: 'Sarah Fernando',
    email: 'sarah@example.com',
  },
  members: [
    { name: 'Kasun Silva', email: 'kasun@example.com' },
    { name: 'Ayesha Perera', email: 'ayesha@example.com' },
    { name: 'Mohamed Rizwan', email: 'mohamed@example.com' },
    { name: 'Nimal Jayasinghe', email: 'nimal@example.com' },
  ],
  projects: [
    { name: 'Client Portal', description: 'Client-facing web portal' },
    { name: 'Internal ERP', description: 'Internal enterprise resource planning system' },
    { name: 'Mobile Application', description: 'Cross-platform mobile app' },
    { name: 'Research & Development', description: 'R&D projects and experiments' },
  ],
  weeksToSeed: 4,
  seedTasks: [
    {
      taskName: 'Feature development',
      priority: 'HIGH',
      plannedPercentage: 60,
      actualPercentage: 55,
      status: 'DONE',
      plannedMinutes: 480,
      actualMinutes: 440,
      deliverable: 'Implemented feature X',
    },
    {
      taskName: 'Code review',
      priority: 'MEDIUM',
      plannedPercentage: 20,
      actualPercentage: 25,
      status: 'DONE',
      plannedMinutes: 160,
      actualMinutes: 200,
    },
    {
      taskName: 'Bug fixes',
      priority: 'LOW',
      plannedPercentage: 20,
      actualPercentage: 20,
      status: 'IN_PROGRESS',
      plannedMinutes: 160,
      actualMinutes: 160,
    },
  ],
  seedNextWeekTasks: [
    { description: 'Continue feature development', sortOrder: 0 },
    { description: 'Write unit tests', sortOrder: 1 },
    { description: 'Update documentation', sortOrder: 2 },
  ],
  seedWorkHours: [
    { type: 'DEVELOPMENT', minutes: 480 },
    { type: 'TESTING', minutes: 120 },
    { type: 'MEETINGS', minutes: 60 },
    { type: 'DOCUMENTATION', minutes: 60 },
  ],
} as const;
