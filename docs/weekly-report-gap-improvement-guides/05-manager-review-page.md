# Manager review page

## Implemented behavior

The manager report detail screen loads a non-draft report and offers approve/request-changes actions appropriate to its state. It renders report content and review/version evidence through shared report components.

## Rules and boundaries

Only MANAGER/ADMIN may review and only when status is SUBMITTED. Approval needs no comment; request changes requires one. API state checks reject manipulated or stale browser requests.

## Verification

Sign in as manager, open a submitted report, request changes with a comment, then approve its later resubmission. Confirm draft IDs are not readable.

## Related guides

- [Weekly report domain](../06-weekly-report-domain.md)
- [Review workflow](../07-review-and-version-workflow.md)
- [Frontend architecture](../09-frontend-architecture.md)
