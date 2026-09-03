// ─── Frontend Settings ──────────────────────────────────────
// All configuration values are centralized here.
// Environment variables take priority; these are fallback defaults.

// ─── API ────────────────────────────────────────────────────
export const API_SETTINGS = {
  baseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1',
} as const;

// ─── Pagination ─────────────────────────────────────────────
export const PAGINATION_SETTINGS = {
  defaultPage: 1,
  defaultLimit: 20,
  dashboardLimit: 10,
  historyLimit: 50,
  managerListLimit: 50,
  pageSizeOptions: [10, 20, 50, 100] as const,
} as const;

// ─── Auth ───────────────────────────────────────────────────
export const AUTH_SETTINGS = {
  accessTokenKey: 'accessToken',
  refreshTokenKey: 'refreshToken',
} as const;

// ─── Validation ─────────────────────────────────────────────
export const VALIDATION_SETTINGS = {
  name: { min: 2, max: 100 },
  password: { min: 8, max: 128 },
  taskName: { max: 500 },
  description: { max: 500 },
  reportNotes: { max: 2000 },
  percentage: { min: 0, max: 100 },
  minutes: { min: 0 },
} as const;
