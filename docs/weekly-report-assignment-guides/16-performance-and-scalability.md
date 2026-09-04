# 16 — Performance and Scalability

## Database

Add indexes for frequently filtered columns:

```text
reports.user_id
reports.status
reports.week_start
reports.week_end
reviews.report_id
report_versions.report_id
```

## Pagination

Never return unlimited report lists.

Use server pagination.

## Query Design

Avoid N+1 query patterns.

Select only required fields.

## Dashboard

Aggregate server-side.

Cache only when needed.

Do not add premature caching before measuring.

## Frontend

Use:

- Server Components where appropriate.
- Client Components only for interactive parts.
- Dynamic loading for heavy chart components if helpful.
- Debounced filters where relevant.

## Scalability Principle

Keep stateless business APIs where possible.

Do not store session state only in process memory if production scaling is expected.
