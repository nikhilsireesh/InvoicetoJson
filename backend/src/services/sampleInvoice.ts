import type { InvoiceData } from "../schemas/invoiceSchema.js";

/**
 * Fixed demo data for the "Try Sample Invoice" flow (Section 40 / 56).
 * This is the ONLY place fixed data is used — real uploads always go
 * through the actual extraction pipeline in invoiceExtractor.ts.
 */
export const SAMPLE_INVOICE_DATA: InvoiceData = {
  vendor: "ABC Technologies Pvt Ltd",
  invoice_number: "INV-2026-1045",
  invoice_date: "2026-09-01",
  due_date: "2026-09-30",
  currency: "INR",
  subtotal: 25000,
  tax: 4500,
  total: 29500,
  line_items: [
    { description: "Laptop Stand", quantity: 5, unit_price: 2000, total: 10000 },
    { description: "Wireless Keyboard", quantity: 5, unit_price: 3000, total: 15000 },
  ],
  vendor_address: "12 MG Road, Bengaluru, Karnataka, India",
  vendor_tax_id: "29ABCDE1234F1Z5",
  customer_name: "Nova Retail Solutions",
  customer_address: "44 Residency Road, Bengaluru, Karnataka, India",
  payment_terms: "Net 30",
  tax_rate: 18,
  purchase_order_number: "PO-88213",
};
