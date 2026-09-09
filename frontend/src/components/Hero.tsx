import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export function Hero({
  onUpload,
  onSample,
}: {
  onUpload: () => void;
  onSample: () => void;
}) {
  return (
    <section className="relative overflow-hidden">
      {/* subtle background glows — Section 8 */}
      <div
        className="pointer-events-none absolute -left-32 -top-24 h-80 w-80 rounded-full bg-[var(--primary)] opacity-[0.08] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-[var(--secondary)] opacity-[0.08] blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--secondary)]">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered extraction
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-[3.4rem]">
            Turn invoices into verified JSON.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
            Upload an invoice and automatically extract vendor details, payment
            totals, due dates, taxes, and line items in seconds.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <motion.button
              onClick={onUpload}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-6 py-3.5 text-sm font-semibold text-white shadow-lift"
            >
              Upload Invoice
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </motion.button>
            <motion.button
              onClick={onSample}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full border border-[var(--border)] bg-white px-6 py-3.5 text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              Try Sample Invoice
            </motion.button>
          </div>

          <p className="mt-6 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            AI-powered · Structured output · Financial verification
          </p>
        </div>

        <div className="relative mx-auto hidden h-72 w-full max-w-sm sm:block">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute left-2 top-4 w-64 animate-floaty rounded-2xl border border-[var(--border)] bg-white p-4 shadow-lift"
          >
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-[var(--secondary)]">
              <Sparkles className="h-3.5 w-3.5" />
              Extracted
            </div>
            <pre className="font-mono-json whitespace-pre-wrap text-[11px] leading-5 text-[var(--foreground)]">
{`{
  "vendor": "Acme Ltd",
  "total": 29500,
  "currency": "INR"
}`}
            </pre>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            style={{ animationDelay: "1.2s" }}
            className="absolute bottom-6 right-2 flex animate-floaty items-center gap-2 rounded-full border border-[var(--success)]/30 bg-[var(--success-light)] px-4 py-2.5 shadow-soft"
          >
            <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
            <span className="text-sm font-semibold text-[var(--success)]">Verified</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
