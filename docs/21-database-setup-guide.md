# 21 — Database Setup Guide (PostgreSQL + Prisma)

This guide walks through creating the database, running migrations, and seeding data from scratch.

---

## Prerequisites

- PostgreSQL 14+ installed and running
- Node.js 18+ installed
- Project dependencies installed (`npm install` in `backend/`)

---

## Step 1 — Confirm PostgreSQL Is Running

```bash
pg_isready -h localhost -p 5432
```

Expected output:

```text
localhost:5432 - accepting connections
```

If PostgreSQL is not running:

```bash
# Ubuntu / Debian
sudo service postgresql start

# macOS (Homebrew)
brew services start postgresql

# Windows
net start postgresql
```

---

## Step 2 — Create the Database

Connect to PostgreSQL and create the database:

```bash
PGPASSWORD=postgres psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE weekly_report_db;"
```

If the database already exists, you will see:

```text
ERROR:  database "weekly_report_db" already exists
```

This is safe to ignore.

---

## Step 3 — Configure Environment Variables

The `backend/.env` file must contain a valid `DATABASE_URL`.

### Option A — Individual Fields (Recommended)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=weekly_report_db
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
```

### Option B — Direct URL

```env
DATABASE_URL=postgresql://username:password@host:port/database_name
```

> **Important:** `DATABASE_URL` must be uncommented and set. Prisma reads it directly
> from the environment. The `settings.ts` file builds it from individual fields as a
> fallback, but Prisma requires the actual `DATABASE_URL` env var.

### Full `.env` Template

```env
# ─── Database ────────────────────────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=weekly_report_db
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}

# ─── JWT / Auth ─────────────────────────────────────────────
JWT_ACCESS_SECRET=your-access-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ─── Server ─────────────────────────────────────────────────
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

---

## Quick Setup (One Command)

From the `backend/` directory, run:

```bash
npm run db:init
```

This single command will:
1. Read database config from `.env`
2. Create the database if it doesn't exist
3. Generate the Prisma client
4. Run all migrations (create tables)
5. Seed the database with demo data

Expected output:

```text
╔══════════════════════════════════════════╗
║   Weekly Report — Database Init Script   ║
╚══════════════════════════════════════════╝

▶ Loading .env ...
  Host: localhost
  Port: 5432
  User: postgres
  Database: weekly_report_db

▶ Creating database ...
✅ Create database — done
✅ Generate Prisma Client — done
✅ Run database migrations — done
✅ Seed database — done

╔══════════════════════════════════════════╗
║         🎉 Database initialized!         ║
╚══════════════════════════════════════════╝
```

---

## Manual Steps (if needed)

### Step 4 — Generate Prisma Client

```bash
npx prisma generate
```

### Step 5 — Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### Tables Created (12)

| Table | Purpose |
|-------|---------|
| `users` | User accounts with roles |
| `projects` | Project definitions |
| `user_projects` | Many-to-many user-project assignments |
| `reports` | Weekly report headers |
| `report_tasks` | Tasks within a report |
| `next_week_tasks` | Planned next-week tasks |
| `blockers` | Blocker items |
| `achievements` | Achievement items |
| `work_hours` | Work hour breakdowns |
| `report_versions` | Immutable version snapshots |
| `reviews` | Manager review records |
| `refresh_tokens` | JWT refresh tokens |

### Step 6 — Seed the Database

```bash
npx prisma db seed
```

### What Gets Seeded

| Entity | Count | Details |
|--------|-------|---------|
| **Users** | 5 | 1 Manager (Sarah Fernando) + 4 Team Members |
| **Projects** | 4 | Client Portal, Internal ERP, Mobile App, R&D |
| **Reports** | 16 | 4 per member × 4 weeks, mixed statuses |
| **Versions** | 12 | Snapshot for each non-draft report |
| **Reviews** | 8 | Manager reviews for approved/correction reports |

### Verify Seed Data

