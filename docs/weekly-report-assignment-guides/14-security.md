# 14 — Security

## Security Priorities

### Passwords

- bcrypt hashing
- Never log passwords
- Never store plain text

### Tokens

- Strong secrets
- Separate access and refresh secrets
- Rotation where practical
- Revoke refresh tokens at logout

### HTTP

Use Helmet.

Configure CORS explicitly.

Do not use:

```text
origin: *
```

in production when credentials are enabled.

### Authorization

Every protected backend endpoint must enforce:

- Authentication
- Role permission
- Resource ownership where required

### Database

Use Prisma parameterized queries.

Avoid raw SQL unless necessary.

### Input

Validate:

- IDs
- enums
- dates
- numbers
- strings
- URLs
- pagination

### Mass Assignment

Never blindly spread request objects into database updates.

Bad:

```ts
prisma.user.update({
  data: req.body,
});
```

Use explicit DTO mapping.

### Rate Limiting

Consider rate limiting for:

- Login
- Registration
- Token refresh

### Secrets

Never commit:

```text
.env
private keys
production credentials
```

Provide `.env.example`.
