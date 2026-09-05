# Review and version workflow

## State machine

```text
DRAFT --submit--> SUBMITTED --approve--> APPROVED
                         \
                          --request changes--> NEEDS_CORRECTION --resubmit--> SUBMITTED
```

Only the author changes `DRAFT` or `NEEDS_CORRECTION` content. Each submission creates an immutable full-content `report_versions` snapshot. Managers/admins can act only while the report is submitted; a correction request requires a non-empty comment.

A `reviews` record captures reviewer, decision, comment, and the version examined. Resubmission creates a later snapshot instead of overwriting earlier evidence. Transactional state checks/locks prevent an edit or review from succeeding against a report that has already changed state.

Members can see their own comments/history. Managers see non-drafts and can review submitted reports. Private drafts remain unavailable even to manager/admin users. The E2E suite verifies correction, resubmission, approval, version history, and concurrent transition protection.
