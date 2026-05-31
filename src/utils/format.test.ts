import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatSignedCurrency,
  formatPercent,
  formatCompactCurrency,
  formatNumber,
} from "@/utils/format";

describe("formatCurrency", () => {
  it("uses Indian (lakh) grouping and the ₹ symbol", () => {
    const out = formatCurrency(123456);
    expect(out).toContain("₹");
    expect(out).toContain("1,23,456");
  });
  it("renders an em-dash for nullish/NaN", () => {
    expect(formatCurrency(null)).toBe("—");
    expect(formatCurrency(undefined)).toBe("—");
    expect(formatCurrency(NaN)).toBe("—");
  });
});

describe("formatSignedCurrency", () => {
  it("prefixes a sign", () => {
    expect(formatSignedCurrency(500)).toMatch(/^\+₹/);
    expect(formatSignedCurrency(-500)).toMatch(/^-₹/);
  });
});

describe("formatPercent", () => {
  it("defaults to one decimal", () => {
    expect(formatPercent(12.345)).toBe("12.3%");
  });
  it("adds a + sign for positive when signed", () => {
    expect(formatPercent(12.3, { signed: true })).toBe("+12.3%");
    expect(formatPercent(-12.3, { signed: true })).toBe("-12.3%");
  });
  it("renders an em-dash for nullish", () => {
    expect(formatPercent(null)).toBe("—");
  });
});

describe("formatCompactCurrency", () => {
  it("uses crore for >= 1e7", () => {
    expect(formatCompactCurrency(12345678)).toBe("₹1.23Cr");
  });
  it("uses lakh for >= 1e5", () => {
    expect(formatCompactCurrency(150000)).toBe("₹1.50L");
  });
  it("uses K for >= 1e3", () => {
    expect(formatCompactCurrency(1500)).toBe("₹1.5K");
  });
  it("handles negatives", () => {
    expect(formatCompactCurrency(-150000)).toBe("-₹1.50L");
  });
});

describe("formatNumber", () => {
  it("groups thousands", () => {
    expect(formatNumber(1234567)).toContain("12,34,567");
  });
});
