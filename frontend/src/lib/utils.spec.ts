import { describe, expect, it } from "vitest";
import {
  cn,
  formatDate,
  formatDateTime,
  formatMinutes,
  getErrorMessage,
  getWeekRange,
} from "./utils";

describe("presentation utilities", () => {
  it("merges conditional Tailwind classes predictably", () => {
    expect(cn("px-2 text-slate-500", false && "hidden", "px-4")).toBe(
      "text-slate-500 px-4",
    );
  });

  it("formats dates in UTC so calendar dates do not shift by browser timezone", () => {
    expect(formatDate("2026-08-31T23:30:00-07:00")).toBe("Sep 1, 2026");
    expect(formatDateTime("2026-08-31T12:05:00Z")).toMatch(
      /Aug 31, 2026.*12:05.*UTC/,
    );
  });

  it.each([
    [0, "0m"],
    [45, "45m"],
    [60, "1h"],
    [135, "2h 15m"],
  ])("formats %i minutes as %s", (minutes, expected) => {
    expect(formatMinutes(minutes)).toBe(expected);
  });

  it("returns the full Monday-to-Sunday range for weekdays and Sundays", () => {
    const mondayRange = getWeekRange(new Date("2026-08-31T10:00:00"));
    const sundayRange = getWeekRange(new Date("2026-09-06T10:00:00"));

    expect(mondayRange.start).toEqual(new Date("2026-08-31T00:00:00"));
    expect(mondayRange.end).toEqual(new Date("2026-09-06T23:59:59.999"));
    expect(sundayRange).toEqual(mondayRange);
  });

  it("uses a safe API message and falls back for unknown errors", () => {
    expect(
      getErrorMessage(
        { response: { data: { message: "A report already exists." } } },
        "Try again.",
      ),
    ).toBe("A report already exists.");
    expect(getErrorMessage(new Error("Network unavailable"), "Try again.")).toBe(
      "Network unavailable",
    );
    expect(getErrorMessage({ response: { data: { message: 42 } } }, "Try again.")).toBe(
      "Try again.",
    );
  });
});
