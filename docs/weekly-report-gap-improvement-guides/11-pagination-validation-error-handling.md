# Pagination, validation, and error handling

## Implemented behavior

Shared pagination requests adjacent pages and disables boundary controls. Frontend forms use Zod; backend list/filter DTOs enforce safe pages, limits, enums, UUIDs, and dates. Shared error state and helper render failures consistently.

## Rules and boundaries

Do not trust UI constraints: unknown request properties are forbidden, invalid filters fail validation, and error messages are safely narrowed from unknown response values. API envelopes remain consistent.

## Verification

Run pagination, entity picker, schema, API client, resource-state, and error-helper tests. Test invalid page/date/UUID directly against the API.

## Related guides

- [Authentication and RBAC](../05-authentication-and-rbac.md)
- [Security](../14-security.md)
- [Testing](../15-testing.md)
