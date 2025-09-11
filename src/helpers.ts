import { appendOffset } from "./parse";

export function getDate(date: string | Date, timeZone: string = "UTC"): string {
  if (date instanceof Date) {
    // Use Intl.DateTimeFormat to format date in the given timeZone
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    // en-CA gives YYYY-MM-DD
    return formatter.format(date);
  }
  let datePart: string;
  if (typeof date === "string" && date.match(/T.*([+-]\d{2}:?\d{2}|Z)$/)) {
    // Use the formatter to get the date in the target timeZone, preserving the local time
    const parts = date.split("T");
    const timePart =
      parts[1]?.replace(/([+-]\d{2}:?\d{2}|Z)$/, "") || "00:00:00";
    const isoString = `${parts[0]}T${timePart}`;
    const localDate = new Date(isoString);
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    datePart = formatter.format(localDate);
  } else {
    datePart = typeof date === "string" ? date.split("T")[0] : "";
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    throw new Error(`Invalid date part: ${date}`);
  }
  return datePart;
}

export function getTime(time: string | Date, timeZone: string = "UTC"): string {
  if (time instanceof Date) {
    // Use Intl.DateTimeFormat to format time in the given timeZone
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    // Format returns "HH:mm:ss"
    const parts = formatter.formatToParts(time);
    const get = (type: string) =>
      parts.find((p) => p.type === type)?.value || "00";
    const ms = time.getMilliseconds();
    let timeStr = `${get("hour")}:${get("minute")}:${get("second")}`;
    if (ms > 0) {
      timeStr += `.${String(ms).padStart(3, "0")}`;
    }
    return timeStr;
  }
  // If time is a string like "2025-12-12T00:00:00-03:00", extract the time part
  let timePart = time;
  if (typeof time === "string" && time.includes("T")) {
    timePart = time.split("T")[1];
    // Remove timezone offset if present
    timePart = timePart.replace(/([+-]\d{2}:?\d{2}|Z)$/, "");
  }
  if (!/^\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/.test(timePart)) {
    throw new Error(`Invalid time part: ${time}`);
  }
  return timePart;
}

export function joinDateAndTime(
  date: string | Date,
  time: string | Date,
  timeZone: string = "UTC"
): string {
  const datePart =
    date instanceof Date
      ? date.toISOString().split("T")[0]
      : date.split("T")[0];
  const timePart =
    time instanceof Date
      ? time.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone,
        })
      : time.split("T")[1] || time;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    throw new Error(`Invalid date part: ${date}`);
  }

  if (
    !/^\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?([+-]\d{2}(:?\d{2})?|[+-]\d{2}|Z)?$/.test(
      timePart
    )
  ) {
    throw new Error(`Invalid time part: ${time}`);
  }

  return appendOffset(`${datePart}T${timePart}`, timeZone);
}
