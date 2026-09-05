# Assignment compliance audit

> Historical assessment before implementation fixes. See [assignment-fixes.md](assignment-fixes.md) for the current status. The audit commands now run the regression suites rather than asserting the former defects.

Reviewed: 5 September 2026.

Assignment: `C:/Users/sajith/Downloads/Technical SE Assignment.pdf`, all seven pages.

**Verdict: the application has a working backend review cycle and substantial implementation, but it does not yet fully satisfy the assignment or qualify as ready for submission.** The main blockers are fresh database setup, private drafts, missing version/content views, incomplete dashboard tracking, and inaccessible admin management in the supplied dataset.

This audit reviews the implementation in `backend/` and `frontend/`, the Prisma schema and seed, configuration, package scripts, README/setup instructions, and supporting guides. Guidance documents describe intended work; they are not evidence that a feature is implemented. Application source and existing data were preserved. Only this report and two reproducible audit scripts were added.

## Verification results

| Check | Result |
|---|---|
| Backend `npm run build` | Passed |
| Backend `npm run lint` | Passed |
| Backend `npm test -- --runInBand` | Passed: one suite, four refresh-token tests |
| Frontend `npm run build` | Passed, including TypeScript and route generation |
| Frontend `npm run lint` | Passed with 18 warnings, zero errors |
| Backend `npx prisma validate` | Passed; validates the schema definition, not fresh installation |
| Backend `npm run test:e2e` | Failed: `backend/test/jest-e2e.json` does not exist |
| Actual PostgreSQL service workflow | Passed: create, submit, request changes, edit, resubmit, approve |
| Actual PostgreSQL ownership/edit locks | Passed for another member's access and sequential edits of submitted/approved reports |
| Actual PostgreSQL snapshots | Two versions preserved and review records linked to the correct version |
| Audit cleanup | Temporary workflow records rolled back; absence of the temporary user verified afterward |
| Targeted defect probes | Confirmed draft exposure, deterministic refresh tokens, an unguarded edit write, invalid-input handling, and incorrect dashboard calculations |

Local database inspection found four team members, one manager, no admin, and 16 reports: four in each workflow status. Eight reports have `latestVersionNumber` values that disagree with the maximum stored version number.

Reproduce after building the backend:

```powershell
node docs/audit-probes.cjs
node docs/audit-workflow.cjs
```

The first script uses isolated service/validation probes and read-only queries against local PostgreSQL. The second runs real services inside a PostgreSQL transaction and deliberately rolls it back. These scripts supplement the audit; they do not replace an HTTP/browser end-to-end suite. They resolve the local database from `DB_*` settings and refuse a non-local host.

## Requirement coverage

| PDF requirement | Assessment | Evidence or remaining work |
|---|---|---|
| Registration, login/logout, password protection, secure sessions | Partial | bcrypt, JWT guards, HttpOnly refresh cookies, hashed stored tokens, in-memory browser access tokens, and refresh rotation exist. Token uniqueness needs correction. |
| Role assignment and backend authorization | Partial | Member/manager/admin guards and ownership checks exist. No initial admin is provisioned. Draft content is exposed to managers. |
| Fixed weekly-report structure | Mostly implemented | Shared create/edit form has all requested sections and task fields; no custom-field designer. Read-only pages omit required content. |
| Draft/edit/submit/correction/approval cycle | Working sequential backend flow | Verified with real PostgreSQL. Concurrent edit/submission handling needs correction. |
| Visible version history and comment/version association | Incomplete | Backend snapshots and associations work. Manager cannot open past versions; member sees labels only. |
| Team report filters | Mostly implemented | Member, project, dates, status, and pagination exist. No roster-based Not Started tracking. |
| Project/category CRUD | Implemented with soft deletion | Separate management page supports create/edit/archive/reactivate. Clearing fields and archived-project corrections need improvement. |
| Summary metrics and charts | Partial | Four chart types and review activity exist. Weekly scope, compliance, pending/late tracking, and some filtering are incomplete or incorrect. |
| At least seven listed page/view categories | Seven categories represented in code | Login/register, create/edit, history, detail, project management, user management, and manager review exist. Admin provisioning and incomplete detail/history behavior prevent a complete functional sign-off. |
| Responsive reusable frontend, client validation | Present by source inspection | Shared components, responsive classes, Zod/React Hook Form, loading/error/empty states. Browser and viewport QA not performed. |
| REST API, DTO validation, service/controller separation, report pagination | Present with defects | Clear Nest modules and pagination; null/empty report data validation has failures. |
| Users, roles, projects, reports, review history schema | Implemented | Twelve related Prisma models, enums, foreign keys, unique constraints, and report indexes. Migration delivery is broken. |
| Seed: 3-5 members, several weeks, mixed statuses | Present with integrity problems | Four members over four weeks, but incomplete snapshots and incorrect version counters. |
| Automated RBAC test | Bonus not supplied | Existing committed tests cover refresh tokens only. |
| AI assistant, deployment, project assignments, cross-team section comparison | Optional | Absence does not block core compliance. A public deployment is a bonus in the PDF. |
| Presentation, ER image, camera-on demo video, accessible submission links | Unverified | Repository contains preparation guides, not those finished deliverables or a shared Drive folder link. |

