# 01 — Requirements and Scope

## Goal

Build a production-style internal web application where:

- Team Members create and submit weekly reports.
- Managers review reports.
- Managers can approve reports or request corrections.
- Team Members can edit reports after correction requests and resubmit.
- Managers have a consolidated team dashboard.

## Core Roles

### Team Member

Can:

- Register / login / logout.
- Create their own weekly report.
- Save a report as Draft.
- Edit Draft reports.
- Edit reports in Needs Correction state.
- Submit reports.
- View their own report history.
- View manager review comments.
- View previous versions of their own reports.

Cannot:

- View another team member's private reports.
- Approve reports.
- Change another user's role.
- Access manager-only endpoints.

### Manager / Admin

Can:

- View team reports.
- Filter reports.
- Review submitted reports.
- Approve reports.
- Request corrections with comments.
- View version history.
- View dashboard metrics and charts.
- Manage projects.
- Manage users and roles where applicable.

Cannot:

- Rewrite a Team Member's report content.

## Required Report Statuses

```text
DRAFT
SUBMITTED
NEEDS_CORRECTION
APPROVED
```

## Required Workflow

```text
DRAFT
  ↓
SUBMITTED
  ↓
MANAGER REVIEW
  ├─ APPROVED
  └─ NEEDS_CORRECTION
          ↓
       MEMBER EDITS
          ↓
       SUBMITTED
          ↓
      MANAGER REVIEW
```

## Minimum Required Pages

Implement more than the minimum seven pages.

Recommended:

1. Login
2. Register
3. Team Member Dashboard
4. Create / Edit Weekly Report
5. Report History
6. Report Detail
7. Manager Dashboard
8. Manager Review
9. Team Member Profile
10. Project Management
11. User Management

## Required Deliverables

- GitHub repository
- Frontend code
- Backend code
- Setup README
- Presentation
- ER diagram image
- Demo video
- Shared Google Drive folder

## Scope Rule

Finish the core system before optional AI features.

Priority order:

1. Authentication
2. RBAC
3. Report creation
4. Review workflow
5. Version history
6. Dashboard
7. Tests
8. Deployment
9. Documentation
10. Optional AI
