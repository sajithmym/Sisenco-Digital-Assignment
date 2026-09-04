# 11 — Pagination, Validation and Error Handling

## Pagination constants
Put in a constants file:
```text
DEFAULT_PAGE = 1
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100
```

Response:
```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

## NestJS validation
Use global `ValidationPipe`:
```text
whitelist: true
forbidNonWhitelisted: true
transform: true
```

## Consistent errors
Example:
```json
{
  "statusCode": 403,
  "code": "ACCESS_DENIED",
  "message": "You do not have permission to perform this action."
}
```

## Replace browser `alert()`
Use:
- Sonner/toast
- AlertDialog
- inline field errors

## Destructive operations
Confirm before:
- deactivate
- archive
- delete
- approve where appropriate

## Done
- [ ] Pagination
- [ ] DTO validation
- [ ] Consistent errors
- [ ] No raw `alert()`
- [ ] Loading and disabled button states
