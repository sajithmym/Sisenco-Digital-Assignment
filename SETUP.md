# 🚀 Project Setup Guide

Step-by-step guide to run **Weekly Report Generator** locally — frontend and backend.

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | >= 18 | `node --version` |
| npm | >= 9 | `npm --version` |
| PostgreSQL | 14+ | `psql --version` (or use Docker) |

---

## 1. Start PostgreSQL

**Option A — Docker (recommended, one command):**

```bash
docker-compose up -d
```

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
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/weekly_report_db

# ─── JWT / Auth ─────────────────────────────────────────────
JWT_ACCESS_SECRET=change-me-to-a-random-access-secret   # ← change!
JWT_REFRESH_SECRET=change-me-to-a-random-refresh-secret # ← change!
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

> ⚠️ **Important:** if your PostgreSQL user/password differ, update `DB_PASSWORD` **and** the password inside `DATABASE_URL` — Prisma only reads `DATABASE_URL`.

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
  jwtRefreshExpiresInDays: 7,
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
    this.jwtService.signAsync(payload, {
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