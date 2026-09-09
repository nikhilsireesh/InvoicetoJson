import { motion } from "framer-motion";
import type { InvoiceData } from "../types/invoice";
import { formatCurrency } from "../utils/format";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0 },
};

export function LineItems({ data }: { data: InvoiceData }) {
  if (data.line_items.length === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">
        No line items were detected on this invoice.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl2 border border-[var(--border)] bg-white shadow-soft">
      {/* Desktop table */}
      <table className="hidden w-full text-sm sm:table">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            <th className="px-5 py-3">Description</th>
            <th className="px-5 py-3">Quantity</th>
            <th className="px-5 py-3">Unit Price</th>
            <th className="px-5 py-3">Total</th>
          </tr>
        </thead>
        <motion.tbody variants={containerVariants} initial="hidden" animate="show">
          {data.line_items.map((item, idx) => (
            <motion.tr
              key={idx}
              variants={rowVariants}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="border-b border-[var(--border)] transition-colors last:border-b-0 hover:bg-[var(--surface)]"
            >
              <td className="px-5 py-3.5 font-medium text-[var(--foreground)]">{item.description}</td>
              <td className="px-5 py-3.5 text-[var(--muted)]">{item.quantity ?? "—"}</td>
              <td className="px-5 py-3.5 text-[var(--muted)]">
                {formatCurrency(item.unit_price, data.currency)}
              </td>
              <td className="px-5 py-3.5 font-semibold text-[var(--foreground)]">
                {formatCurrency(item.total, data.currency)}
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>

      {/* Mobile cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="divide-y divide-[var(--border)] sm:hidden"
      >
        {data.line_items.map((item, idx) => (
          <motion.div key={idx} variants={rowVariants} transition={{ duration: 0.25, ease: "easeOut" }} className="p-4">
            <p className="font-semibold text-[var(--foreground)]">{item.description}</p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-[var(--muted)]">
              <div>
                <p className="uppercase">Qty</p>
                <p className="font-semibold text-[var(--foreground)]">{item.quantity ?? "—"}</p>
              </div>
              <div>
                <p className="uppercase">Unit price</p>
                <p className="font-semibold text-[var(--foreground)]">
                  {formatCurrency(item.unit_price, data.currency)}
                </p>
              </div>
              <div>
                <p className="uppercase">Total</p>
                <p className="font-semibold text-[var(--foreground)]">
                  {formatCurrency(item.total, data.currency)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
