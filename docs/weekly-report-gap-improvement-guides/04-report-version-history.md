# 04 — Report Version History

## Goal
Never lose a previously submitted report after a correction.

## Recommended model
### `reports`
```text
id
userId
weekStart
weekEnd
status
latestVersionNumber
submittedAt
approvedAt
createdAt
updatedAt
```

### `report_versions`
```text
id
reportId
versionNumber
snapshotJson
submittedAt
createdBy
```

### `reviews`
```text
id
reportId
reportVersionId
reviewerId
action
comment
createdAt
```

## Snapshot
Create an immutable JSON snapshot on every Submit/Resubmit containing:
- week
- project
- completed tasks
- next-week tasks
- blockers
- achievements
- work hours
- notes

## UI
```text
Current Version
Version 3

Previous Versions
Version 2 — Submitted Sep 3 [View]
Version 1 — Submitted Aug 28 [View]
```

Each review must point to the version it reviewed.

## Done
- [ ] Every submission creates version
- [ ] Old content remains unchanged
- [ ] Manager can open previous versions
- [ ] Review linked to correct version
