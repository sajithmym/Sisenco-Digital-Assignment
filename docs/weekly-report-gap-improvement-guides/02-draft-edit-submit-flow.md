# Draft, edit, and submit flow

## Implemented behavior

A member can create a private DRAFT, revisit it, change its content, and submit it when ready. Own report list/detail/history routes provide the required data; submit invokes the dedicated workflow endpoint.

## Rules and boundaries

Only the report author edits a DRAFT. The report must be unique for the member/week, and submission requires at least one completed task. Submission makes content visible to management but does not allow further draft edits.

## Verification

Use a member account to save/edit a draft, ensure another member cannot access it, then submit it and confirm it becomes visible in manager reports.

## Related guides

- [Weekly report domain](../06-weekly-report-domain.md)
- [Review workflow](../07-review-and-version-workflow.md)
- [Frontend architecture](../09-frontend-architecture.md)
