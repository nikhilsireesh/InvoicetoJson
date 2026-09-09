import { motion } from "framer-motion";
import { AlertOctagon } from "lucide-react";

export function ErrorState({
  message,
  onRetry,
  onStartOver,
}: {
  message: string;
  onRetry: () => void;
  onStartOver: () => void;
}) {
  return (
    <div className="rounded-xl2 border border-[var(--danger)]/25 bg-[var(--danger-light)] p-8 text-center">
      <motion.span
        initial={{ x: 0 }}
        animate={{ x: [0, -6, 6, -4, 4, 0] }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--danger)] shadow-soft"
      >
        <AlertOctagon className="h-7 w-7" />
      </motion.span>
      <p className="mt-4 font-semibold text-[var(--foreground)]">{message}</p>
      <div className="mt-6 flex justify-center gap-3">
        <motion.button
          onClick={onRetry}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className="rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Try again
        </motion.button>
        <motion.button
          onClick={onStartOver}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className="rounded-full border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--foreground)]"
        >
          Start New Invoice
        </motion.button>
      </div>
    </div>
  );
}
