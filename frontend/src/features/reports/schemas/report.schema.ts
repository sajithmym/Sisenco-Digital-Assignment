import { z } from "zod";
import { VALIDATION_SETTINGS } from "@/lib/settings";

const taskSchema = z.object({
  taskName: z
    .string()
    .trim()
    .min(1, "Task name is required")
    .max(VALIDATION_SETTINGS.taskName.max),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  plannedPercentage: z
    .number()
    .int()
    .min(VALIDATION_SETTINGS.percentage.min)
    .max(VALIDATION_SETTINGS.percentage.max)
    .default(0),
  actualPercentage: z
    .number()
    .int()
    .min(VALIDATION_SETTINGS.percentage.min)
    .max(VALIDATION_SETTINGS.percentage.max)
    .default(0),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "BLOCKED"]).default("TODO"),
  plannedMinutes: z
    .number()
    .int()
    .min(VALIDATION_SETTINGS.minutes.min)
    .max(10080)
    .default(0),
  actualMinutes: z
    .number()
    .int()
    .min(VALIDATION_SETTINGS.minutes.min)
    .max(10080)
    .default(0),
  deliverable: z.string().max(VALIDATION_SETTINGS.description.max).optional(),
});

const nextWeekTaskSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(VALIDATION_SETTINGS.description.max),
  sortOrder: z.number().int().min(0).default(0),
});

const blockerSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(VALIDATION_SETTINGS.description.max),
  isKeyIssue: z.boolean().default(false),
  isResolved: z.boolean().default(false),
});

const achievementSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(VALIDATION_SETTINGS.description.max),
  isKeyAchievement: z.boolean().default(false),
});

const workHourSchema = z.object({
  type: z.enum([
    "DEVELOPMENT",
    "TESTING",
    "MEETINGS",
    "DOCUMENTATION",
    "OTHER",
  ]),
  minutes: z.number().int().min(0).max(10080),
});

export const reportFormSchema = z
  .object({
    projectId: z.string().nullable().optional(),
    weekStart: z.string().trim().min(1, "Week start is required"),
    weekEnd: z.string().trim().min(1, "Week end is required"),
    notes: z.string().max(VALIDATION_SETTINGS.reportNotes.max).optional(),
    tasks: z.array(taskSchema).max(50).default([]),
    nextWeekTasks: z.array(nextWeekTaskSchema).max(50).default([]),
    blockers: z.array(blockerSchema).max(50).default([]),
    achievements: z.array(achievementSchema).max(50).default([]),
    workHours: z.array(workHourSchema).max(50).default([]),
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
    },
  );

export type ReportFormData = z.infer<typeof reportFormSchema>;
