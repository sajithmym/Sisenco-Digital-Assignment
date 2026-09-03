# 06 — Weekly Report Domain

## Report Structure

Every user must use the same report structure.

Recommended sections:

1. Week / date range
2. Project/category
3. Completed tasks
4. Next week tasks
5. Blockers
6. Achievements
7. Work-hour breakdown
8. Notes / links

## Create Report

Initial state:

```text
DRAFT
```

Only the owner can edit.

## Editable States

Team Member may edit when:

```text
DRAFT
NEEDS_CORRECTION
```

Team Member must not edit when:

```text
SUBMITTED
APPROVED
```

## Validation Rules

Examples:

- Week start required.
- Week end required.
- Week end must be after or equal to week start.
- Task name required.
- Percentages between 0 and 100.
- Time values must be zero or positive.
- Only one key blocker per report.
- Only one key achievement per report.
- Notes length should have a defined maximum.
- URLs should be validated when entered.

## Business Logic Placement

Do not write state-transition logic inside controllers.

Use:

```text
ReportsService
ReportWorkflowService
```

Example responsibilities:

### ReportsService

- Create
- Read
- Update editable report data
- List reports

### ReportWorkflowService

- Submit
- Request correction
- Resubmit
- Approve
- Create immutable version
