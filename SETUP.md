# 🚀 Project Setup Guide

Step-by-step guide to run **Weekly Report Generator** locally — frontend and backend.

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | >= 24 | `node --version` |
| npm | >= 9 | `npm --version` |
| PostgreSQL | 14+ | `psql --version` (or use Docker) |

---

## 1. Start PostgreSQL

**Option A — Docker (recommended, one command):**

```bash
docker-compose up -d
```

`npm run db:fresh` creates and checks the database through the application’s
PostgreSQL driver. You do not need to install PostgreSQL or add `psql` to your
Windows PATH when using Docker.

**Option B — Local PostgreSQL:**

Make sure PostgreSQL is running on `localhost:5432` with user `postgres`.

> ℹ️ `npm run db:fresh` creates the database automatically — you only need a running PostgreSQL server.

---

## 2. Backend Setup

### 2.1 Navigate to the backend folder

```bash
cd backend
```

### 2.2 Install dependencies

```bash
npm i
```

### 2.3 Create the `.env` file

The backend reads all its configuration from `.env`. There is no `.env` committed — you create it from the template.

**Step 1 — copy the example file:**

```bash
cp .env.example .env
```

**Step 2 — open `.env` and change the values:**

```env
# ─── Server ─────────────────────────────────────────────────
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# ─── Database ───────────────────────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres          # ← change to your PostgreSQL password
DB_NAME=weekly_report_db

# REQUIRED by Prisma — keep in sync with the fields above
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}

# ─── JWT / Auth ─────────────────────────────────────────────
JWT_ACCESS_SECRET=change-me-to-a-random-access-secret   # ← change!
JWT_REFRESH_SECRET=change-me-to-a-random-refresh-secret # ← change!
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
AUTH_COOKIE_SAME_SITE=lax
ALLOW_SELF_REGISTRATION=true
```

When `ALLOW_SELF_REGISTRATION=true`, public registration saves a team-member
account in a pending state. An administrator must open **Users** and activate
the account before the person can sign in. Set the value to `false` when all
accounts should be created by an administrator or SSO.

> **Important:** Prisma expands `DATABASE_URL` from the individual values above. Update each database field once; if `DB_PASSWORD` contains URL-reserved characters such as `@`, `:`, `/`, or `#`, URL-encode that value first.

### 2.4 Generate JWT secrets

JWT secrets must be long random strings. Generate them with either command:

```bash
# Option 1 — Node.js crypto
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2 — OpenSSL
openssl rand -hex 32
```

