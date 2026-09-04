# 12 — Seed Data

## Goal

Make the dashboard meaningful immediately.

## Recommended Users

Create at least:

```text
1 Manager
4 Team Members
```

Example:

```text
Manager:
- Sarah Fernando

Team Members:
- Kasun Silva
- Ayesha Perera
- Mohamed Rizwan
- Nimal Jayasinghe
```

## Recommended Projects

```text
Client Portal
Internal ERP
Mobile Application
Research & Development
```

## Reports

Seed several weeks.

Use mixed statuses:

```text
DRAFT
SUBMITTED
NEEDS_CORRECTION
APPROVED
```

## Reviews

Include examples where:

- A manager requested correction.
- A member resubmitted.
- A manager approved the new version.

## Version History

At least one seeded report should have:

```text
Version 1
Changes Requested
Version 2
Approved
```

## Test Accounts

Document development credentials in README only for demo seed users.

Never use real personal passwords.

## Prisma Seed

Recommended command:

```bash
npx prisma db seed
```

Keep seed logic idempotent where practical.
