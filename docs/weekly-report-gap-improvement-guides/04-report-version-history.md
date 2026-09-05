# Report version history

## Implemented behavior

Every submission stores a full immutable snapshot in `report_versions`: report content, project context, tasks, planned work, blockers, achievements, hours, and notes. Reviews reference the exact snapshot considered.

## Rules and boundaries

A later edit/resubmission creates a new version rather than overwriting a prior submission. Members view only their own history; manager visibility continues to exclude private draft content and report IDs; dashboard status/count metadata is separate.

## Verification

Use correction/resubmission seed data or create the flow manually. Compare versions and verify review metadata stays linked to its acted-on version.

## Related guides

- [Weekly report domain](../06-weekly-report-domain.md)
- [Review workflow](../07-review-and-version-workflow.md)
- [Frontend architecture](../09-frontend-architecture.md)
