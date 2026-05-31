import { describe, it, expect } from "vitest";
import {
  toMonthKey,
  monthRange,
  lastMonthKeys,
  formatMonthLabel,
  formatDate,
} from "@/utils/date";

describe("toMonthKey", () => {
  it("formats a date as YYYY-MM", () => {
    // Month is 0-indexed: 4 = May.
    expect(toMonthKey(new Date(2026, 4, 15))).toBe("2026-05");
  });
});

describe("monthRange", () => {
  it("returns inclusive first/last day of the month", () => {
    expect(monthRange("2026-05")).toEqual({
      start: "2026-05-01",
      end: "2026-05-31",
    });
  });
  it("handles February correctly", () => {
    expect(monthRange("2026-02").end).toBe("2026-02-28");
  });
});

describe("lastMonthKeys", () => {
  it("returns N month keys ending at the given month, oldest first", () => {
    expect(lastMonthKeys(3, "2026-05")).toEqual([
      "2026-03",
      "2026-04",
      "2026-05",
    ]);
  });
  it("crosses the year boundary", () => {
    expect(lastMonthKeys(3, "2026-01")).toEqual([
      "2025-11",
      "2025-12",
      "2026-01",
    ]);
  });
});

describe("formatMonthLabel", () => {
  it("renders a human label", () => {
    expect(formatMonthLabel("2026-05")).toBe("May 2026");
  });
});

describe("formatDate", () => {
  it("renders dd MMM yyyy", () => {
    expect(formatDate("2026-05-31")).toBe("31 May 2026");
  });
  it("renders an em-dash for nullish", () => {
    expect(formatDate(null)).toBe("—");
  });
});
