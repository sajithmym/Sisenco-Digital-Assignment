# Validation, error handling, and logging

## Validation layers

NestJS global validation transforms input, whitelists allowed properties, and rejects unknown properties. DTOs validate email/password values, UUIDs, enums, dates, pagination, report arrays, and workflow inputs. This server validation remains authoritative even though React Hook Form/Zod give immediate frontend field feedback.

## Error contract

The global exception filter returns a stable envelope for validation, authorization, not-found, conflict, Prisma, and unexpected errors. It does not reveal stacks or database internals. Services throw semantic HTTP exceptions instead of returning ambiguous null/boolean values.

The frontend uses `getErrorMessage` to narrow `unknown` failures safely: it accepts a verified API response message, standard Error text, or a feature-specific fallback. This prevents unsafe `any` error access.

## Operational logging

Local NestJS output supports development diagnosis. Production needs external structured logs/monitoring with redaction for passwords, cookies, JWTs, and connection data. Alert on database health failures, 5xx errors, throttling anomalies, and repeated login failures. This repository does not bundle a log collector.
