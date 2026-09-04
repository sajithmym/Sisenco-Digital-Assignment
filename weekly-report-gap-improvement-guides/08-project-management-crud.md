# 08 — Project Management CRUD

## Required
```text
Create
Read
Update
Delete / Archive
```

## Recommended model
```text
id
name
description
isActive
createdAt
updatedAt
```

## Prefer archive
If project is referenced by old reports, do not delete history.

Use:
```text
isActive = false
```

UI actions:
```text
Edit
Archive
Activate
```

## Report form
Only active projects should appear in new/edit report project selection.

## Done
- [ ] Create
- [ ] Edit
- [ ] Archive
- [ ] Reactivate
- [ ] Validation
- [ ] Active project dropdown
