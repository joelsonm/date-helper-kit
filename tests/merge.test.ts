import { describe, it, expect } from "vitest";
import { joinDateAndTime } from "../src/helpers";

describe("Date merge", () => {
  it("should merge date and time with explicit negative offset and timezone", () => {
    expect(
      joinDateAndTime("2025-06-01", "00:00:00-03:00", "America/Sao_Paulo")
    ).toBe("2025-06-01T00:00:00-03:00");
  });

  it("should merge date and time in UTC when no offset is provided", () => {
    expect(joinDateAndTime("2025-06-01", "00:00:00", "UTC")).toBe(
      "2025-06-01T00:00:00+00:00"
    );
  });

  it("should replace time in full ISO date with new time in UTC", () => {
    expect(joinDateAndTime("2025-06-01T20:15:15", "18:30:40", "UTC")).toBe(
      "2025-06-01T18:30:40+00:00"
    );
  });

  it("should replace time in full ISO date with new time and timezone", () => {
    expect(
      joinDateAndTime("2025-06-01T20:15:15", "18:30:40", "America/Sao_Paulo")
    ).toBe("2025-06-01T18:30:40-03:00");
  });

  it("should merge date and time with positive offset and respect timezone", () => {
    expect(
      joinDateAndTime("2025-12-25", "08:30:00+05:00", "Asia/Karachi")
    ).toBe("2025-12-25T08:30:00+05:00");
  });

  it("should default to UTC when timezone argument is omitted", () => {
    expect(joinDateAndTime("2025-06-01", "12:00:00")).toBe(
      "2025-06-01T12:00:00+00:00"
    );
  });

  it("should merge date and time including milliseconds in UTC", () => {
    expect(joinDateAndTime("2025-06-01", "23:59:59.999", "UTC")).toBe(
      "2025-06-01T23:59:59.999+00:00"
    );
  });

  it("should merge date and time when time uses Zulu (UTC) notation", () => {
    expect(joinDateAndTime("2025-06-01", "15:00:00Z", "UTC")).toBe(
      "2025-06-01T15:00:00+00:00"
    );
  });

  it("should throw when time string is invalid", () => {
    expect(() =>
      joinDateAndTime("2025-06-01", "invalid-time", "UTC")
    ).toThrow();
  });

  it("should throw when date string is invalid", () => {
    expect(() => joinDateAndTime("invalid-date", "12:00:00", "UTC")).toThrow();
  });

  it("should throw when both date and time strings are empty", () => {
    expect(() => joinDateAndTime("", "", "UTC")).toThrow();
  });

  it("should throw when only time is provided", () => {
    expect(() => joinDateAndTime("", "12:00:00", "UTC")).toThrow();
  });

  it("should throw when only date is provided", () => {
    expect(() => joinDateAndTime("2025-06-01", "", "UTC")).toThrow();
  });

  it("should merge date and time using offset string as timezone", () => {
    expect(joinDateAndTime("2025-06-01", "10:00:00", "+02:00")).toBe(
      "2025-06-01T10:00:00+02:00"
    );
  });

  it("should merge date and time when time string includes offset", () => {
    expect(joinDateAndTime("2025-06-01", "10:00:00-03:00")).toBe(
      "2025-06-01T10:00:00-03:00"
    );
  });

  it("should merge date and time when time string uses short offset format", () => {
    expect(joinDateAndTime("2025-06-01", "10:00-04")).toBe(
      "2025-06-01T10:00:00-04:00"
    );
  });

  it("should merge date and time with negative offset and respect timezone", () => {
    expect(
      joinDateAndTime("2025-06-01", "00:00:00-03:00", "America/Sao_Paulo")
    ).toBe("2025-06-01T00:00:00-03:00");
  });

  it("should merge date and time in UTC when explicitly provided", () => {
    expect(joinDateAndTime("2025-06-01", "00:00:00", "UTC")).toBe(
      "2025-06-01T00:00:00+00:00"
    );
  });

  it("should replace time in full ISO date with new time in UTC", () => {
    expect(joinDateAndTime("2025-06-01T20:15:15", "18:30:40", "UTC")).toBe(
      "2025-06-01T18:30:40+00:00"
    );
  });

  it("should replace time in full ISO date with new time and Sao Paulo timezone", () => {
    expect(
      joinDateAndTime("2025-06-01T20:15:15", "18:30:40", "America/Sao_Paulo")
    ).toBe("2025-06-01T18:30:40-03:00");
  });

  it("should merge date and time with positive offset and respect Karachi timezone", () => {
    expect(
      joinDateAndTime("2025-12-25", "08:30:00+05:00", "Asia/Karachi")
    ).toBe("2025-12-25T08:30:00+05:00");
  });

  it("should default to UTC when timezone argument is omitted", () => {
    expect(joinDateAndTime("2025-06-01", "12:00:00")).toBe(
      "2025-06-01T12:00:00+00:00"
    );
  });

  it("should merge date and time including milliseconds in UTC", () => {
    expect(joinDateAndTime("2025-06-01", "23:59:59.999", "UTC")).toBe(
      "2025-06-01T23:59:59.999+00:00"
    );
  });

  it("should merge date and time when time string uses Zulu (UTC) notation", () => {
    expect(joinDateAndTime("2025-06-01", "15:00:00Z", "UTC")).toBe(
      "2025-06-01T15:00:00+00:00"
    );
  });

  it("should throw when time string is invalid", () => {
    expect(() =>
      joinDateAndTime("2025-06-01", "invalid-time", "UTC")
    ).toThrow();
  });

  it("should throw when date string is invalid", () => {
    expect(() => joinDateAndTime("invalid-date", "12:00:00", "UTC")).toThrow();
  });

  it("should throw when both date and time strings are empty", () => {
    expect(() => joinDateAndTime("", "", "UTC")).toThrow();
  });

  it("should throw when only time is provided", () => {
    expect(() => joinDateAndTime("", "12:00:00", "UTC")).toThrow();
  });

  it("should throw when only date is provided", () => {
    expect(() => joinDateAndTime("2025-06-01", "", "UTC")).toThrow();
  });

  it("should merge date and time using offset string as timezone", () => {
    expect(joinDateAndTime("2025-06-01", "10:00:00", "+02:00")).toBe(
      "2025-06-01T10:00:00+02:00"
    );
  });

  it("should merge date and time when time string includes offset", () => {
    expect(joinDateAndTime("2025-06-01", "10:00:00-03:00")).toBe(
      "2025-06-01T10:00:00-03:00"
    );
  });

  it("should merge date and time when time string uses short offset format", () => {
    expect(joinDateAndTime("2025-06-01", "10:00-04")).toBe(
      "2025-06-01T10:00:00-04:00"
    );
  });

  it("should merge Date object and time string with offset", () => {
    expect(joinDateAndTime(new Date("2025-06-01"), "10:00-04")).toBe(
      "2025-06-01T10:00:00-04:00"
    );
  });

  it("should merge Date objects for date and time, using timezone", () => {
    const time = new Date();
    time.setHours(10, 0, 0, 0);
    expect(
      joinDateAndTime(new Date("2025-06-01"), time, "America/Sao_Paulo")
    ).toBe("2025-06-01T10:00:00-03:00");
  });
});
