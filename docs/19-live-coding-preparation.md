# 19 — Live Coding Preparation

## Goal

Be able to explain and modify every important part of the project.

## You Must Understand

### Authentication

Explain:

- Login
- JWT creation
- Refresh tokens
- Password hashing
- Guards

### RBAC

Explain:

- How roles are stored.
- How manager routes are protected.
- How ownership checks work.

### Database

Explain:

- Why each major table exists.
- Why version history is stored separately.
- Why reviews reference a report version.

### Workflow

Be able to explain:

```text
DRAFT
SUBMITTED
NEEDS_CORRECTION
APPROVED
```

and all allowed transitions.

### Frontend

Explain:

- Folder structure
- API service layer
- Reusable components
- Form validation
- Role-aware pages

## Practice Live Changes

Practice adding:

1. New report status filter.
2. New task priority.
3. New dashboard KPI.
4. Optional review note.
5. Search by team member.
6. New project field.
7. Disable editing after approval.
8. New endpoint filter.

## Rule

Do not submit code you cannot explain.
