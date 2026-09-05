# Manager dashboard analytics

## Implemented behavior

Dashboard API exposes roster, summary, status distribution, task trends, project workload, time distribution, and activity. Frontend charts/cards render the server-prepared data and support validated period filters.

## Rules and boundaries

Analytics are limited to MANAGER/ADMIN and exclude drafts. Weekly calculations use Monday-Sunday UTC. Query filters must not allow arbitrary/unbounded input.

## Verification

Run the dashboard E2E assertions, then compare dashboard numbers against seeded non-draft reports for a selected week range.

## Related guides

- [Weekly report domain](../06-weekly-report-domain.md)
- [Review workflow](../07-review-and-version-workflow.md)
- [Frontend architecture](../09-frontend-architecture.md)
