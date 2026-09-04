# 02 — Draft, Edit and Submit Flow

## Statuses
```text
DRAFT
SUBMITTED
NEEDS_CORRECTION
APPROVED
```

## Allowed Team Member actions
| Status | View | Edit | Save | Submit |
|---|---|---|---|---|
| DRAFT | Yes | Yes | Yes | Yes |
| SUBMITTED | Yes | No | No | No |
| NEEDS_CORRECTION | Yes | Yes | Yes | Resubmit |
| APPROVED | Yes | No | No | No |

## Create
A new report must start as:
```text
DRAFT
```

Buttons:
```text
Save Draft
Submit Report
Cancel
```

## Backend
Create `ReportWorkflowService` for state transitions:
```text
submitReport()
resubmitReport()
approveReport()
requestChanges()
```

Do not keep transition logic in controllers.

## Important
Every Submit/Resubmit should create an immutable version snapshot.

## Done
- [ ] Draft creation
- [ ] Draft editing
- [ ] Submit
- [ ] Submitted becomes read-only
- [ ] Needs Correction becomes editable
- [ ] Approved becomes read-only
- [ ] Backend rejects invalid transitions
