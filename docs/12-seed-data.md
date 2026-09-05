# Seed data

`backend/prisma/seed.ts` creates repeatable development demonstrations after migration. It upserts intended users, projects, reports, snapshots, and reviews without deleting unrelated records. It is not a production deployment operation.

| Role | Account | Password |
|---|---|---|
| ADMIN | `admin@example.com` | `password123` |
| MANAGER | `sarah@example.com` | `password123` |
| TEAM_MEMBER | `kasun@example.com`, `ayesha@example.com`, `mohamed@example.com`, `nimal@example.com` | `password123` |

All six are active development accounts only. Fresh data contains four weeks for each member: 16 reports total, with four each of draft, submitted, needs-correction, and approved. Correction/resubmission examples have review comments and complete version history.

Run `npm run db:init` for an empty local database, or `npm run seed` after migrations. The E2E runner seeds an isolated schema and asserts the seed can run idempotently.
