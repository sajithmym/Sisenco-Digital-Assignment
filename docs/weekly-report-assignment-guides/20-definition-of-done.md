# 20 — Definition of Done

Use this before submission.

## Authentication

- [ ] Register works.
- [ ] Login works.
- [ ] Logout works.
- [ ] Passwords are hashed.
- [ ] Sessions/tokens are handled securely.
- [ ] Protected routes reject unauthenticated users.

## RBAC

- [ ] Team Members access only their own reports.
- [ ] Managers can view team reports.
- [ ] Team Members cannot access manager endpoints.
- [ ] Managers cannot rewrite member report content.
- [ ] Admin-only actions are protected.

## Reports

- [ ] Create Draft.
- [ ] Edit Draft.
- [ ] Submit.
- [ ] View report.
- [ ] View history.
- [ ] Edit Needs Correction.
- [ ] Cannot edit Submitted.
- [ ] Cannot edit Approved.

## Review Workflow

- [ ] Manager can request changes.
- [ ] Correction comment required.
- [ ] Member can see correction comment.
- [ ] Member can resubmit.
- [ ] Manager can approve.
- [ ] Previous versions stay visible.
- [ ] Review is linked to the correct version.

## Dashboard

- [ ] Submitted count.
- [ ] Compliance rate.
- [ ] Needs Correction count.
- [ ] Open blockers count.
- [ ] Charts work.
- [ ] Filters work.
- [ ] Activity feed works.

## Pages

- [ ] At least seven real pages/views.
- [ ] Pages use backend data.
- [ ] Loading states.
- [ ] Empty states.
- [ ] Error states.
- [ ] Responsive UI.

## Database

- [ ] Migrations committed.
- [ ] Seed data available.
- [ ] 3–5 Team Members.
- [ ] Several weeks of reports.
- [ ] Mixed statuses.
- [ ] Version-history example.

## Code Quality

- [ ] Constants separated.
- [ ] Configuration separated.
- [ ] No duplicated business logic.
- [ ] DTO validation.
- [ ] Reusable components.
- [ ] Meaningful naming.
- [ ] Controllers stay thin.
- [ ] Business logic stays in services.
- [ ] Errors handled consistently.

## Security

- [ ] `.env` ignored.
- [ ] `.env.example` included.
- [ ] CORS configured.
- [ ] Helmet enabled.
- [ ] No sensitive logs.
- [ ] Backend authorization verified.

## Testing

- [ ] RBAC test included.
- [ ] Workflow tests included where possible.
- [ ] Tests pass.

## Deployment

- [ ] Frontend deployed.
- [ ] Backend deployed.
- [ ] Database deployed.
- [ ] Production URLs work.
- [ ] Full correction cycle tested in production.

## Deliverables

- [ ] GitHub repository.
- [ ] README.
- [ ] ER diagram.
- [ ] Presentation.
- [ ] Video with camera visible.
- [ ] Google Drive sharing enabled.
- [ ] Submission links checked.
