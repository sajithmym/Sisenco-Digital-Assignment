# 06 — Team Report Filters and Status Tracking

## Required filters
Add:
```text
Team Member
Project
Status
Week Start
Week End
```

Recommended DTO:
```text
userId?
projectId?
status?
weekStart?
weekEnd?
page?
limit?
```

## Not Yet Started
For a selected week, show all active Team Members even if no report exists.

Example:
```text
Kasun Silva       Submitted
Nimal Jayasinghe  Approved
Ayesha Perera     Not Started
Mohamed Rizwan    Draft
```

`NOT_STARTED` can be a derived manager-only state instead of a stored report status.

## Recommended endpoint
```text
GET /api/v1/manager/reports/compliance?weekStart=...
```

## Pagination
Use `page` and `limit` on report lists.

## Done
- [ ] Team Member filter
- [ ] Project filter
- [ ] Status filter
- [ ] Date filter
- [ ] Reset filters
- [ ] Pagination
- [ ] Not Started tracking