The team-member profile category is absent. The PDF requires seven of eight listed categories, so a separate profile page is not automatically required if the other seven are completed.

## Prioritized findings

### P1 - Fresh installation cannot apply the application schema

Evidence: [`.gitignore`](../.gitignore), line 37; [`db-init.ts`](../backend/scripts/db-init.ts), lines 85-87. No `backend/prisma/migrations/` directory exists, and Git explicitly ignores it. `db:init` runs `prisma migrate deploy` and then seeds; with no migrations, an empty database receives no application tables and seeding cannot succeed. Existing local tables conceal this failure.

Fix: commit a reviewed initial migration and its lock file, remove the migration ignore rule, and verify documented setup against an isolated empty database. Do not reset the existing database just to produce a migration. Align README/SETUP Node prerequisites with the packages' `>=20.9.0` requirement and README's Next.js version with the installed Next.js 16.3.4.

### P1 - Managers can read private draft content

Evidence: [`ReportsService.findById`](../backend/src/reports/reports.service.ts), lines 132-163, only checks ownership for TEAM_MEMBER. `findByFilters`, starting at line 221, includes drafts in manager results and exposes task names. Manager detail calls the same unrestricted read. The defect probe confirmed a manager receives another user's draft notes.

PDF page 2 says draft content is visible only to its author. Its separate request to track Draft status can be satisfied with status metadata, without exposing tasks, notes, blockers, or achievements.

Fix: enforce draft privacy in the backend detail/list queries and exclude private draft content from manager analytics. Provide a separate member/week status roster for Draft and Not Started tracking.

### P1 - Past report versions are not viewable in the UI

Evidence: [`manager report detail`](../frontend/src/app/%28manager%29/manager/reports/%5Bid%5D/page.tsx) never renders `report.versions` or `snapshotJson`. [`member report detail`](../frontend/src/app/%28member%29/reports/%5Bid%5D/page.tsx), lines 192-202, renders only version labels and dates. Neither review display identifies the version against which each comment was made.

Backend persistence passed the two-version workflow test, but the mandatory requirement is visible history. Database records alone do not satisfy it.

Fix: implement a typed, shared report-content renderer and a version selector/expandable history displaying the full snapshot, submission date and time, and reviews labeled with their version number. Show both historical and current content through the same renderer.

### P1 - Review/detail pages omit report content

Evidence: both detail pages render task priority, status, time and actual percentage, but omit `plannedPercentage`, `deliverable`, and the entire `nextWeekTasks` section. These values exist in the form, schema, and API response.

Impact: the manager cannot inspect the full report before approving it. Members cannot confirm all their saved values on the read-only detail page.

Fix: show a complete task table, next-week tasks, and the remaining fixed sections in a consistent order, with clear planned/actual labels and explicit empty states.

### P1 - No usable initial admin is supplied

