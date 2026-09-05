import { z } from "zod";
import { REPORT_SETTINGS, VALIDATION_SETTINGS } from "@/lib/settings";

const taskSchema = z.object({
  taskName: z
    .string()
    .trim()
    .min(VALIDATION_SETTINGS.taskName.min, "Task name is required")
    .max(VALIDATION_SETTINGS.taskName.max),
  priority: z
    .enum(REPORT_SETTINGS.taskPriorities)
    .default(REPORT_SETTINGS.defaultTaskPriority),
  plannedPercentage: z
    .number()
    .int()
    .min(VALIDATION_SETTINGS.percentage.min)
    .max(VALIDATION_SETTINGS.percentage.max)
    .default(REPORT_SETTINGS.defaultNumericValue),
  actualPercentage: z
    .number()
    .int()
    .min(VALIDATION_SETTINGS.percentage.min)
    .max(VALIDATION_SETTINGS.percentage.max)
    .default(REPORT_SETTINGS.defaultNumericValue),
  status: z
    .enum(REPORT_SETTINGS.taskStatuses)
    .default(REPORT_SETTINGS.defaultTaskStatus),
  plannedMinutes: z
    .number()
    .int()
    .min(VALIDATION_SETTINGS.minutes.min)
    .max(VALIDATION_SETTINGS.minutes.max)
    .default(REPORT_SETTINGS.defaultNumericValue),
  actualMinutes: z
    .number()
    .int()
    .min(VALIDATION_SETTINGS.sortOrder.min)
    .max(VALIDATION_SETTINGS.minutes.max)
    .default(REPORT_SETTINGS.defaultNumericValue),
  deliverable: z.string().max(VALIDATION_SETTINGS.description.max).optional(),
});

const nextWeekTaskSchema = z.object({
  description: z
    .string()
    .trim()
    .min(VALIDATION_SETTINGS.description.min, "Description is required")
    .max(VALIDATION_SETTINGS.description.max),
  sortOrder: z
    .number()
    .int()
    .min(VALIDATION_SETTINGS.minutes.min)
    .default(REPORT_SETTINGS.defaultNumericValue),
});

const blockerSchema = z.object({
  description: z
    .string()
    .trim()
    .min(VALIDATION_SETTINGS.description.min, "Description is required")
    .max(VALIDATION_SETTINGS.description.max),
  isKeyIssue: z.boolean().default(false),
  isResolved: z.boolean().default(false),
});

const achievementSchema = z.object({
  description: z
    .string()
    .trim()
    .min(VALIDATION_SETTINGS.description.min, "Description is required")
    .max(VALIDATION_SETTINGS.description.max),
  isKeyAchievement: z.boolean().default(false),
});

const workHourSchema = z.object({
  type: z.enum(REPORT_SETTINGS.workHourTypes),
  minutes: z
    .number()
    .int()
    .min(VALIDATION_SETTINGS.minutes.min)
    .max(VALIDATION_SETTINGS.minutes.max),
});

export const reportFormSchema = z
  .object({
    projectId: z.string().nullable().optional(),
    weekStart: z
      .string()
      .trim()
      .min(VALIDATION_SETTINGS.requiredText.min, "Week start is required"),
    weekEnd: z
      .string()
      .trim()
      .min(VALIDATION_SETTINGS.requiredText.min, "Week end is required"),
    notes: z.string().max(VALIDATION_SETTINGS.reportNotes.max).optional(),
    tasks: z.array(taskSchema).max(REPORT_SETTINGS.maxItemsPerSection).default([]),
    nextWeekTasks: z.array(nextWeekTaskSchema).max(REPORT_SETTINGS.maxItemsPerSection).default([]),
    blockers: z.array(blockerSchema).max(REPORT_SETTINGS.maxItemsPerSection).default([]),
    achievements: z.array(achievementSchema).max(REPORT_SETTINGS.maxItemsPerSection).default([]),
    workHours: z.array(workHourSchema).max(REPORT_SETTINGS.maxItemsPerSection).default([]),
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
