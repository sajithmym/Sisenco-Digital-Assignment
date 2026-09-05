# Assignment fixes and verification

Updated: 5 September 2026. This supersedes the implementation findings in [assignment-audit.md](assignment-audit.md), which records the original state against all seven pages of the assignment PDF.

The identified application defects have been addressed and the automated checks below pass. Final assignment submission still requires the external deliverables and visual checks listed at the end; this is not a claim of complete submission compliance.

## Changes implemented

| Area | Result |
|---|---|
| Reproducible database setup | Added the initial SQL migration and Prisma migration lock file. Removed the migrations ignore rule, refreshed that path in the Git index, and staged both migration files for inclusion in the next commit. |
| Missing local migration recovery | `db:init` regenerates the initial migration from the committed Prisma schema only when no migration directories exist, then asks for the regenerated files to be committed. It refuses to overwrite incomplete or existing migration directories. |
| Existing database recovery | Added schema-checked baselining for existing matching tables, with explicit local-only replacement of missing migration history and a metadata backup. No application tables were reset. |
| Draft privacy | Other members, managers, and admins cannot read another member's draft contents. Manager report lists and content aggregates exclude drafts; the submission roster exposes only status metadata. |
| Workflow concurrency | Editing, submission, correction requests, and approval acquire the same PostgreSQL report row lock and recheck state inside the transaction. Reviews require and reference the submitted version. |
| Complete report views | Member and manager detail pages show task priority/status, planned and actual percentages/minutes, deliverables, next-week plans, blockers, achievements, work-hour categories, and notes. |
| Visible history | Both detail pages can expand complete immutable submission snapshots, with timestamps and reviews associated with the appropriate version. Legacy partial snapshots are labeled explicitly. |
| Submission tracking | Added a paginated member/week roster covering Not Started, Draft, Submitted, Needs Correction, Approved, Pending, and Late. Draft content and draft report links remain private. |
| Dashboard calculations | Summary, charts, blockers, and activity respect the selected reporting period. Compliance uses expected member-weeks; submitted reports keep submission credit after correction requests or approval. Archived project workload remains visible. |
| Pagination and selection | Member history no longer stops at 50 reports; summary cards use server aggregates. Project/member selectors search paginated API results instead of silently stopping at the first 100 records. |
| Validation and editing | Rejects blank report items, null section arrays, invalid dates, and fractional minutes. Enforces section limits. Project associations can be cleared, corrections can retain their archived project, and project descriptions can be cleared. |
| Authentication | Refresh JWTs have unique random identifiers even when issued in the same second. Stored expiry and cookie lifetime follow configuration. Explicitly disabled self-registration is honored. |
| Demo data | Seed provisions an admin, manager, four members, multiple weeks, mixed workflow states, and full correction/resubmission examples through the workflow service. Repeated seeding is tested without duplicating data. |
| Frontend and configuration | Fixed stale request handling, lint warnings, UTC date display, weekly form defaults, and filter behavior. Database URL resolution is shared by the application and setup scripts. Setup instructions specify the tested Node 24 runtime. |

## Reporting policy

- Weeks run Monday through Sunday in UTC. Form input is date-only, with the end date derived from the selected week.
- A report is due before the following Monday at 00:00 UTC.
- Pending means no submission. Late includes overdue unsubmitted reports and reports first submitted after that deadline. Resubmission does not change the original submission deadline assessment.
- Compliance is submitted member-weeks divided by expected member-weeks for the current active team roster. Submitted, Needs Correction, and Approved all receive submission credit.
- Historical membership is not stored, so historical compliance uses the current active roster. This limitation is disclosed in the interface and setup documentation.

## Verification performed

| Check | Result |
|---|---|
| Backend `npm run build` | Passed |
| Backend `npm run lint` | Passed |
| Backend `npm test -- --runInBand` | Passed: 17 tests in four suites |
| Backend `npm run test:e2e` | Passed: eight HTTP/PostgreSQL integration tests |
| Frontend `npm run build` | Passed |
| Frontend `npm run lint` | Passed with no warnings |
| Fresh schema migration and repeated seed | Passed as part of E2E checks |
| Existing local database `npm run db:init` | Passed without resetting application data |
| `npx prisma migrate status` | Database up to date |
| Built backend runtime smoke check | Health, demo admin login, admin user listing, dashboard summary, roster, and logout succeeded |
| Git tracking | Initial migration and lock file are staged; `backend/.env` remains ignored |

The E2E runner creates a unique temporary schema in local PostgreSQL, applies the migration, and checks authorization, private drafts, roster calculations, validation, full review/version workflow, project clearing/archival, refresh-token replay/logout, concurrent edit-state rechecks, and seed integrity/idempotency. Its cleanup removes only that invocation's test schema. It requires the configured local PostgreSQL server to be running.

The root convenience commands `node docs/audit-probes.cjs` and `node docs/audit-workflow.cjs` now invoke the unit and integration regression suites respectively. Their behavior differs from the historical audit probes.

## Local database changes

The original database schema matched the new initial migration. Its unavailable old migration history was replaced by the verified baseline; the previous metadata is preserved locally at `tmp/migration-history-1788591627180.json` (ignored by Git). The legacy demo repair corrected reporting dates and version counters for 16 known seed reports while preserving their contents.

On a fresh idempotent seed, the database contains six users and 16 reports: four each in Submitted, Approved, Draft, and Needs Correction. There are no version-counter mismatches. Existing databases can retain additional historical examples without rewriting old submissions.

Demo admin: `admin@example.com`, password `password123`. These are local seed credentials. Existing user credentials were preserved, and `backend/.env` was not edited.

## Remaining verification and submission items

- Interactive browser and viewport QA could not run because the browser connector had no available browser. Frontend build/lint and backend HTTP checks do not establish visual or interactive browser correctness.
- Old partial seed snapshots cannot be reconstructed faithfully. They remain preserved and labeled; newly generated submissions and seed examples store complete snapshots.
- The required Google Slides presentation, ER diagram image, face-visible demonstration video, and shared Drive submission package have not been verified or delivered by this code-fix task. Existing planning guides are not substitutes for those deliverables.
- No public deployment, external sharing, Git commit, or push was performed.
