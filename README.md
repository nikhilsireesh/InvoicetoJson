# Invoice2JSON

Turn invoices into verified JSON in seconds.

## Overview

Invoice2JSON is a vibrant, light-themed FinTech tool that takes a PDF/image
invoice, runs it through a vision-capable AI model, validates the output
against a strict schema, checks the financial math, and hands you clean,
structured JSON you can copy or download.

## Problem

Accounting teams still hand-key vendor, totals, dates, tax, and line items
from PDFs, scans, and photos. It's slow, repetitive, and error-prone.

## Solution

Upload → AI vision extraction → schema validation → financial verification →
editable results → copy/download JSON. Every step is real; nothing is
hardcoded for real uploads (the "Try Sample Invoice" button is the one
intentional exception, using fixed demo data so the product can be shown
offline).

## Features

- Drag-and-drop upload with live validation (type, size)
- Invoice preview with zoom / fit-to-screen
- Animated multi-step "Analyzing invoice" progress
- AI extraction via a pluggable provider interface (ships with OpenAI vision)
- Zod schema validation with a normalize-then-revalidate fallback
- Financial verification engine (subtotal + tax ≈ total, qty × price ≈ line
  total, line items ≈ subtotal, required-field checks)
- VERIFIED / NEEDS REVIEW states, never a false "verified"
- Editable extracted fields with instant re-verification and an
  "Edited manually" indicator
- Syntax-styled JSON viewer, Copy JSON, Download JSON
- Sample invoice for offline demos
- Reset ("Start New Invoice") flow
- Responsive layout (table → cards on mobile), keyboard-accessible controls,
  visible focus states, `prefers-reduced-motion` support

## Tech stack

- Frontend: React + TypeScript + Vite + Tailwind CSS + Framer Motion + lucide-react
- Backend: Node.js + Express + TypeScript
- Validation: Zod
- AI: pluggable vision provider (`AI_PROVIDER` env var) — OpenAI (`gpt-4o` by
  default) or Gemini (`gemini-flash-latest` by default) — behind a provider
  interface so another vision model can be swapped in later without
  touching routes or the verification engine

## Architecture

```
invoice2json/
  frontend/           React + Vite app
    src/
      components/      Header, Hero, UploadZone, InvoicePreview,
                        ProcessingState, InvoiceDetails, LineItems,
                        VerificationPanel, JsonViewer, EmptyResults,
                        ErrorState, ActionButtons, Logo
      hooks/            useInvoiceWorkflow — single state machine for the
                         whole upload → extract → edit → reset flow
      types/            Shared InvoiceData / VerificationResult types
      utils/            api.ts (fetch calls), format.ts, verify.ts
                         (client-side mirror of the backend verification
                         engine, used for instant re-checks on edit)
  backend/
    src/
      routes/extract.ts         POST /api/extract, GET /api/sample
      services/invoiceExtractor.ts   provider interface + OpenAI implementation
      services/verificationService.ts  financial verification engine
      services/normalize.ts     date/number/currency normalization
      services/sampleInvoice.ts fixed demo data
      schemas/invoiceSchema.ts  Zod schemas (single source of truth)
      middleware/uploadValidation.ts  multer config + file validation
      server.ts
  demo/
    standalone-demo.html   zero-install, single-file visual demo (see below)
```

## Installation

Requires Node.js 18+ and an internet connection for package installation
(this repo was authored in a network-isolated sandbox, so dependencies have
**not** been installed or run here — do that in your own environment):

```bash
git clone <this project>
cd invoice2json
npm run install:all      # installs backend and frontend deps
```

## Environment variables

Copy the example file and add your key:

```bash
cp backend/.env.example backend/.env
```

```
AI_PROVIDER=openai                 # optional — "openai" (default) or "gemini"
OPENAI_API_KEY=your_api_key_here   # required for real extraction if AI_PROVIDER=openai
OPENAI_MODEL=gpt-4o                # optional
GEMINI_API_KEY=your_api_key_here   # required for real extraction if AI_PROVIDER=gemini
GEMINI_MODEL=gemini-flash-latest   # optional
PORT=5000                          # optional
CORS_ORIGIN=http://localhost:5173  # optional, for non-default frontend origins
```

The frontend never sees these keys — all AI calls happen server-side in
`backend/src/services/invoiceExtractor.ts`.

## Running the project

```bash
npm run dev
```

This runs the backend on `http://localhost:5000` and the frontend on
`http://localhost:5173` (Vite proxies `/api` to the backend, see
`frontend/vite.config.ts`). Open `http://localhost:5173`.

