# Backend API design

## Conventions

The NestJS application has global prefix `/api/v1`. Success/failure payloads share `{ success, statusCode, message, data, timestamp, code? }`; paginated results add `meta.page`, `meta.limit`, `meta.total`, and `meta.totalPages`.

Controllers accept validated DTOs and delegate business decisions to feature services. Services hold RBAC, ownership, workflow, and Prisma logic. Shared guards, decorators, exception filters, response DTOs, and configuration are kept outside individual feature modules.

## Route groups

| Group | Base route | Access |
|---|---|---|
| Health | `/health` | Public |
| Auth | `/auth` | Public/protected by action |
| Member reports | `/reports` | Authenticated member owns record |
| Manager reports/dashboard | `/manager/*` | MANAGER, ADMIN |
| Projects | `/projects` | Read authenticated; mutation MANAGER, ADMIN |
| Users | `/users` | Read MANAGER, ADMIN; mutation ADMIN |

The complete HTTP method/route list is in [PROJECT_REFERENCE](PROJECT_REFERENCE.md#api). Query DTOs validate pagination, identifiers, enum/date filters, and dashboard inputs. Validation strips/rejects unrecognized body fields before service/database work.

The global exception filter normalizes validation, authentication, authorization, not-found, conflict, Prisma, and unexpected errors without exposing stacks or database internals.
