# Performance and scalability

## Current approach

Server-side pagination and validated filters bound user/project/report lists. Dashboard services aggregate in PostgreSQL through Prisma rather than transferring complete report data to the browser. Frontend feature modules separate request services and reusable loading/error state from presentation.

## Database considerations

The report uniqueness constraint prevents duplicate week records. Query shapes fetch only relations required by each response. As data volume grows, inspect query plans for dashboard date filters, roster lookup, report filters, and project workload aggregation before adding indexes through a migration.

## Growth path

Deploy frontend and API separately over HTTPS, use managed PostgreSQL/backups/connection limits, then add centralized logs, metrics, tracing, and carefully scoped dashboard caching based on measured need. A multi-instance API deployment needs a shared throttling store to enforce limits consistently across instances.

Never place authenticated/private reports in a shared public cache. Preserve role, visibility, and workflow filtering before introducing any cache or read replica.
