import { z } from "zod";
import { VALIDATION_SETTINGS } from "@/lib/settings";

const taskSchema = z.object({
  taskName: z.string().min(1, "Task name is required").max(VALIDATION_SETTINGS.taskName.max),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  plannedPercentage: z.number().min(VALIDATION_SETTINGS.percentage.min).max(VALIDATION_SETTINGS.percentage.max).default(0),
  actualPercentage: z.number().min(VALIDATION_SETTINGS.percentage.min).max(VALIDATION_SETTINGS.percentage.max).default(0),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "BLOCKED"]).default("TODO"),
  plannedMinutes: z.number().min(VALIDATION_SETTINGS.minutes.min).default(0),
  actualMinutes: z.number().min(VALIDATION_SETTINGS.minutes.min).default(0),
  deliverable: z.string().max(VALIDATION_SETTINGS.description.max).optional(),
});

const nextWeekTaskSchema = z.object({
  description: z.string().min(1, "Description is required").max(VALIDATION_SETTINGS.description.max),
  sortOrder: z.number().min(0).default(0),
});

const blockerSchema = z.object({
  description: z.string().min(1, "Description is required").max(VALIDATION_SETTINGS.description.max),
  isKeyIssue: z.boolean().default(false),
  isResolved: z.boolean().default(false),
});

const achievementSchema = z.object({
  description: z.string().min(1, "Description is required").max(VALIDATION_SETTINGS.description.max),
  isKeyAchievement: z.boolean().default(false),
});

const workHourSchema = z.object({
  type: z.enum(["DEVELOPMENT", "TESTING", "MEETINGS", "DOCUMENTATION", "OTHER"]),
  minutes: z.number().min(0),
});

export const reportFormSchema = z
  .object({
    projectId: z.string().optional(),
    weekStart: z.string().min(1, "Week start is required"),
    weekEnd: z.string().min(1, "Week end is required"),
    notes: z.string().max(VALIDATION_SETTINGS.reportNotes.max).optional(),
    tasks: z.array(taskSchema).default([]),
    nextWeekTasks: z.array(nextWeekTaskSchema).default([]),
    blockers: z.array(blockerSchema).default([]),
    achievements: z.array(achievementSchema).default([]),
    workHours: z.array(workHourSchema).default([]),
  })
  .refine(
    (data) => {
      if (data.weekStart && data.weekEnd) {
        return new Date(data.weekEnd) >= new Date(data.weekStart);
      }
      return true;
    },
    {
      message: "Week end must be after or equal to week start",
      path: ["weekEnd"],
    }
  );

export type ReportFormData = z.infer<typeof reportFormSchema>;
