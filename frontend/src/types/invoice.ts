export interface LineItem {
  description: string;
  quantity: number | null;
  unit_price: number | null;
  total: number | null;
}

export interface InvoiceData {
  vendor: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  due_date: string | null;
  currency: string | null;
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  line_items: LineItem[];
  vendor_address?: string | null;
  vendor_tax_id?: string | null;
  customer_name?: string | null;
  customer_address?: string | null;
  payment_terms?: string | null;
  tax_rate?: number | null;
  purchase_order_number?: string | null;
}

export interface VerificationCheck {
  id: string;
  label: string;
  passed: boolean;
  severity: "info" | "warning" | "error";
  detail?: string;
}

export interface VerificationResult {
  status: "VERIFIED" | "NEEDS_REVIEW";
  checks: VerificationCheck[];
}

export interface ExtractSuccessResponse {
  success: true;
  data: InvoiceData;
  verification: VerificationResult;
}

export interface ExtractErrorResponse {
  success: false;
  error: string;
}

export type ExtractResponse = ExtractSuccessResponse | ExtractErrorResponse;

export type WorkflowStage =
  | "upload"
  | "preview"
  | "processing"
  | "results"
  | "error";

/** Which top-level invoice fields the user has hand-edited (Section 36). */
export type EditedFields = Partial<Record<keyof InvoiceData, boolean>>;