Evidence: [`seed.ts`](../backend/prisma/seed.ts), lines 21-45, provisions a manager and members. Local read-only queries confirmed there is no ADMIN. [`users.controller.ts`](../backend/src/users/users.controller.ts) restricts user creation and role/status changes to ADMIN. Public registration always creates TEAM_MEMBER.

Impact: the documented demo accounts cannot exercise user administration or assign the first admin through the application. The manager sees a read-only team list.

Fix: add a documented, development-only admin seed/bootstrap path and an admin demo account. Preserve the backend admin-only guards. Do not permit arbitrary public admin signup.

### P1 - Dashboard does not meet weekly compliance/status requirements

Evidence: [`manager dashboard`](../frontend/src/app/%28manager%29/manager/dashboard/page.tsx), lines 53-59, requests metrics without a week/date range and offers no date selector. [`DashboardService`](../backend/src/dashboard/dashboard.service.ts), lines 11-44, counts all matching historical reports by default and calculates compliance as current SUBMITTED count divided by active members. Approved and correction reports cease to count as submissions. The frontend never displays `complianceRate`.

The isolated probe produced 200% compliance for eight submitted reports and four members. The team-report list starts from report rows, so people with no report do not appear. There is no late/pending deadline calculation or per-member submission roster. `openBlockers` ignores the date filter, and workload/time aggregates include drafts. Archiving a project removes its historical workload from the workload chart.

Fix: default to a defined current reporting week, add a week selector, and build a roster of expected member/week submissions. Define submitted, pending and late explicitly; retain submitted credit after review. Apply consistent visibility/date rules to counts and charts. Use appropriate denominators for multi-week ranges, and preserve archived-project historical data.

### P1 - Report edits can bypass the submitted lock during a race

Evidence: [`ReportsService.update`](../backend/src/reports/reports.service.ts), lines 166-198, reads and checks status, then writes using only `where: { id }`. A submission occurring after the read does not prevent the edit from changing submitted content. The audit deterministically simulated this interleaving and confirmed the write predicate lacks a status/version guard.

The normal sequential lock checks passed. This is a separate concurrency defect, not a failure of the entire workflow. It was verified through a controlled service probe, not a real simultaneous PostgreSQL stress test.

Fix: coordinate edits and submissions with a consistent transaction/locking or optimistic concurrency strategy. Reject stale edits and ensure the version snapshot corresponds exactly to the content locked for review. Add a meaningful interleaved edit/submit regression test.

### P1 - Refresh tokens are identical when issued within one second

Evidence: [`AuthService.generateTokens`](../backend/src/auth/auth.service.ts), lines 191-205, signs the same payload without a unique token identifier. A fixed-clock probe using the actual JWT library produced identical refresh tokens for two issuances.

Impact: two logins within a second can collide with the unique `tokenHash` constraint. A refresh within the same second can delete and recreate the same token, defeating the intended single-use rotation during that interval. The four existing tests mock token signing and therefore do not catch this.

Fix: assign a unique cryptographically generated `jti` to each refresh token. Test real signing and same-second issuance/rotation. Derive database/cookie expiration consistently from configured refresh-token lifetime rather than a separate hardcoded seven-day duration.

### P2 - Seeded version history contradicts its own counters

Evidence: [`seed.ts`](../backend/prisma/seed.ts), line 104, assigns approved reports version 2 and drafts version 1, but lines 138-152 create only version 1 for non-drafts and none for drafts. Snapshots contain task names and dates only, omitting much of the report. Local inspection confirmed eight version-counter mismatches.

Fix: seed at least one complete correction cycle through the workflow service or construct consistent full snapshots and reviews. Drafts should start at version 0, and latest version counters must match stored history. Use one explicit reporting timezone/date convention: the seed uses local midnight while date-only frontend inputs are parsed as UTC, which can shift displayed seed dates and bypass exact-instant week uniqueness.

### P2 - Invalid report data passes validation or causes server errors

Evidence: [`create-report.dto.ts`](../backend/src/reports/dto/create-report.dto.ts), line 22, accepts empty task names because it only checks string type and maximum length. A probe confirmed `taskName: ""` passes the real ValidationPipe. `UpdateReportDto` inherits optional arrays: `tasks: null` also passes validation, then `.map()` in the update service throws TypeError. Similar optional arrays need the same review.

