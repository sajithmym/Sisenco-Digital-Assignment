import { BadRequestException } from "@nestjs/common";

export const DAY_MS = 86_400_000;

/** Reporting dates are calendar dates in UTC; every report covers Monday-Sunday. */
export function weekOf(value: Date | string = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()))
    throw new BadRequestException("Invalid reporting date.");
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date;
}

export function validateReportWeek(start: Date, end: Date) {
  if (
    start.getTime() !== weekOf(start).getTime() ||
    end.getTime() !== start.getTime() + 6 * DAY_MS
  ) {
    throw new BadRequestException(
      "Reports must cover Monday through Sunday using date-only values.",
    );
  }
}

export function selectedWeeks(start?: string, end?: string) {
  const first = weekOf(start || end || new Date());
  const last = weekOf(end || start || new Date());
  if (last < first || (last.getTime() - first.getTime()) / (7 * DAY_MS) > 51) {
    throw new BadRequestException(
      "Choose an ordered reporting range of at most 52 weeks.",
    );
  }
  const weeks: Date[] = [];
  for (let time = first.getTime(); time <= last.getTime(); time += 7 * DAY_MS)
    weeks.push(new Date(time));
  return {
    first,
    last,
    endExclusive: new Date(last.getTime() + 7 * DAY_MS),
    weeks,
  };
}
