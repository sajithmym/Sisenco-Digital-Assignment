# Correction and resubmission workflow

## Implemented behavior

A manager/admin can request changes on a submitted report with a review comment. The report enters NEEDS_CORRECTION, the owner updates it, and a new submission returns it to SUBMITTED for a new decision.

## Rules and boundaries

Requesting changes requires a non-empty comment and only applies to SUBMITTED reports. The author alone can edit NEEDS_CORRECTION. Management cannot alter report content for the member.

## Verification

Exercise submit → request changes → member edit → resubmit. Confirm the comment is shown to the owner and a manager cannot request changes twice without another submission.

## Related guides

- [Weekly report domain](../06-weekly-report-domain.md)
- [Review workflow](../07-review-and-version-workflow.md)
- [Frontend architecture](../09-frontend-architecture.md)