```bash
# Check users
PGPASSWORD=postgres psql -U postgres -h localhost -p 5432 -d weekly_report_db \
  -c "SELECT name, email, role FROM users;"

# Check projects
PGPASSWORD=postgres psql -U postgres -h localhost -p 5432 -d weekly_report_db \
  -c "SELECT name, is_active FROM projects;"

# Check report statuses
PGPASSWORD=postgres psql -U postgres -h localhost -p 5432 -d weekly_report_db \
  -c "SELECT status, COUNT(*) FROM reports GROUP BY status;"
```

### Expected Output

```text
       name       |        email        |    role
------------------+---------------------+-------------
 Sarah Fernando   | sarah@example.com   | MANAGER
 Kasun Silva      | kasun@example.com   | TEAM_MEMBER
 Ayesha Perera    | ayesha@example.com  | TEAM_MEMBER
 Mohamed Rizwan   | mohamed@example.com | TEAM_MEMBER
 Nimal Jayasinghe | nimal@example.com   | TEAM_MEMBER

          name          | is_active
------------------------+-----------
 Client Portal          | t
 Internal ERP           | t
 Mobile Application     | t
 Research & Development | t

      status      | count
------------------+-------
 SUBMITTED        |     4
 DRAFT            |     4
 NEEDS_CORRECTION |     4
 APPROVED         |     4
```

---

## Step 7 — Start the Backend

```bash
cd backend
npm run build
node dist/src/main.js
```

Or in development mode:

```bash
npm run start:dev
```

### Verify It Works

```bash
curl http://localhost:5000/api/v1/health
```

Expected response:

```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-09-03T08:38:56.821Z"
}
```

---

## Step 8 — Test Authentication

```bash
# Login as Manager
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah@example.com","password":"password123"}'

# Login as Team Member
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kasun@example.com","password":"password123"}'
```

---

## Demo Accounts

| Role | Name | Email | Password |
|------|------|-------|----------|
| Manager | Sarah Fernando | sarah@example.com | password123 |
| Team Member | Kasun Silva | kasun@example.com | password123 |
| Team Member | Ayesha Perera | ayesha@example.com | password123 |
| Team Member | Mohamed Rizwan | mohamed@example.com | password123 |
| Team Member | Nimal Jayasinghe | nimal@example.com | password123 |

---

## Available Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:init` | Full setup: create DB + tables + seed |
| `npm run db:reset` | Reset migrations and re-seed |
| `npm run db:fresh` | Alias for `db:init` |
| `npm run seed` | Seed only |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Run pending migrations |

## Resetting the Database

To start fresh:

```bash
npm run db:reset
```

Or manually:

```bash
npx prisma migrate reset --force
npm run seed
```

---

## Troubleshooting

### "Environment variable not found: DATABASE_URL"

Ensure `DATABASE_URL` is set in `backend/.env` (not commented out).

### "password authentication failed"

Check that `DB_USER` and `DB_PASSWORD` in `.env` match your PostgreSQL credentials.

### "relation does not exist"

Run `npx prisma migrate dev` to apply pending migrations.

### "prisma generate" needed after schema changes

Always run `npx prisma generate` after modifying `prisma/schema.prisma`.

### Port conflict on 5432

Check if another PostgreSQL instance is running:

```bash
sudo lsof -i :5432
```

---

## Architecture Notes

### Why Separate `DB_*` Fields?

The `.env` uses individual database fields (`DB_HOST`, `DB_PORT`, etc.) for clarity.
The `settings.ts` file builds the full `DATABASE_URL` from these fields as a fallback.
Prisma itself requires `DATABASE_URL` as a single string. In this project, it is set once and expanded from the individual database fields above.

### Settings Hierarchy

```text
.env (actual env vars)
  ↓
settings.ts reads process.env.* with fallback defaults
  ↓
All application code references settings.* instead of hardcoded values
```

### Migration Strategy

- Development: `npx prisma migrate dev --name <description>`
- Production: `npx prisma migrate deploy`
- Never use `migrate dev` in production
