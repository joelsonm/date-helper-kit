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

export function getTime(
  time: string | Date,
  timeZone?: string
): string {
  // Default to the system's local timezone when not provided
  const targetTimeZone =
    timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
  const pad = (n: number) => String(n).padStart(2, "0");

  // --- 1) Strings ---
  if (typeof time === "string") {
    const str = time.trim();

    // a) ISO com offset/Z
    const isoRe =
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:?\d{2})$/;
    const mIso = str.match(isoRe);
    if (mIso) {
      const hh = mIso[4],
        mm = mIso[5],
        ss = mIso[6] ?? "00";
      const tz = mIso[8];
      if (tz && tz !== "Z") {
        // extrai literal (sem conversão)
        return `${hh}:${mm}:${ss.padStart(2, "0")}`;
      }
      // caso Z, parse normal
      const ms = mIso[7] ? mIso[7].padEnd(3, "0") : "000";
      const norm = `${mIso[1]}-${mIso[2]}-${mIso[3]}T${hh}:${mm}:${ss}.${ms}Z`;
      const dateObj = new Date(norm);
      return formatWithTimeZone(dateObj, targetTimeZone);
    }

    // b) ISO sem TZ
    const isoNoTz =
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;
    const mNoTz = str.match(isoNoTz);
    if (mNoTz) {
      const hh = mNoTz[4],
        mm = mNoTz[5],
        ss = mNoTz[6] ?? "00";
      return `${hh}:${mm}:${ss.padStart(2, "0")}`;
    }

    // c) Hora com offset (ex.: 09:10:00-03)
    const timeOff =
      /^(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?([+-]\d{2}(?::?\d{2})?)$/;
    const mTimeOff = str.match(timeOff);
    if (mTimeOff) {
      const hh = mTimeOff[1],
        mm = mTimeOff[2],
        ss = mTimeOff[3] ?? "00";
      return `${hh}:${mm}:${ss.padStart(2, "0")}`;
    }

    // d) Hora-only
    const timeOnly = /^(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;
    const mTime = str.match(timeOnly);
    if (mTime) {
      const hh = mTime[1],
        mm = mTime[2],
        ss = mTime[3] ?? "00";
      return `${hh}:${mm}:${ss.padStart(2, "0")}`;
    }

    throw new Error(`Invalid time string: ${time}`);
  }

  // --- 2) Date ---
  if (time instanceof Date) {
    // Trata Date como um instante e formata no timezone de destino
    return formatWithTimeZone(time, targetTimeZone);
  }

  throw new Error("Invalid time input type");
}

// Função auxiliar interna
function formatWithTimeZone(dateObj: Date, timeZone: string): string {
  const pad = (n: number) => String(n).padStart(2, "0");

  // UTC
  if (timeZone === "UTC" || timeZone === "Z") {
    return `${pad(dateObj.getUTCHours())}:${pad(dateObj.getUTCMinutes())}:${pad(
      dateObj.getUTCSeconds()
    )}`;
  }

  // Offset fixo
  const offRe = /^([+-])(\d{2})(?::?(\d{2}))?$/;
  const mOff = timeZone.match(offRe);
  if (mOff) {
    const sign = mOff[1] === "+" ? 1 : -1;
    const oh = parseInt(mOff[2], 10);
    const om = mOff[3] ? parseInt(mOff[3], 10) : 0;
    const totalOffset = sign * (oh * 60 + om);

    const totalMin =
      dateObj.getUTCHours() * 60 + dateObj.getUTCMinutes() + totalOffset;

    const norm = ((totalMin % 1440) + 1440) % 1440;
    const hh = Math.floor(norm / 60);
    const mm = norm % 60;
    const ss = dateObj.getUTCSeconds();

    return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
  }

  // IANA → usa Intl, que é timezone-aware
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(dateObj);

  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "00");
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "00");
  const s = Number(parts.find((p) => p.type === "second")?.value ?? "00");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
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
