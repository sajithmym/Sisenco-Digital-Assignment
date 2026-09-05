# Weekly Report Generator & Team Dashboard

A production-style internal web application where team members create and submit weekly reports, managers review and approve them, and everyone benefits from a consolidated team dashboard.

## Features

- **Authentication** — Register, login, logout with JWT (access + refresh tokens)
- **RBAC** — Team Member, Manager, and Admin roles with backend-enforced authorization
- **Weekly Reports** — Create, edit, submit reports with structured sections (tasks, blockers, achievements, work hours)
- **Review Workflow** — DRAFT → SUBMITTED → NEEDS_CORRECTION → APPROVED with immutable version history
- **Manager Dashboard** — KPIs, charts (status distribution, task trends, project workload, time distribution), filters, and activity feed
- **Project Management** — CRUD for projects with soft deactivation
- **User Management** — List users, change roles, activate/deactivate accounts
- **Centralized Configuration** — All settings in dedicated `settings.ts` files, no hardcoded values

## Tech Stack

| Layer      | Technology                                         |
|------------|----------------------------------------------------|
| Frontend   | Next.js 16.3.4, TypeScript, Tailwind CSS, shadcn/ui   |
| Forms      | React Hook Form + Zod                              |
| Charts     | Recharts                                           |
| Backend    | NestJS, TypeScript                                 |
| Database   | PostgreSQL 14+                                     |
| ORM        | Prisma                                             |
| Auth       | JWT (access + refresh tokens), bcrypt              |
| Testing    | Jest + Supertest                                   |
| Deployment | Vercel (FE) + Render/Railway (BE) + Neon/Supabase (DB) |

## Repository Structure

```
weekly-report-system/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── (auth)/          # Login, Register
│   │   │   ├── (member)/        # Member dashboard, reports
│   │   │   └── (manager)/       # Manager dashboard, reports, users, projects
│   │   ├── components/          # Shared + UI components (shadcn/ui)
│   │   ├── features/            # Feature-specific schemas
│   │   ├── lib/                 # API client, utils, settings
│   │   ├── services/            # API service layer
│   │   ├── constants/           # Frontend constants
│   │   └── types/               # TypeScript interfaces
│   └── package.json
├── backend/                     # NestJS application
│   ├── src/
│   │   ├── auth/                # Authentication module
│   │   ├── users/               # User management module
│   │   ├── projects/            # Project management module
│   │   ├── reports/             # Report CRUD + workflow module
│   │   ├── reviews/             # Review module
│   │   ├── dashboard/           # Dashboard aggregation module
│   │   ├── health/              # Health check endpoint
│   │   ├── database/            # Prisma service
│   │   ├── common/              # Shared guards, decorators, DTOs, enums
│   │   ├── settings.ts          # Centralized backend configuration
│   │   └── main.ts              # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── seed.ts              # Seed data script
│   │   └── migrations/          # Migration files
│   └── package.json
├── docs/                        # Documentation (21 guides)
├── docker-compose.yml           # PostgreSQL setup
├── .gitignore
└── README.md
```

## Configuration

All configuration is centralized in dedicated settings files:

### Backend — `backend/src/settings.ts`

Reads from environment variables with fallback defaults:

| Setting | Env Variable | Default |
|---------|-------------|---------|
| Database Host | `DB_HOST` | `localhost` |
| Database Port | `DB_PORT` | `5432` |
| Database User | `DB_USER` | `postgres` |
| Database Password | `DB_PASSWORD` | `postgres` |
| Database Name | `DB_NAME` | `weekly_report_db` |
| JWT Access Secret | `JWT_ACCESS_SECRET` | `dev-access-secret-change-in-production` |
| JWT Refresh Secret | `JWT_REFRESH_SECRET` | `dev-refresh-secret-change-in-production` |
| Server Port | `PORT` | `5000` |
| Frontend URL | `FRONTEND_URL` | `http://localhost:3000` |

### Frontend — `frontend/src/lib/settings.ts`

| Setting | Env Variable | Default |
|---------|-------------|---------|
| API Base URL | `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:5000/api/v1` |

## Getting Started

### Prerequisites

- Node.js >= 24
- PostgreSQL 14+ (or Docker)
- npm

### 1. Clone and install

```bash
git clone <repo-url>
cd weekly-report-system
```

### 2. Start database

**Option A — Docker:**

```bash
docker-compose up -d
```

**Option B — Local PostgreSQL:**

Ensure PostgreSQL is running on port 5432.

### 3. Backend setup

```bash
cd backend
cp .env.example .env        # Edit with your database credentials
npm install
npm run db:init              # Creates DB + tables + seed data in one command
npm run start:dev
```

