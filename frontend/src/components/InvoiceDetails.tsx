import { useEffect } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "framer-motion";
import { CheckCircle2, PenLine } from "lucide-react";
import type { EditedFields, InvoiceData, VerificationResult } from "../types/invoice";
import { formatCurrency } from "../utils/format";

interface FieldConfig {
  key: keyof InvoiceData;
  label: string;
  tint: string;
  type?: "text" | "date" | "number";
}

const FIELDS: FieldConfig[] = [
  { key: "vendor", label: "Vendor", tint: "bg-[var(--primary-light)]" },
  { key: "invoice_number", label: "Invoice #", tint: "bg-[var(--secondary-light)]" },
  { key: "invoice_date", label: "Invoice Date", tint: "bg-[var(--accent-light)]", type: "date" },
  { key: "due_date", label: "Due Date", tint: "bg-[var(--warning-light)]", type: "date" },
  { key: "subtotal", label: "Subtotal", tint: "bg-[var(--accent-light)]", type: "number" },
  { key: "tax", label: "Tax", tint: "bg-[var(--warning-light)]", type: "number" },
  { key: "currency", label: "Currency", tint: "bg-[var(--primary-light)]" },
];

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

interface Props {
  data: InvoiceData;
  verification: VerificationResult | null;
  editedFields: EditedFields;
  onEdit: <K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => void;
}

export function InvoiceDetails({ data, verification, editedFields, onEdit }: Props) {
  const isVerified = verification?.status === "VERIFIED";

  return (
    <div>
      {/* Total card — Section 34 */}
      <div
        className={`mb-5 rounded-xl2 border p-6 shadow-soft transition-colors duration-300 ${
          isVerified
            ? "border-[var(--success)]/25 bg-gradient-to-br from-[var(--success-light)] to-white"
            : "border-[var(--border)] bg-white"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Total</p>
            <p className="mt-1 text-3xl font-extrabold text-[var(--foreground)]">
              <AnimatedTotal value={data.total} currency={data.currency} />
            </p>
          </div>
          <AnimatePresence>
            {isVerified && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[var(--success)] shadow-soft"
              >
                <CheckCircle2 className="h-4 w-4" />
                Verified
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        variants={gridVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {FIELDS.map((field) => (
          <motion.div key={field.key} variants={fieldVariants} transition={{ duration: 0.25, ease: "easeOut" }}>
            <EditableField
              field={field}
              value={data[field.key]}
              edited={!!editedFields[field.key]}
              onChange={(value) => onEdit(field.key, value as InvoiceData[typeof field.key])}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/** Counts the total up from 0 on first paint / whenever it changes — a small
 * "the math is real" moment that reinforces the verified-JSON pitch. */
function AnimatedTotal({ value, currency }: { value: number | null; currency: string | null }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => formatCurrency(Math.round(v), currency));

  useEffect(() => {
    const controls = animate(motionValue, value ?? 0, {
      duration: 0.8,
      ease: "easeOut",
    });
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, currency]);

  if (value === null) return <>{formatCurrency(null, currency)}</>;
  return <motion.span>{rounded}</motion.span>;
}

function EditableField({
  field,
  value,
  edited,
  onChange,
}: {
  field: FieldConfig;
  value: unknown;
  edited: boolean;
  onChange: (value: string | number | null) => void;
}) {
  const displayValue = value === null || value === undefined ? "" : String(value);

  return (
    <div
      className={`rounded-xl border border-[var(--border)] ${field.tint} p-4 transition-transform duration-150 focus-within:scale-[1.015] focus-within:shadow-soft`}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-semibold text-[var(--muted)]">{field.label}</label>
        <AnimatePresence>
          {edited && (
            <motion.span
              initial={{ opacity: 0, scale: 0.7, x: 6 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex items-center gap-1 text-[10px] font-semibold text-[var(--secondary)]"
            >
              <PenLine className="h-3 w-3" />
              Edited manually
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <input
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        value={displayValue}
        onChange={(e) => {
          const raw = e.target.value;
          if (field.type === "number") {
            onChange(raw === "" ? null : Number(raw));
          } else {
            onChange(raw === "" ? null : raw);
          }
        }}
        placeholder="—"
        className="w-full rounded-lg border border-transparent bg-white/70 px-2.5 py-1.5 text-sm font-semibold text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:bg-white"
      />
    </div>
  );
}
