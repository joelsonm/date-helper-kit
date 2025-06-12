export function appendOffset(input: string, timeZone: string): string {
  let normalized = input.trim();

  if (/Z[+-]\d{2}:\d{2}/.test(input)) {
    throw new Error(`Invalid date: cannot mix Z (UTC) with offset: ${input}`);
  }

  if (/T\d{2}:\d{2}:\d{2}(\.\d{1,3})?([+-]\d{2}:\d{2})$/.test(normalized)) {
    return normalized;
  }

  if (/Z$/.test(normalized)) {
    return normalized.replace("Z", "+00:00");
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    normalized += "T00:00:00";
  } else if (/T\d{2}:\d{2}$/.test(normalized)) {
    normalized += ":00";
  } else if (/T\d{2}:\d{2}:\d{1}$/.test(normalized)) {
    normalized = normalized.replace(/:(\d)$/, ":0$1");
  }

  const [datePart, timePart] = normalized.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hms] = timePart.split(/[.+]/);
  const [hour, minute, second] = hms.split(":").map(Number);

  if (month >= 12 || day >= 32) throw new Error(`Invalid date: ${input}`);

  const localDate = new Date(year, month - 1, day, hour, minute, second || 0);

  if (isNaN(localDate.getTime())) {
    throw new Error(`Invalid date: ${input}`);
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
    minute: "2-digit",
  });

  const parts = formatter.formatToParts(localDate);
  const offsetPart = parts.find((p) => p.type === "timeZoneName");

  if (!offsetPart) throw new Error("Offset not found");

  const value = offsetPart.value;
  if (value === "UTC" || value === "GMT") return `${normalized}+00:00`;

  const offsetMatch = /GMT([+-]?\d+)/.exec(value);
  if (!offsetMatch) throw new Error(`Invalid offset: ${value}`);

  const rawOffset = Number(offsetMatch[1]);
  const sign = rawOffset >= 0 ? "+" : "-";
  const abs = Math.abs(rawOffset);
  const offset = `${sign}${String(abs).padStart(2, "0")}:00`;

  return `${normalized}${offset}`;
}
