# 04 — Database Design

## Main Entities

Recommended tables:

```text
users
projects
user_projects
reports
report_tasks
next_week_tasks
blockers
achievements
work_hours
report_versions
reviews
refresh_tokens
```

## Users

Fields:

```text
id
name
email
password_hash
role
is_active
created_at
updated_at
```

Role enum:

```text
TEAM_MEMBER
MANAGER
ADMIN
```

## Projects

```text
id
name
description
is_active
created_at
updated_at
```

## Reports

```text
id
user_id
week_start
week_end
status
notes
latest_version_number
submitted_at
approved_at
created_at
updated_at
```

Status enum:

```text
DRAFT
SUBMITTED
NEEDS_CORRECTION
APPROVED
```

## Report Tasks

```text
id
report_id
task_name
priority
planned_percentage
actual_percentage
status
planned_minutes
actual_minutes
deliverable
created_at
updated_at
```

Prefer storing time using integer minutes instead of floating-point hours.

## Next Week Tasks

```text
id
report_id
description
sort_order
```

## Blockers

```text
id
report_id
description
is_key_issue
is_resolved
```

## Achievements

```text
id
report_id
description
is_key_achievement
```

## Work Hours

```text
id
report_id
type
minutes
```

Example types:

```text
DEVELOPMENT
TESTING
MEETINGS
DOCUMENTATION
OTHER
```

## Report Versions

Store immutable snapshots when a report is submitted.

```text
id
report_id
version_number
snapshot_json
submitted_at
created_by
```

The version record should never be edited after creation.

## Reviews

```text
id
report_id
report_version_id
reviewer_id
action
comment
created_at
```

Action enum:

```text
APPROVED
CHANGES_REQUESTED
```

## Constraints

Add:

- Unique user email.
- Unique report per user + week start where business rules require it.
- Foreign keys.
- Indexes on report status.
- Indexes on user ID.
- Indexes on week dates.
- Index on project relations.

## Transaction Rule

Use database transactions when:

- Creating a submission version and changing report status.
- Requesting changes and storing a review.
- Approving and storing a review.

These operations must succeed or fail together.
