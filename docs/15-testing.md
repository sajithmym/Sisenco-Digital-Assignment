# 15 — Testing

## Minimum Priority

The assignment strongly benefits from at least one RBAC test.

Implement more if time allows.

## Unit Tests

Recommended:

```text
ReportWorkflowService
ReportsService
AuthService
RolesGuard
```

## Critical State Tests

Test:

```text
DRAFT → SUBMITTED
SUBMITTED → NEEDS_CORRECTION
NEEDS_CORRECTION → SUBMITTED
SUBMITTED → APPROVED
```

Also reject invalid transitions.

Examples:

```text
APPROVED → DRAFT
DRAFT → APPROVED
TEAM_MEMBER approving a report
TEAM_MEMBER opening another member's private report
```

## E2E Tests

Use:

```text
Jest
Supertest
```

Important cases:

1. Login succeeds.
2. Team Member creates report.
3. Team Member submits.
4. Manager requests changes.
5. Team Member edits and resubmits.
6. Manager approves.
7. Unauthorized user receives 403.

## Frontend Tests

If time permits:

- Form validation
- Status rendering
- Role-aware navigation
- Review controls
