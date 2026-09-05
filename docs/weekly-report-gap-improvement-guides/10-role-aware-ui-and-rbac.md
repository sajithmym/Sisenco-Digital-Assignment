# Role-aware UI and RBAC

## Implemented behavior

Auth success routes members to member pages and manager/admin users to manager pages. Layout/navigation conditionally expose useful links, while API services request only authorized endpoints.

## Rules and boundaries

Frontend route logic is convenience only. JWT guards, role decorators, and ownership/workflow services provide the security boundary. Admin inherits manager review/dashboard/project capability but does not gain access to another member's private draft.

## Verification

Check direct URLs and raw API calls for all roles: member manager denial, manager admin-mutation denial, admin access, and private draft non-disclosure.

## Related guides

- [Authentication and RBAC](../05-authentication-and-rbac.md)
- [Security](../14-security.md)
- [Testing](../15-testing.md)
