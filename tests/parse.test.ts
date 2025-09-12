import { parse } from "../src";
import { describe, it, expect } from "vitest";

describe("Date Helper Kit", () => {
  it("returns the input unchanged if an explicit offset is already present", () => {
    expect(parse("2025-06-01T00:00:00-03:00", "America/Manaus")).toBe(
      "2025-06-01T00:00:00-03:00"
    );
  });

  it("converts 'Z' suffix to '+00:00' and preserves milliseconds", () => {
    expect(parse("2025-06-12T15:55:52.323Z", "America/Manaus")).toBe(
      "2025-06-12T15:55:52.323+00:00"
    );
  });

  it("appends '+00:00' offset for UTC timezone when no offset is present", () => {
    expect(parse("2025-06-01T00:45:00", "UTC")).toBe(
      "2025-06-01T00:45:00+00:00"
    );
  });

  it("appends '-03:00' offset and adds time if only date is provided", () => {
    expect(parse("2025-06-12", "America/Sao_Paulo")).toBe(
      "2025-06-12T00:00:00-03:00"
    );
  });

  it("ensures seconds are present and applies '-03:00' offset for Sao Paulo", () => {
    expect(parse("2025-06-12T12:00:00", "America/Sao_Paulo")).toBe(
      "2025-06-12T12:00:00-03:00"
    );

    expect(parse("2025-06-12T12:00:0", "America/Sao_Paulo")).toBe(
      "2025-06-12T12:00:00-03:00"
    );

    expect(parse("2025-06-01T00:00", "America/Sao_Paulo")).toBe(
      "2025-06-01T00:00:00-03:00"
    );

    expect(parse("2024-12-16", "America/Sao_Paulo")).toBe(
      "2024-12-16T00:00:00-03:00"
    );

    expect(parse("2025-06-01T00:34", "America/Sao_Paulo")).toBe(
      "2025-06-01T00:34:00-03:00"
    );
  });

  it("pads single-digit seconds and applies '-04:00' offset for Manaus", () => {
    expect(parse("2025-06-01T00:00:1", "America/Manaus")).toBe(
      "2025-06-01T00:00:01-04:00"
    );

    expect(parse("2025-06-01T00:00:12", "America/Manaus")).toBe(
      "2025-06-01T00:00:12-04:00"
    );
  });

  it("ignores the timezone parameter if the input already contains an offset", () => {
    expect(parse("2025-06-01T00:00:12-03:00", "America/Manaus")).toBe(
      "2025-06-01T00:00:12-03:00"
    );
  });

  it("appends offset when milliseconds are present and no 'Z' is used", () => {
    expect(parse("2025-06-12T15:55:52.322", "America/Manaus")).toBe(
      "2025-06-12T15:55:52.322-04:00"
    );
  });

  it("throws an error for invalid ISO format with wrong date separator", () => {
    expect(() => parse("2025/06/01", "America/Sao_Paulo")).toThrow();
  });

  it("throws an error if only time is provided without a date", () => {
    expect(() => parse("12:00", "America/Sao_Paulo")).toThrow();
  });

  it("throws an error for invalid month values", () => {
    expect(() => parse("2025-13-01", "America/Sao_Paulo")).toThrow();
  });

  it("throws an error for invalid day values", () => {
    expect(() => parse("2025-06-32", "America/Sao_Paulo")).toThrow();
  });

  it("throws an error for completely invalid date strings", () => {
    expect(() => parse("not-a-date", "America/Sao_Paulo")).toThrow();
  });

  it("throws an error if input mixes 'Z' and offset (invalid ISO)", () => {
    expect(() =>
      parse("2025-06-12T12:00:00.123Z-03:00", "America/Sao_Paulo")
    ).toThrow();
  });

  it("handles milliseconds with missing seconds and applies offset", () => {
    expect(parse("2025-06-12T12:00.123", "America/Sao_Paulo")).toBe(
      "2025-06-12T12:00.123-03:00"
    );
  });

  it("converts valid ISO with 'Z' to '+00:00' offset", () => {
    expect(parse("2025-06-12T15:55:52Z", "America/Sao_Paulo")).toBe(
      "2025-06-12T15:55:52+00:00"
    );
  });
});
