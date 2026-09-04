# 10 — Role-Aware UI and RBAC

## Navigation
### Team Member
```text
Dashboard
New Report
Report History
```

### Manager
```text
Dashboard
Team Reports
Team Members
Projects
```

### Admin
```text
Dashboard
Team Reports
Users
Projects
```

## Frontend
- Hide unauthorized controls.
- Redirect unauthorized routes.
- Use role-aware navigation.

## Backend
Still enforce:
```text
JwtAuthGuard
RolesGuard
Ownership checks
```

## Ownership rules
Team Member:
- Read/edit only own report where status permits.

Manager:
- Read team reports.
- Review submitted reports.
- Must not rewrite report content.

Admin:
- User management.

## Never trust
- Client-sent role
- Client-sent owner ID
- Hidden button state

## Done
- [ ] Sidebar changes by role
- [ ] Unauthorized buttons hidden
- [ ] Unauthorized route redirect
- [ ] Backend still returns 403 on direct attack
- [ ] Ownership protected
