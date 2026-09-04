# 10 — Manager Dashboard

## Goal

Provide useful team-level analysis.

## KPI Cards

Include:

1. Reports submitted this week
2. Submission compliance rate
3. Needs Correction count
4. Open blockers count

## Charts

Recommended:

### Submission Status

Bar or stacked chart by team member.

Statuses:

```text
NOT_STARTED
DRAFT
SUBMITTED
NEEDS_CORRECTION
APPROVED
```

### Task Completion Trend

Line chart showing completed tasks across weeks.

### Project Workload

Bar or pie chart showing task/time distribution by project.

### Time Distribution

Development vs Testing vs Meetings vs Documentation.

### Recent Activity

Show:

- Submitted
- Requested correction
- Resubmitted
- Approved

## Filter Controls

Recommended:

```text
week
team member
project
status
date range
```

## Backend Aggregation

Do not download every report and calculate all dashboard metrics in the browser.

Aggregate important metrics on the backend.

## Performance

Add indexes for dashboard filter columns.

Avoid N+1 queries.
