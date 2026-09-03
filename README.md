# Weekly Report Generator & Team Dashboard

A production-style internal web application where team members create and submit weekly reports, managers review and approve them, and everyone benefits from a consolidated team dashboard.

## Features

- **Authentication** — Register, login, logout with JWT (access + refresh tokens)
- **RBAC** — Team Member, Manager, and Admin roles with backend-enforced authorization
- **Weekly Reports** — Create, edit, submit reports with structured sections (tasks, blockers, achievements, work hours)
- **Review Workflow** — DRAFT → SUBMITTED → NEEDS_CORRECTION → APPROVED with version history
- **Manager Dashboard** — KPIs, charts, filters, and activity feed
- **Project Management** — CRUD for projects with soft deactivation
- **User Management** — List users, change roles, activate/deactivate accounts

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Forms      | React Hook Form + Zod               |
| Charts     | Recharts                            |
| Backend    | NestJS, TypeScript                  |
| Database   | PostgreSQL                          |
| ORM        | Prisma                              |
| Auth       | JWT (access + refresh tokens), bcrypt |
| Testing    | Jest + Supertest                    |
| Deployment | Vercel (FE) + Render/Railway (BE)   |

## Repository Structure

```
weekly-report-system/
├── frontend/          # Next.js application
├── backend/           # NestJS application
├── docs/              # Documentation, ER diagrams
├── docker-compose.yml # PostgreSQL setup
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL (or Docker)
- npm or yarn

### 1. Clone and install

```bash
git clone <repo-url>
cd weekly-report-system
```

### 2. Start database

```bash
docker-compose up -d
```

### 3. Backend setup

```bash
cd backend
cp .env.example .env        # Fill in your values
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

### 4. Frontend setup

```bash
cd frontend
cp .env.local.example .env.local  # Fill in API URL
npm install
npm run dev
```

### 5. Open

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Demo Accounts (Seed Data)

| Role        | Email                    | Password  |
|-------------|--------------------------|-----------|
| Manager     | sarah@example.com        | password123 |
| Team Member | kasun@example.com        | password123 |
| Team Member | ayesha@example.com       | password123 |
| Team Member | mohamed@example.com      | password123 |
| Team Member | nimal@example.com        | password123 |

## API Documentation

Base path: `/api/v1`

See [Backend API Design](weekly-report-assignment-guides/08-backend-api-design.md) for full endpoint reference.

## License

MIT
