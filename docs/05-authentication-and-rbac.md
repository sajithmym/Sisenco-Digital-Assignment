# Authentication and role-based access control

## Authentication flow

Registration creates a pending team-member account when enabled. Login verifies a bcrypt password, returns a short-lived access token in JSON, and sets a refresh token in an HttpOnly cookie. The frontend stores the access token only in module memory. Refresh rotates the token atomically; logout revokes it.

Each protected request resolves the current user from the database, so a role/status change takes effect immediately instead of waiting for old token claims to expire.

## Permission matrix

| Action | TEAM_MEMBER | MANAGER | ADMIN |
|---|---:|---:|---:|
| Own report create/edit/submit/history | Yes | No | No |
| Other members' non-draft reports | No | Yes | Yes |
| Other members' drafts | No | No | No |
| Review submitted reports | No | Yes | Yes |
| Dashboard, roster, project CRUD | No | Yes | Yes |
| User list/detail | No | Read-only | Yes |
| Create users/change role/status | No | No | Yes |

`JwtAuthGuard`, `RolesGuard`, and report-service ownership/state checks enforce these rules. Frontend visibility and redirects are not security controls. Refresh and logout also require `X-Requested-With: weekly-report-web`; see [14 Security](14-security.md).
