# Frontend architecture

## Structure

- `src/app/(auth)` contains login and registration routes.
- `src/app/(member)` contains member dashboard and report screens.
- `src/app/(manager)` contains manager dashboard, report review, projects, and users.
- `src/features` contains domain components and Zod schemas.
- `src/services` contains typed API functions.
- `src/lib` contains settings, Axios integration, date helpers, request state, and safe error conversion.
- `src/components` contains shared states, selectors, pagination, and reusable UI primitives.

## Data, forms, and errors

`api-client.ts` centralizes API base URL, Authorization attachment, refresh behavior, and authentication failure handling. Services use typed payloads. `use-resource` standardizes loading/error/refetch state. `getErrorMessage(error, fallback)` narrows unknown failures safely before reading API messages.

React Hook Form and Zod validate authentication and report forms. The weekly report form normalizes optional project selection and dynamic task/blocker/achievement/hour collections. Shared error components have accessible alert semantics.

Role-aware layouts/routes guide users to suitable screens, but all sensitive data/actions remain API-enforced. Frontend tests cover auth, schemas, forms, services, dates, selection, pagination, badges, roster, report content, and error handling.
