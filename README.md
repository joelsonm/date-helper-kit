# Date Append Offset

> Ensure all ISO date strings include the correct timezone offset — safely, without shifting time.

**Date Append Offset** is a lightweight TypeScript utility that ensures **any ISO date string** has a proper timezone offset, without modifying the original time or date.

---

## ✅ Features

- 🕒 **Preserves the original time and date**
- 🌐 **Appends the correct offset** using IANA timezones (e.g. `"America/Sao_Paulo"`)
- ✨ Supports partial inputs like:
  - `2025-06-12`
  - `2025-06-12T12:00`
  - `2025-06-12T12:00:00`
- 🔧 Normalizes:
  - Missing seconds
  - Milliseconds
- 🛡️ Validates inputs and avoids invalid cases like `Z-03:00`

---

## 📦 Installation

```bash
npm install date-append-offset

## 📦 Usage

```js
import { appendOffset } from 'date-append-offset';

// Adds offset and completes missing time
appendOffset('2025-06-12', 'America/Sao_Paulo');
// → '2025-06-12T00:00:00-03:00'

// Adds offset and seconds
appendOffset('2025-06-12T12:00', 'America/Manaus');
// → '2025-06-12T12:00:00-04:00'

// Keeps milliseconds and converts Z to +00:00
appendOffset('2025-06-12T12:00:00.123Z', 'America/Sao_Paulo');
// → '2025-06-12T12:00:00.123+00:00'

// Already has an offset: returns as-is
appendOffset('2025-06-12T12:00:00-03:00', 'America/Manaus');
// → '2025-06-12T12:00:00-03:00'

// Invalid timezone + malformed input throws
appendOffset('2025-06-12T12:00Z-03:00', 'America/Sao_Paulo');
// → ❌ Error: Invalid date: cannot mix Z (UTC) with offset

```