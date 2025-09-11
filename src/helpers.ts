import { appendOffset } from "./parse";

export function getDate(date: string | Date, timeZone: string = "UTC"): string {
  // If a Date object is provided, format as calendar date (UTC-based)
  if (date instanceof Date) {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  let datePart: string = "";
  if (typeof date === "string") {
    // If full datetime with offset
    if (/T.*([+-]\d{2}:?\d{2}|Z)$/.test(date)) {
      // Special case: "-00:00" means unknown local offset; do NOT convert to target timeZone
      if (/T.*-00:00$/.test(date)) {
        datePart = date.split("T")[0];
      } else {
        // Convert the instant to the target timeZone and take the calendar date
        const d = new Date(date);
        const formatter = new Intl.DateTimeFormat("en-CA", {
          timeZone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        datePart = formatter.format(d);
      }
    } else {
      // Either a plain date or a datetime without offset; just take the date part
      datePart = date.split("T")[0];
    }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    throw new Error(`Invalid date part: ${date}`);
  }
  return datePart;
}

export function getTime(time: string | Date, timeZone: string = "UTC"): string {
  let timePart = "";
  if (time instanceof Date) {
    // If the caller explicitly requests UTC, read UTC clock time.
    const hNum = timeZone === "UTC" ? time.getUTCHours() : time.getHours();
    const mNum = timeZone === "UTC" ? time.getUTCMinutes() : time.getMinutes();
    const sNum = timeZone === "UTC" ? time.getUTCSeconds() : time.getSeconds();
    const h = String(hNum).padStart(2, "0");
    const m = String(mNum).padStart(2, "0");
    const s = String(sNum).padStart(2, "0");
    timePart = `${h}:${m}:${s}`;
  } else if (typeof time === "string") {
    const str = time.trim();
    // Accept either a plain time or a full datetime
    // Capture HH:mm[:ss[.ms]] and ignore any trailing offset
    const m = str.match(
      /(?:T|^)(\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?)(?:[+-]\d{2}(?::?\d{2})?|Z)?$/
    );
    if (m) {
      timePart = m[1];
    }
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
  let datePart = "";
  let timePart = "";

  // Date part: treat as calendar date only (no TZ conversion)
  if (date instanceof Date) {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    datePart = `${y}-${m}-${d}`;
  } else if (typeof date === "string") {
    datePart = date.includes("T") ? date.split("T")[0] : date;
  }

  // Time part
  if (time instanceof Date) {
    const h = String(time.getHours()).padStart(2, "0");
    const m = String(time.getMinutes()).padStart(2, "0");
    const s = String(time.getSeconds()).padStart(2, "0");
    timePart = `${h}:${m}:${s}`;
  } else if (typeof time === "string") {
    const m = time.match(
      /^(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?([+-]\d{2}(?::?\d{2})?|Z)?$/
    );
    if (!m) {
      throw new Error(`Invalid time part: ${time}`);
    }
    const hour = m[1] || "00";
    const minute = m[2] || "00";
    const second = m[3] || "00";
    const ms = m[4] ? m[4].padEnd(3, "0") : "000";
    const offset = m[5] || "";

    const baseTime = `${hour}:${minute}:${second}${
      ms !== "000" ? "." + ms : ""
    }`;

    if (offset) {
      // Normalize and keep the provided offset (no conversion)
      let normalizedOffset = offset;
      if (offset === "Z") normalizedOffset = "+00:00";
      else if (/^[+-]\d{2}$/.test(offset)) normalizedOffset = offset + ":00";
      else if (/^[+-]\d{4}$/.test(offset))
        normalizedOffset = `${offset.slice(0, 3)}:${offset.slice(3)}`;
      return `${datePart}T${baseTime}${normalizedOffset}`;
    }

    timePart = baseTime;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    throw new Error(`Invalid date part: ${date}`);
  }
  if (!/^\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/.test(timePart)) {
    throw new Error(`Invalid time part: ${time}`);
  }

  // If the timeZone is provided as a fixed offset, normalize and append directly
  if (/^[+-]\d{2}(:?\d{2})?$/.test(timeZone)) {
    let normalized = timeZone;
    if (/^[+-]\d{2}$/.test(timeZone)) normalized = timeZone + ":00";
    if (/^[+-]\d{4}$/.test(timeZone))
      normalized = `${timeZone.slice(0, 3)}:${timeZone.slice(3)}`;
    return `${datePart}T${timePart}${normalized}`;
  }

  return appendOffset(`${datePart}T${timePart}`, timeZone);
}
