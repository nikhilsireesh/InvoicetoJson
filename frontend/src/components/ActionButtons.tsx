import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

export function StartNewInvoiceButton({ onReset }: { onReset: () => void }) {
  return (
    <motion.button
      onClick={onReset}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96, rotate: -8 }}
      className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--muted)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      Start New Invoice
    </motion.button>
  );
}
