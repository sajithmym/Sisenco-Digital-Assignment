# 09 — User and Admin Management

## Recommended roles
```text
TEAM_MEMBER
MANAGER
ADMIN
```

## Important current issue
Do not show a Manager an admin-only `Deactivate` button that always produces 403.

Backend 403 is correct security.
Frontend must hide actions the current role cannot use.

## Admin features
- Invite/create Team Member
- Change role
- Activate
- Deactivate
- View profile

## Manager features
- View Team Member profile
- View report history/basic stats
- No admin-only role/deactivation controls

## Team Member Profile
Recommended route:
```text
/manager/users/:id
```

Show:
- Name
- Email
- Role
- Status
- Total Reports
- Approved count
- Needs Correction count
- Compliance rate
- Report history

## Done
- [ ] Admin-only mutation controls
- [ ] Invite/create user
- [ ] Role assignment
- [ ] Activate/deactivate
- [ ] Manager profile view
