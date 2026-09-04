# 13 — RBAC and Workflow Tests

## Recommended tools
```text
Jest
Supertest
```

## RBAC tests
1. Team Member opens another member report → `403`
2. Team Member opens manager endpoint → `403`
3. Manager opens team report → `200`
4. Manager tries to update member report content → reject
5. Manager tries admin-only deactivation → `403`
6. Admin deactivates user → success

## Workflow tests
- `DRAFT → SUBMITTED`
- `SUBMITTED → NEEDS_CORRECTION`
- `NEEDS_CORRECTION → SUBMITTED`
- `SUBMITTED → APPROVED`

Verify:
- version creation
- review creation
- status update
- comment linkage

## Invalid transitions
Reject:
```text
DRAFT → APPROVED
APPROVED → DRAFT
SUBMITTED → edit content
TEAM_MEMBER → approve
```

## Done
- [ ] RBAC automated test
- [ ] Workflow tests
- [ ] Invalid transition tests
- [ ] All tests pass
