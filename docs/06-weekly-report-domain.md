# Weekly report domain

A report belongs to one team member and one Monday-to-Sunday UTC reporting week. It may use an active project and includes task entries, next-week tasks, blockers, achievements, work-hour rows, and notes. Dynamic collections may be empty while drafting, but malformed/null arrays and blank item values are rejected.

## State rules

| State | Meaning | Allowed action |
|---|---|---|
| `DRAFT` | Private work in progress. | Author edits or submits. |
| `SUBMITTED` | Awaiting decision. | Manager/admin approves or requests changes. |
| `NEEDS_CORRECTION` | Changes requested. | Author edits and resubmits. |
| `APPROVED` | Accepted. | Read-only. |

The database permits one report per user/week. Backend UTC week rules are separate from the frontend display timezone (`NEXT_PUBLIC_APP_TIMEZONE`, default `Asia/Colombo`). Submission needs at least one named task; its status does not need to be `DONE`. Dashboard/roster output may represent draft status metadata, but never leaks draft content or private report IDs.

Read [07 Review and version workflow](07-review-and-version-workflow.md) for transitions and audit history.
