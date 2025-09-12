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
  let dateObj: Date | null = null;

  if (time instanceof Date) {
    dateObj = time;
  } else if (typeof time === "string") {
    // If it's a datetime with offset or Z, parse as Date
    if (/T.*([+-]\d{2}:?\d{2}|Z)$/.test(time)) {
      // If the string has a fixed offset (e.g., -03:00), return the local time part directly
      const m = time.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:?\d{2})$/
      );
      if (m) {
        const tz = m[8];
        if (tz && tz !== "Z") {
          // Return the local time part as is
          const pad = (n: string) => n.padStart(2, "0");
          const h = pad(m[4]);
          const min = pad(m[5]);
          const sec = pad(m[6]);
          return `${h}:${min}:${sec}`;
        }
        // If Z, treat as UTC
        const year = Number(m[1]);
        const month = Number(m[2]) - 1;
        const day = Number(m[3]);
        const hour = Number(m[4]);
        const minute = Number(m[5]);
        const second = Number(m[6]);
        const ms = m[7] ? Number(m[7].padEnd(3, "0")) : 0;
        let dateUTC = Date.UTC(year, month, day, hour, minute, second, ms);
        dateObj = new Date(dateUTC);
      } else {
        dateObj = new Date(time); // fallback, but should not use local time
      }
    } else {
      // Accept either a plain time or a full datetime without offset
      const str = time.trim();
      const m = str.match(
        /(?:T|^)(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(?:[+-]\d{2}(?::?\d{2})?|Z)?$/
      );
      if (m) {
        const h = Number(m[1]);
        const min = Number(m[2]);
        const s = m[3] ? Number(m[3]) : 0;
        // Use today's date for the Date object
        const now = new Date();
        dateObj = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            h,
            min,
            s
          )
        );
      }
    }
  }

  if (!dateObj) {
    throw new Error(`Invalid time part: ${time}`);
  }

  // Only support UTC or fixed offset timeZone
  let hours = dateObj.getUTCHours();
  let minutes = dateObj.getUTCMinutes();
  let seconds = dateObj.getUTCSeconds();

  // If timeZone is a fixed offset (e.g. "-03:00", "+0200")
  const offsetMatch = timeZone.match(/^([+-])(\d{2}):?(\d{2})$/);
  if (offsetMatch) {
    const sign = offsetMatch[1] === "+" ? 1 : -1;
    const offsetHours = parseInt(offsetMatch[2], 10);
    const offsetMinutes = parseInt(offsetMatch[3], 10);
    const totalOffset = sign * (offsetHours * 60 + offsetMinutes);

    // Adjust UTC time by offset
    const totalMinutes = hours * 60 + minutes + totalOffset;
    hours = Math.floor(((totalMinutes + 1440) % 1440) / 60);
    minutes = (totalMinutes + 1440) % 60;
    // seconds remain the same
  }
  // If timeZone is not UTC or a fixed offset, try to handle IANA time zones (e.g., "America/Sao_Paulo")
  if (
    timeZone !== "UTC" &&
    !/^[+-]\d{2}(:?\d{2})?$/.test(timeZone) &&
    typeof Intl === "object" &&
    typeof Intl.DateTimeFormat === "function"
  ) {
    // Use Date object to get the offset for the IANA time zone
    // We avoid using Intl.DateTimeFormat for formatting, but we can use it to get the offset
    try {
      const dtf = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const parts = dtf.formatToParts(dateObj);
      const h = Number(parts.find((p) => p.type === "hour")?.value || "00");
      const min = Number(parts.find((p) => p.type === "minute")?.value || "00");
      const sec = Number(parts.find((p) => p.type === "second")?.value || "00");
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${pad(h)}:${pad(min)}:${pad(sec)}`;
    } catch {
      // fallback to UTC if timeZone is invalid or not supported
    }
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
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
