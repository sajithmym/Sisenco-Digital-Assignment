# 13 — Validation, Error Handling, and Logging

## Backend Validation

Enable NestJS global ValidationPipe.

Recommended behavior:

```text
whitelist: true
forbidNonWhitelisted: true
transform: true
```

## Error Categories

Use correct HTTP status codes.

Examples:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
500 Internal Server Error
```

## Domain Errors

Examples:

```text
ReportNotEditableException
InvalidReportTransitionException
ReportOwnershipException
ReviewCommentRequiredException
```

Avoid scattered generic:

```ts
throw new Error("Something went wrong");
```

## Global Exception Filter

Return consistent error responses.

Example:

```json
{
  "statusCode": 403,
  "code": "REPORT_ACCESS_DENIED",
  "message": "You do not have permission to access this report.",
  "timestamp": "..."
}
```

## Frontend Errors

Show user-friendly messages.

Do not expose stack traces.

## Logging

Log:

- Authentication failures
- Important workflow actions
- Unexpected server errors

Do not log:

- Passwords
- JWT tokens
- Refresh tokens
- Sensitive secrets
