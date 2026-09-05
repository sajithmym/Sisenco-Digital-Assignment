export function reportWeek(value: string | Date = new Date()) {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  const end = new Date(date.getTime() + 6 * 86400000);
  return {
    weekStart: date.toISOString().slice(0, 10),
    weekEnd: end.toISOString().slice(0, 10),
  };
}
