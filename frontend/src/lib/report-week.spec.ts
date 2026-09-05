import { describe, expect, it } from "vitest";
import { reportWeek } from "./report-week";

describe("reportWeek", () => {
  it.each([
    ["2026-08-31", { weekStart: "2026-08-31", weekEnd: "2026-09-06" }],
    ["2026-09-06", { weekStart: "2026-08-31", weekEnd: "2026-09-06" }],
    ["2027-01-01", { weekStart: "2026-12-28", weekEnd: "2027-01-03" }],
  ])("normalizes %s to its Monday-Sunday reporting week", (date, expected) => {
    expect(reportWeek(date)).toEqual(expected);
  });
});