Paste the two outputs into `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in `.env`.

### 2.5 Initialize the database

```bash
npm run db:fresh
```

This single command:

1. Creates the database `weekly_report_db` (if missing)
2. Generates the Prisma client
3. Runs migrations (creates all tables)
4. Seeds demo users, projects, and sample reports

> ℹ️ Alias of `npm run db:init`. Use `npm run db:reset` later if you want to wipe and re-seed.

If seed reports `The table public.users does not exist`, do not run `npm run seed` by itself. Run `npm run db:init` so migrations are applied before seed data is inserted. If this development checkout has no migration directory, `db:init` regenerates the initial migration from `prisma/schema.prisma`; commit the regenerated `backend/prisma/migrations/` files so other devices receive the same history.

### 2.6 Start the backend

```bash
npm run dev
```

Backend runs at **http://localhost:5000** (health check: http://localhost:5000/api/v1/health).

---

## 3. Frontend Setup

### 3.1 Navigate to the frontend folder (new terminal)

```bash
cd frontend
```

### 3.2 Install dependencies

```bash
npm i
```

### 3.3 Create the `.env.local` file

```bash
cp .env.local.example .env.local
```

Open `.env.local` — change the API URL if your backend runs elsewhere:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

### 3.4 Start the frontend

```bash
npm run dev
```

Frontend runs at **http://localhost:3000**.

---

## 4. Demo Accounts (seeded)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `password123` |
| Manager | `sarah@example.com` | `password123` |
| Team Member | `kasun@example.com` | `password123` |
| Team Member | `ayesha@example.com` | `password123` |
| Team Member | `mohamed@example.com` | `password123` |
| Team Member | `nimal@example.com` | `password123` |

---

## 5. How JWT Tokens Are Generated (backend code)

### 5.1 Configuration — `backend/src/settings.ts`

```ts
export const AUTH_SETTINGS = {
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  // Cookie/database expiry is derived from JWT_REFRESH_EXPIRES_IN.
  passwordHashRounds: 12,
} as const;
```

### 5.2 JwtModule registration — `backend/src/auth/auth.module.ts`

```ts
JwtModule.register({
  secret: AUTH_SETTINGS.jwtAccessSecret,
  signOptions: {
    expiresIn: AUTH_SETTINGS.jwtAccessExpiresIn,
  },
}),
```

### 5.3 Token generation — `backend/src/auth/auth.service.ts`

```ts
private async generateTokens(userId: string, email: string, role: string) {
  const payload = { sub: userId, email, role };

  const [accessToken, refreshToken] = await Promise.all([
    this.jwtService.signAsync(payload, {
      expiresIn: AUTH_SETTINGS.jwtAccessExpiresIn,
    }),
    this.jwtService.signAsync({ ...payload, jti: randomUUID() }, {
      secret: AUTH_SETTINGS.jwtRefreshSecret,   // refresh token uses its own secret
      expiresIn: AUTH_SETTINGS.jwtRefreshExpiresIn,
    }),
  ]);

  return { accessToken, refreshToken };
}
```

### 5.4 Token verification — `backend/src/auth/strategies/jwt.strategy.ts`

Every protected endpoint validates the `Authorization: Bearer <token>` header:

```ts
super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  secretOrKey: AUTH_SETTINGS.jwtAccessSecret,
});
```

Refresh tokens are additionally stored in the `refresh_tokens` table and rotated on every refresh.

The refresh token is sent only as a Secure, HttpOnly cookie and is stored as a hash in the database. Browser JavaScript never receives it; access tokens are kept only in memory.

## Production safety

- Set `NODE_ENV=production`, distinct random JWT secrets of at least 32 characters, and a real `DATABASE_URL`.
- Self-registered accounts are pending activation by default. Set `ALLOW_SELF_REGISTRATION=false` when only administrator-created users or SSO should create accounts.
- When frontend and API use different sites, set `AUTH_COOKIE_SAME_SITE=none`; both must use HTTPS.
- Deploy database changes with `npx prisma migrate deploy`. Do not use `db:init`, `db:fresh`, or seed data in production.
- Existing matching local tables can be baselined without resetting data using `npm run db:baseline`. If old migration files were lost, `npm run db:baseline -- --replace-missing-history` first checks schema equivalence and backs up the old migration metadata before replacing that history. Run `npm run db:repair-demo` once to repair known legacy demo counters and reporting dates, then `npm run seed` to provision the demo admin and a complete correction example.

---

## Useful Commands

| Command (in `backend/`) | Description |
|--------------------------|-------------|
| `npm run dev` | Start backend in watch mode |
| `npm run db:fresh` | Create DB + tables + seed (same as `db:init`) |
| `npm run db:reset` | Reset migrations and re-seed |
| `npm run seed` | Seed only |
| `npm run prisma:studio` | Open Prisma Studio GUI |

| Command (in `frontend/`) | Description |
|--------------------------|-------------|
| `npm run dev` | Start frontend in watch mode |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `ECONNREFUSED` on database | Start PostgreSQL (or `docker-compose up -d`) first |
| `P1001: Can't reach database server` | `DATABASE_URL` in `.env` has wrong host/port/password |
| `JWT_SECRET` too short | Generate with `openssl rand -hex 32` |
| Frontend can't reach API | `NEXT_PUBLIC_API_BASE_URL` in `.env.local` must match backend `PORT` + `/api/v1` |


## Verified assignment fixes

See [docs/assignment-fixes.md](docs/assignment-fixes.md) for the implementation changes, reporting rules, tests, and remaining external submission items.

Reporting weeks run Monday-Sunday in UTC. A submission is due before the following Monday at 00:00 UTC. Compliance is submitted member-weeks divided by expected member-weeks for the current active team roster; approval and correction retain submission credit. Pending means no submission; late includes overdue pending reports and reports first submitted after their deadline. Past membership is not inferred because the data model does not store membership history.

From `backend/`, run `npm test -- --runInBand` for unit tests and `npm run test:e2e` for real HTTP/PostgreSQL checks. E2E tests create and migrate an isolated temporary schema in the local configured database, verify the workflow and seed, and remove only that test schema afterward.

Use `npm run db:init` for local setup and `npx prisma migrate deploy` for deployment. Migration SQL and `migration_lock.toml` are tracked by Git; `.env` stays ignored. Node.js 24 or later is required by the backend and is the tested runtime.
