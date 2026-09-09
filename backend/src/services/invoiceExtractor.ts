import OpenAI from "openai";
import { InvoiceDataSchema, type InvoiceData } from "../schemas/invoiceSchema.js";
import { normalizeCurrency, normalizeDate, normalizeNumber } from "./normalize.js";

export class ExtractionError extends Error {}

/**
 * Provider abstraction (Section 20). Today only OpenAI is implemented,
 * but any vision-capable provider (Claude, Tesseract+LLM, etc.) can be
 * dropped in behind this same interface without touching routes/ or
 * the verification engine.
 */
export interface InvoiceExtractionProvider {
  extract(file: { buffer: Buffer; mimetype: string }): Promise<unknown>;
}

const EXTRACTION_SYSTEM_PROMPT = `You are an expert invoice data extraction engine.

You will be shown an image of an invoice (or a scanned/photographed invoice).
Extract the following fields and return ONLY a single JSON object, with no
markdown fences and no commentary, matching exactly this shape:

{
  "vendor": string | null,
  "invoice_number": string | null,
  "invoice_date": string | null,
  "due_date": string | null,
  "currency": string | null,
  "subtotal": number | null,
  "tax": number | null,
  "total": number | null,
  "line_items": [
    { "description": string, "quantity": number | null, "unit_price": number | null, "total": number | null }
  ],
  "vendor_address": string | null,
  "vendor_tax_id": string | null,
  "customer_name": string | null,
  "customer_address": string | null,
  "payment_terms": string | null,
  "tax_rate": number | null,
  "purchase_order_number": string | null
}

Rules:
- Inspect the ENTIRE document before answering.
- Distinguish the vendor (who issued/is billing the invoice) from the customer (who is being billed).
- Dates should be normalized to YYYY-MM-DD where you can confidently determine the format; otherwise return the date text as written.
- Financial values should be plain numbers with no currency symbols or thousands separators.
- currency should be an ISO-style code (e.g. "USD", "INR") when determinable.
- Never invent or guess a value. If a field is not clearly present, return null for it.
- Include every visible line item, preserving numeric accuracy.
- Return raw JSON only — no prose, no markdown code fences.`;

class OpenAIProvider implements InvoiceExtractionProvider {
  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    // .env.example ships a literal placeholder value; treat it the same as
    // "unset" instead of letting it reach OpenAI and fail as a confusing
    // generic 500 further down the pipeline.
    if (!apiKey || apiKey === "your_api_key_here") {
      throw new ExtractionError(
        "OPENAI_API_KEY is not configured on the server. Set a real key in backend/.env to enable extraction."
      );
    }
    this.client = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL || "gpt-4o";
  }

  async extract(file: { buffer: Buffer; mimetype: string }): Promise<unknown> {
    const base64 = file.buffer.toString("base64");
    const dataUrl = `data:${file.mimetype};base64,${base64}`;

    let response;
    try {
      response = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract the structured invoice data from this document." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      });
    } catch (err) {
      // Surface the actual reason (bad key, no quota, model access, etc.)
      // instead of letting it fall through to a generic "please try again".
      if (err instanceof OpenAI.APIError) {
        if (err.status === 401) {
          throw new ExtractionError(
            "The OpenAI API key configured on the server was rejected. Check OPENAI_API_KEY in backend/.env."
          );
        }
        throw new ExtractionError(`AI provider error: ${err.message}`);
      }
      throw err;
    }

    const raw = response.choices[0]?.message?.content;
    if (!raw) {
      throw new ExtractionError("The AI provider returned an empty response.");
    }

    try {
      return JSON.parse(raw);
    } catch {
      throw new ExtractionError("The AI provider returned a response that was not valid JSON.");
    }
  }
}

let providerInstance: InvoiceExtractionProvider | null = null;

function getProvider(): InvoiceExtractionProvider {
  if (!providerInstance) {
    providerInstance = new OpenAIProvider();
  }
  return providerInstance;
}

/** Normalizes raw (untrusted) AI JSON before schema validation. */
function normalizeRaw(raw: any): any {
  if (raw === null || typeof raw !== "object") return raw;

  return {
    ...raw,
    invoice_date: normalizeDate(raw.invoice_date),
    due_date: normalizeDate(raw.due_date),
    currency: normalizeCurrency(raw.currency),
    subtotal: normalizeNumber(raw.subtotal),
    tax: normalizeNumber(raw.tax),
    total: normalizeNumber(raw.total),
    tax_rate: raw.tax_rate !== undefined ? normalizeNumber(raw.tax_rate) : undefined,
    line_items: Array.isArray(raw.line_items)
      ? raw.line_items.map((item: any) => ({
          description: typeof item?.description === "string" ? item.description : "Unlabeled item",
          quantity: normalizeNumber(item?.quantity),
          unit_price: normalizeNumber(item?.unit_price),
          total: normalizeNumber(item?.total),
        }))
      : [],
  };
}

/**
 * Full pipeline: call the provider, normalize the raw response, then
 * validate against the schema. If normalization + validation both fail,
 * we surface a clean extraction error rather than trusting partial data.
 */
export async function extractInvoice(file: { buffer: Buffer; mimetype: string }): Promise<InvoiceData> {
  const provider = getProvider();
  const rawResponse = await provider.extract(file);

  // Attempt 1: validate as-is.
  const firstAttempt = InvoiceDataSchema.safeParse(rawResponse);
  if (firstAttempt.success) return firstAttempt.data;

  // Attempt 2: normalize dates/numbers/currency, then validate again.
  const normalized = normalizeRaw(rawResponse);
  const secondAttempt = InvoiceDataSchema.safeParse(normalized);
  if (secondAttempt.success) return secondAttempt.data;

  throw new ExtractionError(
    "We couldn't confidently read this invoice. Try uploading a clearer image."
  );
}
