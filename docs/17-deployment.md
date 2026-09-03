# 17 — Deployment

## Recommended Deployment

### Frontend

```text
Vercel
```

### Backend

Choose one:

```text
Render
Railway
Azure
VPS
```

### Database

Choose managed PostgreSQL:

```text
Neon
Supabase
Railway PostgreSQL
Render PostgreSQL
```

## Production Checklist

### Backend

- Production environment variables
- Database migrations applied
- CORS configured
- Helmet enabled
- Logging configured
- Health endpoint
- Strong JWT secrets
- `NODE_ENV=production`

### Frontend

- Correct API base URL
- Production build succeeds
- Responsive UI verified
- Auth redirect verified

## Database Migration

Use:

```bash
npx prisma migrate deploy
```

Do not use development migration commands in production.

## Health Endpoint

Example:

```text
GET /health
```

Return backend and database health.

## Deployment Verification

Test:

1. Register/login.
2. Member creates report.
3. Member submits.
4. Manager reviews.
5. Correction cycle.
6. Approval.
7. Dashboard loads.
8. Refreshing protected pages still works.
