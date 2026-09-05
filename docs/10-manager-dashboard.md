# Manager dashboard

Dashboard, roster, and team-report data requires `MANAGER` or `ADMIN`. Team members cannot call these endpoints. Backend queries exclude private drafts, so chart/report hiding in the interface is not relied upon as access control.

| View | Endpoint | Purpose |
|---|---|---|
| Submission roster | `GET /manager/dashboard/roster` | Member-week reporting state and timing. |
| Summary | `GET /manager/dashboard/summary` | Aggregate report/task/hour totals. |
| Status distribution | `GET /manager/dashboard/status-distribution` | Status breakdown. |
| Task trends | `GET /manager/dashboard/task-trends` | Completed/planned work trend. |
| Project workload | `GET /manager/dashboard/project-workload` | Work grouped by project. |
| Time distribution | `GET /manager/dashboard/time-distribution` | Work-hour analysis. |
| Activity | `GET /manager/dashboard/activity` | Recent non-draft activity. |

Reporting uses Monday-Sunday UTC. A member-week becomes compliant after a submission; correction/approval does not remove credit. `PENDING` means no submission for the week. `LATE` covers overdue missing reports and first submissions after Sunday 23:59:59 UTC. Every filter is DTO-validated, and E2E tests check analytics filtering/no draft leakage.
