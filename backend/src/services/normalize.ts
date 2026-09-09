/**
 * Best-effort normalization applied to raw AI output BEFORE schema
 * validation, per spec sections 27-28. We never invent values here —
 * we only reshape ones the model already returned.
 */

const CURRENCY_SYMBOLS: Record<string, string> = {
  "₹": "INR",
  "$": "USD",
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY",
  "₩": "KRW",
};

export function normalizeCurrency(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const trimmed = value.trim();
  if (CURRENCY_SYMBOLS[trimmed]) return CURRENCY_SYMBOLS[trimmed];
  // Already looks like an ISO code (e.g. "INR", "usd")
  if (/^[A-Za-z]{3}$/.test(trimmed)) return trimmed.toUpperCase();
  // Try to find a known symbol embedded in a longer string
  for (const [symbol, code] of Object.entries(CURRENCY_SYMBOLS)) {
    if (trimmed.includes(symbol)) return code;
  }
  return trimmed;
}

export function normalizeNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  // Strip currency symbols, thousands separators, and stray whitespace,
  // e.g. "₹29,500.00" -> "29500.00"
  const cleaned = value
    .replace(/[₹$€£¥₩]/g, "")
    .replace(/,/g, "")
    .trim();

  if (cleaned === "" || cleaned.toLowerCase() === "null") return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

/** Normalize a variety of common invoice date formats to YYYY-MM-DD. */
export function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const raw = value.trim();

  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  // 12/31/2026 or 31/12/2026 or 12-31-2026 — ambiguous, assume MM/DD/YYYY
  // when the first segment is a plausible month; otherwise DD/MM/YYYY.
  const slashMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slashMatch) {
    const [, a, b, year] = slashMatch;
    const first = parseInt(a, 10);
    const second = parseInt(b, 10);
    const month = first <= 12 ? first : second;
    const day = first <= 12 ? second : first;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  // "1 Sep 2026", "Sep 1, 2026", "September 1 2026"
  const monthNameMatch = raw
    .toLowerCase()
    .match(/(\d{1,2})\s+([a-z]{3,9})\s+(\d{4})|([a-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})/);
  if (monthNameMatch) {
    const day = monthNameMatch[1] ?? monthNameMatch[5];
    const monthWord = (monthNameMatch[2] ?? monthNameMatch[4] ?? "").slice(0, 3);
    const year = monthNameMatch[3] ?? monthNameMatch[6];
    const month = MONTHS[monthWord];
    if (month && day && year) {
      return `${year}-${month}-${String(day).padStart(2, "0")}`;
    }
  }

  // Fall back to Date parsing as a last resort.
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return null;
}
