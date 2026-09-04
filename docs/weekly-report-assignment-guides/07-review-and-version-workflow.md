# 07 — Review and Version Workflow

## Why This Is Important

This is one of the main assignment evaluation areas.

## State Rules

### Draft → Submitted

Allowed actor:

```text
TEAM_MEMBER owner
```

Actions:

1. Validate report completeness.
2. Create immutable report version snapshot.
3. Increment version number.
4. Set report status to SUBMITTED.
5. Save submitted timestamp.

### Submitted → Needs Correction

Allowed actor:

```text
MANAGER / ADMIN
```

Requirements:

- Comment is mandatory.
- Review references the exact submitted report version.

Actions:

1. Create review record.
2. Change status to NEEDS_CORRECTION.

### Needs Correction → Submitted

Allowed actor:

```text
TEAM_MEMBER owner
```

Actions:

1. Edit current report.
2. Create a new immutable version.
3. Increment version number.
4. Change status to SUBMITTED.

### Submitted → Approved

Allowed actor:

```text
MANAGER / ADMIN
```

Actions:

1. Create approval review record.
2. Set status to APPROVED.
3. Save approved timestamp.

## Version Snapshot

Recommended snapshot contains:

```text
report metadata
projects
tasks
next week tasks
blockers
achievements
work hours
notes
```

## Important Rule

Do not reconstruct old versions from current tables.

Old versions must remain unchanged.

## UI

Manager review page should show:

- Current submitted version.
- Previous versions.
- Submission timestamps.
- Review comment linked to each version.
- Approve button.
- Request Changes action.
