import type { InvoiceData, VerificationCheck, VerificationResult } from "../types/invoice";

const ROUNDING_TOLERANCE = 1.0;
const RELATIVE_TOLERANCE = 0.02;

function approximatelyEqual(a: number, b: number): boolean {
  const diff = Math.abs(a - b);
  return diff <= ROUNDING_TOLERANCE || diff <= Math.max(Math.abs(a), Math.abs(b)) * RELATIVE_TOLERANCE;
}

/**
 * Mirrors backend/src/services/verificationService.ts so edited fields
 * (Section 36) get instant, consistent feedback without a round trip.
 * The server remains the source of truth for the initial extraction.
 */
export function runVerificationClientSide(data: InvoiceData): VerificationResult {
  const checks: VerificationCheck[] = [];

  checks.push({ id: "vendor_present", label: "Vendor detected", passed: !!data.vendor, severity: "error" });
  checks.push({
    id: "invoice_number_present",
    label: "Invoice number detected",
    passed: !!data.invoice_number,
    severity: "error",
  });
  checks.push({ id: "total_present", label: "Total detected", passed: data.total !== null, severity: "error" });
  checks.push({
    id: "due_date_present",
    label: "Due date detected",
    passed: !!data.due_date,
    severity: "warning",
  });
  checks.push({
    id: "line_items_present",
    label: "Line items detected",
    passed: data.line_items.length > 0,
    severity: "warning",
  });

  if (data.subtotal !== null && data.tax !== null && data.total !== null) {
    const expected = data.subtotal + data.tax;
    checks.push({
      id: "subtotal_plus_tax",
      label: "Tax calculation matches",
      passed: approximatelyEqual(expected, data.total),
      severity: "error",
      detail: `subtotal (${data.subtotal}) + tax (${data.tax}) = ${expected.toFixed(2)}, total = ${data.total}`,
    });
  }

  data.line_items.forEach((item, idx) => {
    if (item.quantity !== null && item.unit_price !== null && item.total !== null) {
      const expected = item.quantity * item.unit_price;
      checks.push({
        id: `line_item_math_${idx}`,
        label: `Line item ${idx + 1} math matches`,
        passed: approximatelyEqual(expected, item.total),
        severity: "warning",
        detail: `${item.description}: ${item.quantity} × ${item.unit_price} = ${expected.toFixed(2)}, listed total = ${item.total}`,
      });
    }
  });

  if (data.line_items.length > 0 && data.subtotal !== null) {
    const knownTotals = data.line_items.filter((i) => i.total !== null);
    if (knownTotals.length === data.line_items.length) {
      const sum = knownTotals.reduce((acc, i) => acc + (i.total ?? 0), 0);
      checks.push({
        id: "line_items_sum_matches_subtotal",
        label: "Line items sum matches subtotal",
        passed: approximatelyEqual(sum, data.subtotal),
        severity: "warning",
        detail: `sum of line items = ${sum.toFixed(2)}, subtotal = ${data.subtotal}`,
      });
    }
  }

  const hasFailingError = checks.some((c) => c.severity === "error" && !c.passed);
  const hasFailingWarning = checks.some((c) => c.severity === "warning" && !c.passed);
  const status: VerificationResult["status"] = hasFailingError || hasFailingWarning ? "NEEDS_REVIEW" : "VERIFIED";

  return { status, checks };
}
