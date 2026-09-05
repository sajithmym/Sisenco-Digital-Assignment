# Administrator user management

## Implemented behavior

The user management page supports paginated user visibility, user creation, role updates, and active-status updates through typed API calls. UI controls are role-aware and surface safe response errors.

## Rules and boundaries

MANAGER can list/detail users but has no mutation permission. ADMIN alone creates users and changes role/status. Pending/inactive users cannot authenticate, and protected requests reload user state.

## Verification

Attempt manager role/status update and expect forbidden; perform the same action as admin and verify login/access changes immediately.

## Related guides

- [Authentication and RBAC](../05-authentication-and-rbac.md)
- [Security](../14-security.md)
- [Testing](../15-testing.md)
