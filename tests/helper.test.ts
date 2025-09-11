import { getDate, getTime } from "../src";
import { describe, it, expect } from "vitest";

describe("Date Helpers", () => {
  it("get full date + time + timezone", () => {
    expect(getDate("2025-06-01T00:00:00-03:00")).toBe("2025-06-01");
  });
  it("get full date + time", () => {
    expect(getDate("2025-06-01T00:00:00")).toBe("2025-06-01");
  });
  it("get full date + time + timezone date", () => {
    expect(getDate("2025-06-01T00:00:00-00:00", "America/Sao_Paulo")).toBe(
      "2025-06-01"
    );
  });
  it("get time", () => {
    expect(getTime("2025-12-12T00:00:00-03:00")).toBe("00:00:00");
  });
  it("get only time", () => {
    expect(getTime("09:10:00-03")).toBe("09:10:00");
  });
  it("get time + timezone", () => {
    const date = new Date("2025-12-12T00:00:00-03:00");
    date.setHours(5);
    expect(getTime(date, "America/Sao_Paulo")).toBe("05:00:00");
  });

  // Additional tests
  it("getDate with only date string", () => {
    expect(getDate("2025-07-15")).toBe("2025-07-15");
  });

  it("getDate with invalid date string", () => {
    expect(() => getDate("invalid-date")).toThrow();
  });

  it("getDate with Date object", () => {
    const date = new Date("2025-08-20T10:30:00Z");
    expect(getDate(date)).toBe("2025-08-20");
  });

  it("getTime with only time", () => {
    expect(getTime("2025-12-12T23:59:59")).toBe("23:59:59");
  });

  it("getTime with Date object and timezone", () => {
    const date = new Date("2025-12-12T12:34:56Z");
    expect(getTime(date, "UTC")).toBe("12:34:56");
  });

  it("getTime with invalid date string", () => {
    expect(() => getTime("not-a-date")).toThrow();
  });

  it("getDate with leap year date", () => {
    expect(getDate("2024-02-29T12:00:00Z")).toBe("2024-02-29");
  });

  it("getTime with midnight", () => {
    expect(getTime("2025-01-01T00:00:00Z")).toBe("00:00:00");
  });

  it("getDate with timezone offset crossing day", () => {
    expect(getDate("2025-01-01T23:00:00-02:00", "UTC")).toBe("2025-01-02");
  });
});
