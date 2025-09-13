# Date Helper Kit

Ensure any ISO date string includes the correct timezone offset — safely, without shifting time.

Date Helper Kit is a lightweight TypeScript utility that appends the proper timezone offset (IANA) to any ISO date string while preserving the original date/time.

---

## ✅ Features

- Preserves original date and time
- Appends the correct offset using IANA timezones (e.g., `America/Sao_Paulo`)
- Accepts partial inputs:
  - `2025-06-12`
  - `2025-06-12T12:00`
  - `2025-06-12T12:00:00`
- Normalizes:
  - Missing seconds (`12:00` → `12:00:00`)
  - Milliseconds (keeps/normalizes `12:00:00.123`)
- Validates inputs and avoids invalid cases like `Z-03:00`

---

## 📦 Installation

```bash
npm install date-helper-kit
```

Also works with `yarn add` or `pnpm add`.

---

## 🚀 Quick Start

```ts
import { parse } from 'date-helper-kit';

// Adds offset and completes missing time
parse('2025-06-12', 'America/Sao_Paulo');
// → '2025-06-12T00:00:00-03:00'

// Adds offset and seconds
parse('2025-06-12T12:00', 'America/Manaus');
// → '2025-06-12T12:00:00-04:00'

// Keeps milliseconds; Z becomes +00:00
parse('2025-06-12T12:00:00.123Z', 'America/Sao_Paulo');
// → '2025-06-12T12:00:00.123+00:00'

// Already has an offset: returned as-is
parse('2025-06-12T12:00:00-03:00', 'America/Manaus');
// → '2025-06-12T12:00:00-03:00'

// Invalid input (mixing Z with offset) throws
parse('2025-06-12T12:00Z-03:00', 'America/Sao_Paulo');
// → ❌ Error: Invalid date: cannot mix Z (UTC) with offset
```

---

## 🧰 Helpers

Beyond `appendOffset`, the lib exports helpers to extract/compose date and time parts:

```ts
import { getDate, getTime, joinDateAndTime } from 'date-helper-kit';

// Extracts the date part (YYYY-MM-DD)
getDate('2025-06-01T00:00:00-03:00');
// → '2025-06-01'

// Extracts the time part (HH:mm:ss)
getTime('2025-12-12T00:00:00-03:00');
// → '00:00:00'

// Merges date + time and appends offset based on timezone
joinDateAndTime('2025-06-01', '10:00:00', 'UTC');
// → '2025-06-01T10:00:00+00:00'

// Accepts timezone as a fixed offset
joinDateAndTime('2025-06-01', '10:00:00', '+02:00');
// → '2025-06-01T10:00:00+02:00'

// Keeps any offset already present on time
joinDateAndTime('2025-06-01', '10:00:00-03:00');
// → '2025-06-01T10:00:00-03:00'
```

---

## 📚 API

- `parse(input: string, timeZone: string): string`
  - Appends the correct offset to the ISO-like input (date-only, datetime with/without seconds/milliseconds).
  - If the input already contains an explicit offset, returns it unchanged.
  - If it ends with `Z`, converts to `+00:00`.
  - Note: `appendOffset` is a deprecated alias for `parse`.

- `appendOffset(input: string, timeZone: string): string` (deprecated)
  - Alias to `parse`. Prefer using `parse` going forward.

- `getDate(date: string | Date, timeZone = 'UTC'): string`
  - Returns only the date part `YYYY-MM-DD`.
  - For strings with a known offset, converts the instant to the calendar date in the given `timeZone`.
  - If the offset is `-00:00` (unknown local offset), no timezone conversion is performed.

- `getTime(time: string | Date, timeZone = system timezone): string`
  - Returns only the time part `HH:mm:ss`.
  - For strings with a fixed offset (e.g., `-03:00`), returns the local time part directly (no conversion).
  - For `Date`, returns the time in the provided `timeZone` (defaults to the machine's timezone). IANA zones are supported in modern runtimes; fixed-offset strings like `+02:00`, `-0300`, or `-03` are also accepted.

- `joinDateAndTime(date: string | Date, time: string | Date, timeZone = 'UTC'): string`
  - Builds `YYYY-MM-DDTHH:mm:ss[.SSS]` and appends an offset.
  - `timeZone` can be IANA (`America/Sao_Paulo`) or a fixed offset (`+02:00`, `-0300`, `-03`).
  - If the `time` already includes an offset (e.g., `10:00-03:00`, `10:00-04`, or `10:00-0300`), it is preserved and normalized to `±HH:MM`.

---

## ✅ Behavior

- Preserves the original date/time; only appends/normalizes the offset.
- Completes seconds when missing (`12:00` → `12:00:00`).
- Keeps milliseconds when present.
- Converts `Z` to `+00:00`.
- Supports short and compact offset inputs and normalizes them:
  - `-03` → `-03:00`, `-0300` → `-03:00`.
- Common errors thrown:
  - Mixing `Z` with an offset (e.g., `2025-06-12T12:00Z-03:00`).
  - Invalid formats (e.g., `2025/06/01`, `not-a-date`).
  - Invalid month/day (e.g., month `13`, day `32`).

---

## ♻️ Migration Note

- `appendOffset` has been deprecated in favor of `parse`.
  - Previous code: `appendOffset('2025-06-12', 'UTC')`
  - New code: `parse('2025-06-12', 'UTC')`

---

## 🔌 Compatibility

- Requires an environment with `Intl.DateTimeFormat` and IANA timezones
  (Node.js 16+ or modern browsers).
- Uses `timeZoneName: 'shortOffset'` to obtain offsets; modern environments return
  values like `GMT-3`, correctly parsed.

---

## 📦 Package

- npm name: `date-helper-kit`
- TypeScript types included (`dist/index.d.ts`).

---

## 🛠️ Development

- Build: `npm run build`
- Tests: `npm test` (or interactive: `npm run dev`)

---

## 📄 License

MIT
