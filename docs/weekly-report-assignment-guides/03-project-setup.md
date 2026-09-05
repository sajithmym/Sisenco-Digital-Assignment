# Project setup

## Purpose

This implementation guide describes the current feature, the code boundary that owns it, and the expected behavior. It is a focused companion to [03-project-setup.md](../03-project-setup.md).

## Current implementation

Local startup uses Docker Compose for PostgreSQL, `backend/.env`, `npm run db:init`, NestJS development server, and `frontend/.env.local` with Next.js development server.

## Verify

Use Node 24+, run the commands in SETUP, and verify the seed creates six local demo accounts and 16 reports.

## Related documentation

- [Project reference](../PROJECT_REFERENCE.md)
- [03-project-setup.md](../03-project-setup.md)
