import { REPORT_SETTINGS } from "@/lib/settings";

export function reportWeek(value: string | Date = new Date()) {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  const end = new Date(
    date.getTime() +
      REPORT_SETTINGS.calendar.finalDayOffset *
        REPORT_SETTINGS.calendar.millisecondsPerDay,
  );
  return {
    weekStart: date.toISOString().slice(0, 10),
    weekEnd: end.toISOString().slice(0, 10),
  };
}
