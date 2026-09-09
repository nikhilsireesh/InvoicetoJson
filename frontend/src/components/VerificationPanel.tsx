import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { VerificationResult } from "../types/invoice";

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0 },
};

export function VerificationPanel({ verification }: { verification: VerificationResult }) {
  const isVerified = verification.status === "VERIFIED";

  return (
    <div className="rounded-xl2 border border-[var(--border)] bg-white p-6 shadow-soft">
      <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">Invoice Verification</h3>

      <motion.ul
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="space-y-2.5"
      >
        {verification.checks.map((check) => (
          <motion.li
            key={check.id}
            variants={itemVariants}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex items-start gap-2.5 text-sm"
          >
            {check.passed ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}
                className="mt-0.5 flex shrink-0"
              >
                <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
              </motion.span>
            ) : check.severity === "error" ? (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger)]" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" />
            )}
            <span className={check.passed ? "text-[var(--foreground)]" : "text-[var(--muted)]"}>
              {check.label}
              {!check.passed && check.detail && (
                <span className="block text-xs text-[var(--muted)]">{check.detail}</span>
              )}
            </span>
          </motion.li>
        ))}
      </motion.ul>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: verification.checks.length * 0.06 }}
        className={`mt-5 flex items-center gap-3 rounded-xl border px-4 py-3.5 ${
          isVerified
            ? "border-[var(--success)]/25 bg-[var(--success-light)]"
            : "border-[var(--warning)]/25 bg-[var(--warning-light)]"
        }`}
      >
        {isVerified ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--success)]" />
        ) : (
          <AlertTriangle className="h-5 w-5 shrink-0 text-[var(--warning)]" />
        )}
        <div>
          <p
            className={`text-sm font-bold ${
              isVerified ? "text-[var(--success)]" : "text-[var(--warning)]"
            }`}
          >
            {isVerified ? "Invoice Verified" : "Needs Review"}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {isVerified
              ? "Financial checks passed."
              : "Some fields or calculations need a second look."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
