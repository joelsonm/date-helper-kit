import { describe, it, expect } from "vitest";
import { joinDateAndTime } from "../src/helpers";

describe("Date merge", () => {
  it("merge date + time", () => {
    expect(
      joinDateAndTime("2025-06-01", "00:00:00-03:00", "America/Sao_Paulo")
    ).toBe("2025-06-01T00:00:00-03:00");
  });
  it("merge date + time", () => {
    expect(joinDateAndTime("2025-06-01", "00:00:00", "UTC")).toBe(
      "2025-06-01T00:00:00+00:00"
    );
  });
  it("merge full date + time", () => {
    expect(joinDateAndTime("2025-06-01T20:15:15", "18:30:40", "UTC")).toBe(
      "2025-06-01T18:30:40+00:00"
    );
  });
  it("merge full date + time + timezone", () => {
    expect(
      joinDateAndTime("2025-06-01T20:15:15", "18:30:40", "America/Sao_Paulo")
    ).toBe("2025-06-01T18:30:40-03:00");
  });

  it("merge date + time with positive offset", () => {
    expect(
      joinDateAndTime("2025-12-25", "08:30:00+05:00", "Asia/Karachi")
    ).toBe("2025-12-25T08:30:00+05:00");
  });

  it("merge date + time with no timezone argument (should default to UTC)", () => {
    expect(joinDateAndTime("2025-06-01", "12:00:00")).toBe(
      "2025-06-01T12:00:00+00:00"
    );
  });

  it("merge date + time with milliseconds", () => {
    expect(joinDateAndTime("2025-06-01", "23:59:59.999", "UTC")).toBe(
      "2025-06-01T23:59:59.999+00:00"
    );
  });

  it("merge date + time with Zulu time", () => {
    expect(joinDateAndTime("2025-06-01", "15:00:00Z", "UTC")).toBe(
      "2025-06-01T15:00:00+00:00"
    );
  });

  it("merge date + time with invalid time string", () => {
    expect(() =>
      joinDateAndTime("2025-06-01", "invalid-time", "UTC")
    ).toThrow();
  });

  it("merge date + time with invalid date string", () => {
    expect(() => joinDateAndTime("invalid-date", "12:00:00", "UTC")).toThrow();
  });

  it("merge date + time with empty strings", () => {
    expect(() => joinDateAndTime("", "", "UTC")).toThrow();
  });

  it("merge date + time with time only (should throw)", () => {
    expect(() => joinDateAndTime("", "12:00:00", "UTC")).toThrow();
  });

  it("merge date + time with date only (should throw)", () => {
    expect(() => joinDateAndTime("2025-06-01", "", "UTC")).toThrow();
  });

  it("merge date + time with timezone as offset string", () => {
    expect(joinDateAndTime("2025-06-01", "10:00:00", "+02:00")).toBe(
      "2025-06-01T10:00:00+02:00"
    );
  });

  it("merge date + time with timezone", () => {
    expect(joinDateAndTime("2025-06-01", "10:00:00-03:00")).toBe(
      "2025-06-01T10:00:00-03:00"
    );
  });

  it("merge date + time with timezone", () => {
    expect(joinDateAndTime("2025-06-01", "10:00-04")).toBe(
      "2025-06-01T10:00:00-04:00"
    );
  });

  it("merge object date + time with timezone", () => {
    expect(joinDateAndTime(new Date("2025-06-01"), "10:00-04")).toBe(
      "2025-06-01T10:00:00-04:00"
    );
  });

  it("merge object date + time with timezone", () => {
    const time = new Date();
    time.setHours(10, 0, 0, 0);
    expect(
      joinDateAndTime(new Date("2025-06-01"), time, "America/Sao_Paulo")
    ).toBe("2025-06-01T10:00:00-03:00");
  });
});
