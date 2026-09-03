# 05 — Authentication and RBAC

## Goal

Secure authentication and backend-enforced authorization.

## Authentication Flow

```text
Login
 ↓
Validate email + password
 ↓
Create access token
Create refresh token
 ↓
Return session
```

## Password Storage

Never store plain-text passwords.

Use bcrypt with a configured cost constant.

Example constant file:

```text
auth.constants.ts
```

Contains:

```text
PASSWORD_HASH_ROUNDS
ACCESS_TOKEN_EXPIRY
REFRESH_TOKEN_EXPIRY
```

## JWT Strategy

Use:

- Short-lived access token.
- Longer-lived refresh token.
- Refresh-token rotation where possible.

Prefer secure HttpOnly cookies for browser authentication.

## Guards

Recommended:

```text
JwtAuthGuard
RolesGuard
```

Use a role decorator:

```text
@Roles(UserRole.MANAGER, UserRole.ADMIN)
```

## Ownership Rule

Role checks alone are not enough.

For a Team Member accessing:

```text
GET /reports/:id
```

Backend must verify:

```text
report.userId === currentUser.id
```

Managers can access wider data according to policy.

## Authorization Policy

### Team Member

Allowed:

- Own reports
- Own report versions
- Own review comments
- Public/assigned project list

### Manager

Allowed:

- Team report read
- Team report review
- Manager dashboard
- Team member profiles

### Admin

Allowed:

- User management
- Role assignment
- Project management
- Manager capabilities

## Never Trust

- Hidden buttons
- URL hiding
- Frontend route checks
- Client-sent `userId`
- Client-sent `role`

Derive user identity from authenticated backend context.
