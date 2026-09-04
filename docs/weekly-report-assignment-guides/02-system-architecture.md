# 02 — System Architecture

## High-Level Architecture

```text
Browser
  ↓
Next.js Frontend
  ↓ REST API
NestJS Backend
  ↓
Prisma ORM
  ↓
PostgreSQL
```

## Responsibilities

### Next.js

Responsible for:

- Routing
- UI rendering
- Forms
- Client-side validation
- Role-aware navigation
- API consumption
- Loading / error / empty states
- Dashboard visualization

Must not contain:

- Database queries
- Authorization rules that are only enforced on the client
- Core report state transition rules

### NestJS

Responsible for:

- Authentication
- Authorization
- Business rules
- Validation
- Report workflow
- Version creation
- Review actions
- Filtering
- Pagination
- Dashboard aggregation
- Error handling

### PostgreSQL

Responsible for persistent storage of:

- Users
- Roles
- Projects
- Reports
- Tasks
- Blockers
- Achievements
- Work-hour entries
- Reviews
- Report versions
- Audit information

## Backend Module Boundaries

Recommended NestJS modules:

```text
auth
users
projects
reports
reviews
dashboard
common
database
```

Do not create one large `app.service.ts`.

## Shared Backend Concerns

Place shared code under:

```text
src/common/
  decorators/
  guards/
  interceptors/
  filters/
  constants/
  enums/
  utils/
```

## Frontend Boundaries

```text
src/
  app/
  components/
  features/
  hooks/
  lib/
  services/
  constants/
  types/
  schemas/
```

Use feature-based organization for business UI.

## Architecture Principles

- Controllers handle HTTP concerns.
- Services contain business logic.
- Repositories/Prisma access database.
- DTOs validate request shape.
- Guards enforce access control.
- UI components render state.
- Hooks coordinate client behavior.
- API services handle network calls.
- Constants store reusable fixed values.
