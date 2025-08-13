import { appendOffset } from "../src";
import { describe, it, expect } from "vitest";

describe("Date Append Offset", () => {
  it("preserves explicit offset if already present", () => {
    expect(appendOffset("2025-06-01T00:00:00-03:00", "America/Manaus")).toBe(
      "2025-06-01T00:00:00-03:00"
    );
  });

  it("converts Z suffix to +00:00 and keeps milliseconds", () => {
    expect(appendOffset("2025-06-12T15:55:52.323Z", "America/Manaus")).toBe(
      "2025-06-12T15:55:52.323+00:00"
    );
  });

  it("appends +00:00 offset for UTC timezone", () => {
    expect(appendOffset("2025-06-01T00:45:00", "UTC")).toBe(
      "2025-06-01T00:45:00+00:00"
    );
  });

  it("appends -03:00 offset when input has no time", () => {
    expect(appendOffset("2025-06-12", "America/Sao_Paulo")).toBe(
      "2025-06-12T00:00:00-03:00"
    );
  });

  it("adds seconds when missing and applies -03:00 offset", () => {
    expect(appendOffset("2025-06-12T12:00:00", "America/Sao_Paulo")).toBe(
      "2025-06-12T12:00:00-03:00"
    );

    expect(appendOffset("2025-06-12T12:00:0", "America/Sao_Paulo")).toBe(
      "2025-06-12T12:00:00-03:00"
    );

    expect(appendOffset("2025-06-01T00:00", "America/Sao_Paulo")).toBe(
      "2025-06-01T00:00:00-03:00"
    );

    expect(appendOffset("2024-12-16", "America/Sao_Paulo")).toBe(
      "2024-12-16T00:00:00-03:00"
    );

    expect(appendOffset("2025-06-01T00:34", "America/Sao_Paulo")).toBe(
      "2025-06-01T00:34:00-03:00"
    );
  });

  it("pads single-digit seconds and applies -04:00 for Manaus", () => {
    expect(appendOffset("2025-06-01T00:00:1", "America/Manaus")).toBe(
      "2025-06-01T00:00:01-04:00"
    );

    expect(appendOffset("2025-06-01T00:00:12", "America/Manaus")).toBe(
      "2025-06-01T00:00:12-04:00"
    );
  });

  it("ignores timezone if offset is already in input", () => {
    expect(appendOffset("2025-06-01T00:00:12-03:00", "America/Manaus")).toBe(
      "2025-06-01T00:00:12-03:00"
    );
  });

  it("adds offset when milliseconds are present without Z", () => {
    expect(appendOffset("2025-06-12T15:55:52.322", "America/Manaus")).toBe(
      "2025-06-12T15:55:52.322-04:00"
    );
  });

  it("throws on invalid ISO format (wrong separator)", () => {
    expect(() => appendOffset("2025/06/01", "America/Sao_Paulo")).toThrow();
  });

  it("throws on missing date part (just time)", () => {
    expect(() => appendOffset("12:00", "America/Sao_Paulo")).toThrow();
  });

  it("throws on invalid month (13)", () => {
    expect(() => appendOffset("2025-13-01", "America/Sao_Paulo")).toThrow();
  });

  it("throws on invalid day (32)", () => {
    expect(() => appendOffset("2025-06-32", "America/Sao_Paulo")).toThrow();
  });

  it("throws on completely invalid date string", () => {
    expect(() => appendOffset("not-a-date", "America/Sao_Paulo")).toThrow();
  });

  it("returns original string if Z and offset are mixed (invalid input)", () => {
    expect(() =>
      appendOffset("2025-06-12T12:00:00.123Z-03:00", "America/Sao_Paulo")
    ).toThrow();
  });

  it("throws on milliseconds with no seconds", () => {
    expect(appendOffset("2025-06-12T12:00.123", "America/Sao_Paulo")).toBe(
      "2025-06-12T12:00.123-03:00"
    );
  });

  it("preserves valid ISO with Z only", () => {
    expect(appendOffset("2025-06-12T15:55:52Z", "America/Sao_Paulo")).toBe(
      "2025-06-12T15:55:52+00:00"
    );
  });
});
