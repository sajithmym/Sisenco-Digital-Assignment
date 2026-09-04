# 05 — Manager Review Page

## When status is SUBMITTED
Show:
```text
Approve Report
Request Changes
```

## Manager must see
- Week/date range
- Project
- Completed tasks
- Next-week tasks
- Blockers
- Achievements
- Work hours
- Notes
- Current version
- Previous versions
- Review history

## Approve
Recommended endpoint:
```text
POST /api/v1/manager/reports/:id/approve
```

Actions:
- Create review record.
- Set status to `APPROVED`.
- Save `approvedAt`.

## Request Changes
Use a modal/dialog with required comment.

## Critical permission
Manager must NOT edit Team Member report content.
Manager may update only review/status data.

## Done
- [ ] Approve
- [ ] Request Changes
- [ ] Comment required
- [ ] Manager cannot edit member content
- [ ] Review persisted