Without `OPENAI_API_KEY` set, "Try Sample Invoice" still works (it's fixed
demo data), but real uploads will return a clear extraction error instead
of silently faking a result.

### Zero-install visual demo

`demo/standalone-demo.html` is a single self-contained file (React + Tailwind
loaded from CDN) that recreates the full look, motion, and the sample-data
flow — open it directly in a browser, no `npm install` required. It is a
**visual/UX demo only**: it does not call a real backend or AI model, and
that's stated on the page itself. Use it to see the design; use the real app
above for real extraction.

## API

### `POST /api/extract`

`multipart/form-data`, field name `invoice` (PNG, JPG, JPEG, or PDF, ≤10 MB).

```json
{
  "success": true,
  "data": {
    "vendor": "ABC Technologies",
    "invoice_number": "INV-2026-1045",
    "invoice_date": "2026-09-01",
    "due_date": "2026-09-30",
    "currency": "INR",
    "subtotal": 25000,
    "tax": 4500,
    "total": 29500,
    "line_items": []
  },
  "verification": { "status": "VERIFIED", "checks": [] }
}
```

Errors: `{ "success": false, "error": "Human-readable message" }`

### `GET /api/sample`

Returns the fixed demo invoice in the same response shape, for the
"Try Sample Invoice" button.

## JSON schema

See `backend/src/schemas/invoiceSchema.ts` for the canonical Zod schema.
Core fields: `vendor`, `invoice_number`, `invoice_date`, `due_date`,
`currency`, `subtotal`, `tax`, `total`, `line_items[]`. Optional fields:
`vendor_address`, `vendor_tax_id`, `customer_name`, `customer_address`,
`payment_terms`, `tax_rate`, `purchase_order_number`. Unknown values are
`null` — the model is instructed never to invent data.

## Verification logic

`backend/src/services/verificationService.ts` runs:

- **Check A** — `subtotal + tax ≈ total` (rounding-tolerant)
- **Check B** — `quantity × unit_price ≈ line item total`, per line item
- **Check C** — sum of line items ≈ subtotal
- **Check D** — required fields present (vendor, invoice number, total are
  hard requirements; due date and line items are soft/warning-level)

Status is `VERIFIED` only if every error-level check passes; otherwise
`NEEDS_REVIEW`. The app never claims an invoice is verified when it isn't.

## Security

- `OPENAI_API_KEY` / `GEMINI_API_KEY` live only in `backend/.env`, read via
  `dotenv`, and are never sent to or embedded in the frontend bundle.
- `.env` is gitignored; only `.env.example` (no real key) is committed.
- Uploaded files are validated by extension, MIME type, and size, kept in
  memory only (`multer.memoryStorage()`), used once for the extraction
  call, and never written to disk.
- Centralized error handling returns human-readable messages; raw stack
  traces are never sent to the client.

## Testing

Because this repository was built in a network-isolated environment, `npm
install` / `npm run dev` / in-browser testing could not be executed here.
The code has been written to compile against the pinned dependency
versions in each `package.json` and mirrors a conventional, previously
working Vite + Express + Zod stack. Before you rely on it, run through this
checklist in your own environment:

PNG / JPG / JPEG / PDF upload · unsupported file type · file over 10 MB ·
empty submission · successful extraction · missing fields · invalid AI
response · financial mismatch → NEEDS REVIEW · clean invoice → VERIFIED ·
Copy JSON · Download JSON · edit a field and watch verification re-run ·
Reset workspace · Try Sample Invoice · mobile layout · drag-and-drop ·
error message copy (no stack traces).

## Known limitations

- No persistence/database by design (Section 63) — nothing is saved
  between sessions.
- PDF preview shows a document placeholder rather than a rendered first
  page (Section 17 allows a "useful preview" here); wiring in `pdfjs-dist`
  is the natural next step if full PDF rendering is required.
- Confidence scores (Section 57) are not implemented — the OpenAI Chat
  Completions API used here doesn't return field-level confidence, and the
  brief explicitly says not to fabricate it.
- `demo/standalone-demo.html` only demonstrates the sample-data path.
- This codebase has not been run or browser-tested in this environment
  (see Testing above) — please validate before a live demo.

## Future improvements

Multi-invoice batch processing, CSV/Excel export, accounting integrations
(QuickBooks, Xero, Zoho Books), invoice history, authentication, cloud
storage — intentionally not built for this MVP (Section 64).
