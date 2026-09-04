# 03 — Correction and Resubmit Workflow

## Required flow
```text
DRAFT
 ↓
SUBMITTED
 ↓
Manager Review
 ↓
NEEDS_CORRECTION
 ↓
Member edits same report
 ↓
RESUBMIT
 ↓
SUBMITTED
 ↓
APPROVED
```

## Request Changes
Manager sends:
```json
{
  "comment": "Please update the task completion values."
}
```

Recommended endpoint:
```text
POST /api/v1/manager/reports/:id/request-changes
```

Rules:
- Allowed only when current status is `SUBMITTED`.
- General comment is required.
- Store review record.
- Change report status to `NEEDS_CORRECTION`.

## Member UI
Show manager feedback clearly:
```text
Needs Correction

Manager Feedback
Please update the task completion values.

Requested by Sarah Fernando
Sep 4, 2026
```

Then:
```text
Edit Report
Save Changes
Resubmit
```

## Resubmit
Must:
1. Validate report.
2. Create new version.
3. Increment version number.
4. Set status back to `SUBMITTED`.
5. Save submission timestamp.

## Done
- [ ] Manager comment required
- [ ] Member sees comment
- [ ] Member can edit
- [ ] Member can resubmit
- [ ] New version created
