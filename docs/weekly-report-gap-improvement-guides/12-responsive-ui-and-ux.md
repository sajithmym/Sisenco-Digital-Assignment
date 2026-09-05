# Responsive UI and user experience

## Implemented behavior

The frontend uses reusable Tailwind/Radix UI components, accessible labels, dialogs, status badges, loading states, empty states, and error alerts. Reports support dynamic form sections and manager screens provide structured status/analytics views.

## Rules and boundaries

Accessibility and responsive behavior require real-browser verification because component tests do not replace keyboard, focus, viewport, cookie, and chart rendering checks. Sensitive error details must not be exposed in the UI.

## Verification

Manually test mobile/desktop widths, keyboard navigation, dialog focus/close behavior, validation announcements, empty/error states, and long report content.

## Related guides

- [Authentication and RBAC](../05-authentication-and-rbac.md)
- [Security](../14-security.md)
- [Testing](../15-testing.md)
