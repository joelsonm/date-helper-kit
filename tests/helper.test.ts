import { getDate, getTime } from "../src";
import { describe, it, expect } from "vitest";

describe("Date Helper Kit", () => {
  it("extracts date from ISO string with timezone offset", () => {
    expect(getDate("2025-06-01T00:00:00-03:00")).toBe("2025-06-01");
  });
  it("extracts date from ISO string without timezone", () => {
    expect(getDate("2025-06-01T00:00:00")).toBe("2025-06-01");
  });
  it("extracts date from ISO string with UTC offset and converts to specified timezone", () => {
    expect(getDate("2025-06-01T00:00:00-00:00", "America/Sao_Paulo")).toBe(
      "2025-06-01"
    );
  });
  it("extracts time from ISO string with timezone offset", () => {
    expect(getTime("2025-12-12T00:00:00-03:00")).toBe("00:00:00");
  });
  it("extracts time from time string with offset", () => {
    expect(getTime("09:10:00-03")).toBe("09:10:00");
  });
  it("extracts time from Date object and converts to specified IANA timezone", () => {
    const date = new Date("2025-12-12T00:00:00Z");
    expect(getTime(date, "America/Sao_Paulo")).toBe("21:00:00");
  });
  it("extracts time from Date object and converts to fixed offset timezone", () => {
    const date = new Date("2025-12-12T00:00:00Z");
    expect(getTime(date, "+02:00")).toBe("02:00:00");
  });
  it("extracts time from UTC string and converts to specified timezone", () => {
    expect(getTime("2025-09-12T16:08:00.000Z", "America/Sao_Paulo")).toBe(
      "13:08:00"
    );
  });

  it("extracts time from UTC string using system timezone by default", () => {
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: localTz,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(new Date("2025-09-12T16:08:00.000Z"));
    const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
    const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
    const ss = parts.find((p) => p.type === "second")?.value ?? "00";
    expect(getTime("2025-09-12T16:08:00.000Z")).toBe(`${hh}:${mm}:${ss}`);
  });

  // Additional tests
  it("extracts date from date-only string", () => {
    expect(getDate("2025-07-15")).toBe("2025-07-15");
  });

  it("throws error for invalid date string in getDate", () => {
    expect(() => getDate("invalid-date")).toThrow();
  });

  it("extracts date from Date object", () => {
    const date = new Date("2025-08-20T10:30:00Z");
    expect(getDate(date)).toBe("2025-08-20");
  });

  it("extracts time from ISO string without timezone", () => {
    expect(getTime("2025-12-12T23:59:59")).toBe("23:59:59");
  });

  it("extracts time from Date object in UTC timezone", () => {
    const date = new Date("2025-12-12T12:34:56Z");
    expect(getTime(date, "UTC")).toBe("12:34:56");
  });

  it("throws error for invalid date string in getTime", () => {
    expect(() => getTime("not-a-date")).toThrow();
  });

  it("extracts date from leap year date", () => {
    expect(getDate("2024-02-29T12:00:00Z")).toBe("2024-02-29");
  });

  it("extracts midnight time from ISO string using system timezone by default", () => {
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: localTz,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(new Date("2025-01-01T00:00:00Z"));
    const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
    const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
    const ss = parts.find((p) => p.type === "second")?.value ?? "00";
    expect(getTime("2025-01-01T00:00:00Z")).toBe(`${hh}:${mm}:${ss}`);
  });

  it("extracts date correctly when timezone offset causes day rollover", () => {
    expect(getDate("2025-01-01T23:00:00-02:00", "UTC")).toBe("2025-01-02");
  });
});
