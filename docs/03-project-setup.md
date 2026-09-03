# 03 — Project Setup

## Repository Structure

```text
weekly-report-system/
├── frontend/
├── backend/
├── docs/
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Frontend Setup

Create Next.js using:

```bash
npx create-next-app@latest frontend
```

Recommended choices:

- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- App Router: Yes
- `src/` directory: Yes

Install:

```bash
cd frontend
npm install react-hook-form zod @hookform/resolvers
npm install recharts
npm install axios
```

Install shadcn/ui separately following its official setup.

## Backend Setup

```bash
npm i -g @nestjs/cli
nest new backend
```

Install:

```bash
cd backend
npm install @nestjs/config
npm install @nestjs/passport passport
npm install @nestjs/jwt passport-jwt
npm install bcrypt
npm install class-validator class-transformer
npm install prisma @prisma/client
npm install helmet
npm install @nestjs/mapped-types
```

Development types:

```bash
npm install -D @types/bcrypt @types/passport-jwt
```

Initialize Prisma:

```bash
npx prisma init
```

## Environment Variables

### Backend `.env`

```env
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=
FRONTEND_URL=
PORT=
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=
```

## Hard-Coded Values Rule

Do not spread values such as:

```text
5000
15m
7d
DRAFT
SUBMITTED
10
20
```

through the application.

Use dedicated constants and enums.

Example:

```text
src/common/constants/
src/common/enums/
frontend/src/constants/
```

## Git Branching

Recommended:

```text
main
develop
feature/authentication
feature/reports
feature/review-workflow
feature/dashboard
```

Use small commits with clear messages.
