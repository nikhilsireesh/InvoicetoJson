import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

const STEPS = [
  "Document uploaded",
  "Invoice structure detected",
  "Extracting financial information",
  "Reading line items",
  "Verifying calculations",
  "Preparing JSON",
];

// Purely cosmetic pacing for the step indicator — the real work happens
// server-side; this just gives the user a sense of progress while we wait.
const STEP_INTERVAL_MS = 900;

export function ProcessingState() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, STEP_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const progress = (activeStep / (STEPS.length - 1)) * 100;

  return (
    <div className="rounded-xl2 border border-[var(--border)] bg-white p-8 shadow-soft">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--secondary-light)] text-[var(--secondary)]">
          <Loader2 className="h-5 w-5 animate-spin" />
        </span>
        <div>
          <h3 className="font-semibold text-[var(--foreground)]">Analyzing invoice</h3>
          <p className="text-sm text-[var(--muted)]">This usually takes a few seconds.</p>
        </div>
      </div>

      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface)]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <ul className="space-y-3">
        {STEPS.map((step, idx) => {
          const done = idx < activeStep;
          const active = idx === activeStep;
          return (
            <motion.li
              key={step}
              animate={active ? { x: [0, 2, 0] } : {}}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 text-sm"
            >
              <span className="relative flex h-4.5 w-4.5 shrink-0 items-center justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  {done ? (
                    <motion.span
                      key="done"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="flex"
                    >
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-[var(--success)]" />
                    </motion.span>
                  ) : active ? (
                    <motion.span
                      key="active"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute h-2.5 w-2.5 animate-pulseSoft rounded-full bg-[var(--secondary)]"
                    />
                  ) : (
                    <motion.span
                      key="pending"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex"
                    >
                      <Circle className="h-4.5 w-4.5 shrink-0 text-[var(--border)]" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              <span
                className={
                  done
                    ? "font-medium text-[var(--foreground)]"
                    : active
                    ? "font-semibold text-[var(--secondary)]"
                    : "text-[var(--muted)]"
                }
              >
                {step}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