Fix: validate trimmed nonempty content, reject null for array fields, enforce integer and practical upper bounds consistently, and distinguish absent fields from explicitly cleared fields. Normalize a documented weekly date range. Allow incomplete drafts deliberately, then apply the required submission-level checks, including project/category policy.

### P2 - Clearing project/form values silently fails

Evidence: [`weekly-report-form.tsx`](../frontend/src/features/reports/components/weekly-report-form.tsx), line 59, changes an empty project choice to `undefined`; the update service interprets this as unchanged. A user selecting No project on an existing report retains the previous association. The form includes the selected archived project, but sending its unchanged ID causes the update service to reject all corrections to that report. [`project management`](../frontend/src/app/%28manager%29/manager/projects/page.tsx) similarly converts an emptied description to `undefined`.

Fix: establish explicit null/empty clearing semantics across form, DTO, and service. Permit unchanged archived project associations on historical corrections, while preventing new assignment to archived projects.

### P2 - Personal report history stops after 50 entries

Evidence: [`report history`](../frontend/src/app/%28member%29/reports/history/page.tsx), line 25, always fetches page 1 with `historyLimit: 50`, without pagination controls. Older reports become inaccessible from the history page despite backend pagination support. Member dashboard status cards also count only the fetched recent page while Total Reports uses the global total.

Fix: add history pagination and obtain summary counts independently of the displayed page, or label recent-only counts explicitly.

### P2 - Repeatable RBAC/workflow regression coverage is missing

Evidence: only `backend/src/auth/auth.service.spec.ts` is present, with four refresh-token tests. `test:e2e` references a missing config. No committed automated suite covers role guards, private drafts, report ownership, version history, or the correction cycle. The audit scripts verified selected behavior, but do not establish browser/HTTP coverage.

Fix: add role/ownership rejection tests, transaction/version tests, input validation cases, and an HTTP workflow test using an isolated database. Repair the E2E command. RBAC testing is a strongly recommended bonus in the PDF, rather than a standalone mandatory deliverable.

## Submission and quality notes

- The schema and modular Nest architecture are sensible foundations. Shared form/UI components, backend guards, password hashing, error envelopes, and transaction-based review actions are already implemented.
- The frontend has seven of the eight requested page categories in source. Complete their behavior rather than adding extra screens solely to increase the count.
- The PDF requires Google Slides, an ER diagram image, and a demo video with the candidate's face visible, all in one accessible Google Drive folder. Preparation outlines in `docs/` do not satisfy those deliverables.
- Git has an origin pointing to `https://github.com/sajithmym/Sisenco-Digital-Assignment.git`. Remote accessibility and correspondence with this working tree were not verified. No supplied Drive link or completed presentation/video was available to verify.
- Deployment and AI are optional. Prioritize mandatory privacy, history, dashboard, setup, and submission artifacts before bonus features.
- Date-filter lookups currently load only the first 100 users/projects. At larger scale, add searchable/paginated selection. Shared report rendering will also remove substantial duplication between the member and manager detail screens.

## Completion order

1. Repair migration delivery and provide an admin bootstrap; verify a fresh local install.
2. Enforce private drafts, concurrency-safe edits, and unique refresh tokens.
3. Finish full report rendering, version browsing, and comment/version labels.
4. Implement selected-week status tracking and correct compliance/dashboard calculations.
5. Repair seed integrity, validation, field clearing, and history pagination.
6. Add repeatable RBAC/HTTP workflow tests; perform desktop/mobile browser QA of the complete correction cycle.
7. Prepare and verify the required presentation, ER image, camera-on video, GitHub link, and Drive sharing.

**Limits of this audit:** no production deployment, browser walkthrough, accessibility certification, load test, fresh database reset, dependency vulnerability scan, or remote sharing verification was performed. Builds and the real-database service test passed, but they do not establish full browser-to-API end-to-end compliance. No application fixes are included in this audit.
