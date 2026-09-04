# 01 — Complete Weekly Report Form

## Goal
Replace the current minimal Week Start + Week End + Notes form with the full fixed report structure.

## Required sections
### Week information
- `weekStart`
- `weekEnd`
- `projectId`

### Completed tasks
Each row:
- `taskName`
- `priority`
- `plannedPercentage`
- `actualPercentage`
- `status`
- `plannedMinutes`
- `actualMinutes`
- `deliverable`

Suggested enums:
```text
Priority: LOW | MEDIUM | HIGH | CRITICAL
Status: NOT_STARTED | IN_PROGRESS | COMPLETED | BLOCKED
```

### Next-week tasks
- `description`
- `sortOrder`

### Blockers
- `description`
- `isKeyIssue`
- optional `isResolved`

Only one blocker should be marked as the key issue.

### Achievements
- `description`
- `isKeyAchievement`

Only one achievement should be marked as the key achievement.

### Work hours
Use:
```text
DEVELOPMENT
TESTING
MEETINGS
DOCUMENTATION
OTHER
```
Store time as integer minutes.

### Notes / links
- `notes`
- validated links if supported

## Component structure
```text
WeeklyReportForm
├── WeekInformationSection
├── CompletedTasksSection
├── NextWeekTasksSection
├── BlockersSection
├── AchievementsSection
├── WorkHoursSection
└── NotesSection
```

## Rules
- Frontend: React Hook Form + Zod.
- Backend: DTO validation with `class-validator`.
- Keep enums/options in constant files.
- Do not duplicate form rules across components.

## Done
- [ ] Project/category field
- [ ] Completed task table
- [ ] Next-week tasks
- [ ] Blockers + key issue
- [ ] Achievements + key achievement
- [ ] Work-hour breakdown
- [ ] Notes/links
- [ ] Responsive validation
