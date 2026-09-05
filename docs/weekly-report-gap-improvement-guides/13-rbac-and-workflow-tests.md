# RBAC and workflow tests

## Implemented behavior

Backend unit tests cover role/JWT guards, auth/token uniqueness, report validation/workflow, dashboards, users, projects, errors, and health. E2E covers authorization, CSRF header behavior, private drafts, correction/resubmission, analytics filtering, token replay/logout, concurrency, and seed idempotency.

## Rules and boundaries

The E2E runner uses a random migrated schema to protect development data. Tests assert server behavior; frontend tests validate key UI/components/services but do not provide browser E2E coverage.

## Verification

Run npm test -- --runInBand and npm run test:e2e from backend, then npm test and npm run test:coverage from frontend. Current totals are 75, 14, and 64 respectively.

## Related guides

- [Authentication and RBAC](../05-authentication-and-rbac.md)
- [Security](../14-security.md)
- [Testing](../15-testing.md)
