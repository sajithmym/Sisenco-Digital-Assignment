# 08 — Backend API Design

## Base Path

Recommended:

```text
/api/v1
```

## Authentication

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

## Reports

```text
POST   /api/v1/reports
GET    /api/v1/reports/my
GET    /api/v1/reports/:id
PATCH  /api/v1/reports/:id
POST   /api/v1/reports/:id/submit
GET    /api/v1/reports/:id/versions
```

## Manager Reports

```text
GET  /api/v1/manager/reports
GET  /api/v1/manager/reports/:id
POST /api/v1/manager/reports/:id/request-changes
POST /api/v1/manager/reports/:id/approve
```

## Projects

```text
GET    /api/v1/projects
POST   /api/v1/projects
PATCH  /api/v1/projects/:id
DELETE /api/v1/projects/:id
```

## Users

```text
GET   /api/v1/users
GET   /api/v1/users/:id
PATCH /api/v1/users/:id/role
PATCH /api/v1/users/:id/status
```

## Dashboard

```text
GET /api/v1/manager/dashboard/summary
GET /api/v1/manager/dashboard/task-trends
GET /api/v1/manager/dashboard/status-distribution
GET /api/v1/manager/dashboard/project-workload
GET /api/v1/manager/dashboard/time-distribution
GET /api/v1/manager/dashboard/activity
```

## Pagination

List endpoints must support:

```text
page
limit
```

Return:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Filtering

Manager report filters:

```text
userId
projectId
status
weekStart
weekEnd
```

## DTO Rule

Never accept arbitrary request bodies.

Create explicit DTOs:

```text
CreateReportDto
UpdateReportDto
ReviewReportDto
ReportFilterDto
CreateProjectDto
UpdateProjectDto
```

## Response Consistency

Use a consistent response shape and a centralized exception strategy.
