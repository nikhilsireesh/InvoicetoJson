import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Check, Download } from "lucide-react";
import type { InvoiceData } from "../types/invoice";

export function JsonViewer({ data }: { data: InvoiceData }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable — fail silently rather than breaking the flow.
    }
  };

  const handleDownload = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoice-data.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl2 border border-[var(--border)] bg-white p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Structured JSON</h3>
        <div className="flex gap-2">
          <motion.button
            onClick={handleCopy}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="copied"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                  Copied!
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy JSON
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          <motion.button
            onClick={handleDownload}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 rounded-full bg-[var(--foreground)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Download className="h-3.5 w-3.5" />
            Download JSON
          </motion.button>
        </div>
      </div>

      {/* The overall page stays light — only this code block uses a dark
          syntax theme, per Section 37. */}
      <motion.pre
        animate={copied ? { boxShadow: "0 0 0 2px var(--success)" } : { boxShadow: "0 0 0 0px transparent" }}
        transition={{ duration: 0.3 }}
        className="font-mono-json max-h-[420px] overflow-auto rounded-xl bg-[#131629] p-4 text-[12.5px] leading-6 text-[#c8d3f5]"
      >
        <code>{json}</code>
      </motion.pre>
    </div>
  );
}