**Available database commands:**

| Command | Description |
|---------|-------------|
| `npm run db:init` | Create database, tables, and seed (full setup) |
| `npm run db:reset` | Reset migrations and re-seed |
| `npm run db:fresh` | Alias for `db:init` |
| `npm run seed` | Seed only (no schema changes) |
| `npm run prisma:studio` | Open Prisma Studio GUI |

### 4. Frontend setup

```bash
cd frontend
cp .env.local.example .env.local  # Edit with your API URL
npm install
npm run dev
```

### 5. Open

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/v1/health

## Database

See [docs/21-database-setup-guide.md](docs/21-database-setup-guide.md) for detailed setup instructions.

### Tables (12)

| Table | Purpose |
|-------|---------|
| `users` | User accounts with roles |
| `projects` | Project definitions |
| `user_projects` | User-project assignments |
| `reports` | Weekly report headers |
| `report_tasks` | Tasks within a report |
| `next_week_tasks` | Planned next-week tasks |
| `blockers` | Blocker items |
| `achievements` | Achievement items |
| `work_hours` | Work hour breakdowns |
| `report_versions` | Immutable version snapshots |
| `reviews` | Manager review records |
| `refresh_tokens` | JWT refresh tokens |

## Demo Accounts (Seed Data)

| Role | Name | Email | Password |
|------|------|-------|----------|
| Admin | Demo Administrator | admin@example.com | password123 |
| Manager | Sarah Fernando | sarah@example.com | password123 |
| Team Member | Kasun Silva | kasun@example.com | password123 |
| Team Member | Ayesha Perera | ayesha@example.com | password123 |
| Team Member | Mohamed Rizwan | mohamed@example.com | password123 |
| Team Member | Nimal Jayasinghe | nimal@example.com | password123 |

## API Documentation

Base path: `/api/v1`

### Authentication

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

### Reports

```
POST   /api/v1/reports
GET    /api/v1/reports/my
GET    /api/v1/reports/:id
PATCH  /api/v1/reports/:id
POST   /api/v1/reports/:id/submit
GET    /api/v1/reports/:id/versions
```

### Manager

```
GET  /api/v1/manager/reports
GET  /api/v1/manager/reports/:id
POST /api/v1/manager/reports/:id/request-changes
POST /api/v1/manager/reports/:id/approve
GET  /api/v1/manager/dashboard/summary
GET  /api/v1/manager/dashboard/status-distribution
GET  /api/v1/manager/dashboard/task-trends
GET  /api/v1/manager/dashboard/project-workload
GET  /api/v1/manager/dashboard/time-distribution
GET  /api/v1/manager/dashboard/activity
```

### Projects

```
GET    /api/v1/projects
POST   /api/v1/projects
PATCH  /api/v1/projects/:id
DELETE /api/v1/projects/:id
```

### Users

```
GET   /api/v1/users
GET   /api/v1/users/:id
PATCH /api/v1/users/:id/role
PATCH /api/v1/users/:id/status
```

## Documentation

See the `docs/` folder for 21 detailed guides:

1. Requirements and Scope
2. System Architecture
3. Project Setup
4. Database Design
5. Authentication and RBAC
6. Weekly Report Domain
7. Review and Version Workflow
8. Backend API Design
9. Frontend Architecture
10. Manager Dashboard
11. Project and User Management
12. Seed Data
13. Validation, Error Handling, and Logging
14. Security
15. Testing
16. Performance and Scalability
17. Deployment
18. README, ER Diagram, Presentation, and Video
19. Live Coding Preparation
20. Definition of Done
21. Database Setup Guide

## License

MIT


## Verified assignment fixes

See [docs/assignment-fixes.md](docs/assignment-fixes.md) for the implementation changes, reporting rules, tests, and remaining external submission items.

Reporting weeks run Monday-Sunday in UTC. A submission is due before the following Monday at 00:00 UTC. Compliance is submitted member-weeks divided by expected member-weeks for the current active team roster; approval and correction retain submission credit. Pending means no submission; late includes overdue pending reports and reports first submitted after their deadline. Past membership is not inferred because the data model does not store membership history.

From `backend/`, run `npm test -- --runInBand` for unit tests and `npm run test:e2e` for real HTTP/PostgreSQL checks. E2E tests create and migrate an isolated temporary schema in the local configured database, verify the workflow and seed, and remove only that test schema afterward.

Use `npm run db:init` for local setup and `npx prisma migrate deploy` for deployment. Migration SQL and `migration_lock.toml` are tracked by Git; `.env` stays ignored. Node.js 24 or later is required by the backend and is the tested runtime.
