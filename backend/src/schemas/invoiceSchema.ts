import { z } from "zod";

/**
 * Canonical schema for extracted invoice data.
 * The AI is instructed to return exactly this shape; we validate (and
 * lightly normalize) before ever trusting the output.
 */
export const LineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().nullable(),
  unit_price: z.number().nullable(),
  total: z.number().nullable(),
});

export const InvoiceDataSchema = z.object({
  vendor: z.string().nullable(),
  invoice_number: z.string().nullable(),
  invoice_date: z.string().nullable(), // YYYY-MM-DD
  due_date: z.string().nullable(), // YYYY-MM-DD
  currency: z.string().nullable(), // ISO-ish code, e.g. "INR", "USD"
  subtotal: z.number().nullable(),
  tax: z.number().nullable(),
  total: z.number().nullable(),
  line_items: z.array(LineItemSchema).default([]),

  // Optional extended fields (Section 25)
  vendor_address: z.string().nullable().optional(),
  vendor_tax_id: z.string().nullable().optional(),
  customer_name: z.string().nullable().optional(),
  customer_address: z.string().nullable().optional(),
  payment_terms: z.string().nullable().optional(),
  tax_rate: z.number().nullable().optional(),
  purchase_order_number: z.string().nullable().optional(),
});

export type LineItem = z.infer<typeof LineItemSchema>;
export type InvoiceData = z.infer<typeof InvoiceDataSchema>;

export const VerificationCheckSchema = z.object({
  id: z.string(),
  label: z.string(),
  passed: z.boolean(),
  severity: z.enum(["info", "warning", "error"]),
  detail: z.string().optional(),
});

export const VerificationResultSchema = z.object({
  status: z.enum(["VERIFIED", "NEEDS_REVIEW"]),
  checks: z.array(VerificationCheckSchema),
});

export type VerificationCheck = z.infer<typeof VerificationCheckSchema>;
export type VerificationResult = z.infer<typeof VerificationResultSchema>;

export const ExtractResponseSchema = z.object({
  success: z.literal(true),
  data: InvoiceDataSchema,
  verification: VerificationResultSchema,
});

export const ExtractErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});
