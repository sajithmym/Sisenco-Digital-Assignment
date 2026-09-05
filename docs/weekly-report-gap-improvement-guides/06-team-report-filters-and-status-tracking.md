# Team report filters and status tracking

## Implemented behavior

Manager report lists and the submission roster use DTO-validated query filters, pagination, date ranges, report status, and user/project-related criteria. The UI surfaces status badges and loading/empty/error states.

## Rules and boundaries

Team data contains non-draft reports only. Roster compliance is based on whether a member-week was submitted; PENDING and LATE use the documented UTC deadline rules.

## Verification

Try invalid filter values and confirm a validation response. Filter a manager list by date/status and verify a member draft never appears.

## Related guides

- [Weekly report domain](../06-weekly-report-domain.md)
- [Review workflow](../07-review-and-version-workflow.md)
- [Frontend architecture](../09-frontend-architecture.md)
