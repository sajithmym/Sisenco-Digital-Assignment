# Security design

## Browser and transport protections

The API uses Helmet and credentialed CORS restricted to `FRONTEND_URL`. The Next.js configuration removes its powered-by header and applies content-type, frame, referrer, permissions, and production HSTS headers. Production must use HTTPS.

## Token/session protection

Passwords use bcrypt with 12 rounds. Access tokens are short-lived and live only in frontend module memory. Refresh tokens have a unique JWT ID, are SHA-256 hashed before database storage, and rotate atomically. The refresh token is an HttpOnly cookie scoped to `/api/v1/auth`; refresh/logout also require `X-Requested-With: weekly-report-web`.

Production startup rejects missing, short, duplicate, or development JWT secrets. Use two distinct random 32+ character secrets. Use `AUTH_COOKIE_SAME_SITE=none` only for separate HTTPS API/frontend origins.

## Authorization and abuse protection

JWT, roles, ownership, visibility, and workflow state are enforced by the API. Private draft content and report IDs are hidden from all management roles; dashboard roster/summary output may expose only draft status/count metadata. The global throttle is 100 requests/minute, with auth overrides of registration 3/minute, login 5/minute, and refresh 20/minute. Production dependency audits currently find zero vulnerabilities in either application package.
