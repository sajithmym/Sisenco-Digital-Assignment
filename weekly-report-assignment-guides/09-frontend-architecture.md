# 09 — Frontend Architecture

## App Router Structure

Example:

```text
src/app/
├── (auth)/
│   ├── login/
│   └── register/
├── (member)/
│   ├── dashboard/
│   └── reports/
│       ├── new/
│       ├── [id]/
│       └── history/
└── (manager)/
    ├── manager/
    │   ├── dashboard/
    │   ├── reports/
    │   ├── users/
    │   └── projects/
```

## Feature Structure

```text
src/features/reports/
├── components/
├── hooks/
├── schemas/
├── services/
├── types/
└── utils/
```

## Reusable UI Components

Recommended:

```text
PageHeader
StatusBadge
DataTable
EmptyState
ErrorState
LoadingState
ConfirmDialog
FormField
DateRangeField
Pagination
FilterBar
MetricCard
ChartCard
ActivityFeed
```

## Business Components

```text
WeeklyReportForm
TaskTable
BlockerList
AchievementList
WorkHoursForm
ReportSummary
ReportVersionTimeline
ReviewPanel
```

## Hard-Coded Values

Store:

```text
report statuses
role labels
priority options
task status options
work-hour types
route paths
pagination defaults
```

under:

```text
src/constants/
```

## API Layer

Do not call Axios directly from every component.

Use:

```text
src/services/api-client.ts
src/features/reports/services/reports.api.ts
```

## Form Validation

Use shared Zod schemas.

UI validation improves UX.

Backend validation remains authoritative.

## UX Requirements

Every screen should include proper:

- Loading state
- Empty state
- Error state
- Disabled state
- Success feedback
- Responsive behavior
- Keyboard accessibility
- Visible focus states
