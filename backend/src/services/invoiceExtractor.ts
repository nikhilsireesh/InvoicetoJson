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

/**
 * Gemini's REST API takes the vision prompt as one of several "parts" in a
 * single content block — a plain fetch() is enough, so this avoids pulling
 * in a whole SDK for what is otherwise a two-call surface (generateContent).
 */
class GeminiProvider implements InvoiceExtractionProvider {
  private apiKey: string;
  private model: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_api_key_here") {
      throw new ExtractionError(
        "GEMINI_API_KEY is not configured on the server. Set a real key in backend/.env to enable extraction."
      );
    }
    this.apiKey = apiKey;
    this.model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  }

  async extract(file: { buffer: Buffer; mimetype: string }): Promise<unknown> {
    const base64 = file.buffer.toString("base64");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const body = JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${EXTRACTION_SYSTEM_PROMPT}\n\nExtract the structured invoice data from this document.` },
            { inline_data: { mime_type: file.mimetype, data: base64 } },
          ],
        },
      ],
      generationConfig: { temperature: 0, responseMimeType: "application/json" },
    });

    // Gemini's free-tier flash models return 503 "high demand" / 429 rate
    // limit fairly often under normal load — retrying a couple of times
    // with a short backoff clears most of them instead of failing the
    // whole upload on a blip the very next request would have sailed
    // through.
    const MAX_ATTEMPTS = 3;
    let res: Response | undefined;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
      } catch {
        throw new ExtractionError("Could not reach the Gemini API. Check the server's network connection.");
      }

      const isRetryable = res.status === 503 || res.status === 429;
      if (res.ok || !isRetryable || attempt === MAX_ATTEMPTS) break;
      await new Promise((resolve) => setTimeout(resolve, attempt * 800));
    }

    const finalRes = res!; // always assigned: the loop always runs at least once

    if (!finalRes.ok) {
      if (finalRes.status === 400 || finalRes.status === 401 || finalRes.status === 403) {
        throw new ExtractionError(
          "The Gemini API key configured on the server was rejected. Check GEMINI_API_KEY in backend/.env."
        );
      }
      if (finalRes.status === 503 || finalRes.status === 429) {
        throw new ExtractionError(
          "The Gemini API is currently overloaded. This is temporary on Google's side — please try again in a moment."
        );
      }
      const errBody = await finalRes.text().catch(() => "");
      throw new ExtractionError(`AI provider error: ${finalRes.status} ${errBody.slice(0, 300)}`);
    }

    const json = (await finalRes.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const raw = json.candidates?.[0]?.content?.parts?.[0]?.text;
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
    const providerName = (process.env.AI_PROVIDER || "openai").toLowerCase();
    providerInstance = providerName === "gemini" ? new GeminiProvider() : new OpenAIProvider();
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
