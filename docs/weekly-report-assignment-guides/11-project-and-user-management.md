# 11 — Project and User Management

## Project Management

Required operations:

```text
Create
Read
Update
Delete / Archive
```

Prefer soft deactivation over deleting projects already referenced by reports.

Use:

```text
isActive
```

## Project Fields

```text
name
description
isActive
```

## User Management

Recommended:

- List users.
- View basic profile.
- Change role.
- Activate/deactivate account.
- View user's report history.

## Role Assignment

Only Admin should change roles.

Do not allow users to promote themselves.

## Deleting Users

Prefer:

```text
isActive = false
```

instead of physical deletion when reports exist.

## Project Assignment

Optional enhancement:

```text
user_projects
```

Use if you implement assigning Team Members to relevant projects.
