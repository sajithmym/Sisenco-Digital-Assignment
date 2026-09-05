# Complete weekly report form

## Implemented behavior

The member form uses React Hook Form and Zod to collect reporting week, optional project, task entries, next-week tasks, blockers, achievements, work-hour rows, and notes. Dynamic collections can be added/removed, and project selection is normalized before API submission.

## Rules and boundaries

The backend determines the Monday UTC week and uniqueness; the browser timezone is only for display/selection. A report may draft with empty collections, but submission needs at least one named task; it does not require a `DONE` status. Only active projects are selectable.

## Verification

Run the weekly-form component tests, create a draft, and submit a report with task/hour data. Verify malformed/null arrays and blank task items receive validation errors.

## Related guides

- [Weekly report domain](../06-weekly-report-domain.md)
- [Review workflow](../07-review-and-version-workflow.md)
- [Frontend architecture](../09-frontend-architecture.md)
