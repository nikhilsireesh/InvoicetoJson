import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UploadCloud, FileText, X, Sparkles, ShieldCheck } from "lucide-react";
import { formatFileSize } from "../utils/format";

interface Props {
  file: File | null;
  onSelectFile: (file: File) => void;
  onRemove: () => void;
  onChangeFile: () => void;
  onExtract: () => void;
}

export function UploadZone({ file, onSelectFile, onRemove, onChangeFile, onExtract }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files?.[0];
      if (dropped) onSelectFile(dropped);
    },
    [onSelectFile]
  );

  const openPicker = () => inputRef.current?.click();

  return (
    <AnimatePresence mode="wait" initial={false}>
      {file ? (
        <motion.div
          key="attached"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="rounded-xl2 border border-[var(--border)] bg-white p-6 shadow-soft"
        >
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]"
            >
              <FileText className="h-6 w-6" />
            </motion.div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-[var(--foreground)]">{file.name}</p>
              <p className="mt-0.5 text-sm text-[var(--muted)]">
                {file.type || "Unknown type"} · {formatFileSize(file.size)}
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--success-light)] px-2.5 py-1 text-xs font-semibold text-[var(--success)]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Ready to analyze
              </span>
            </div>
            <motion.button
              onClick={onRemove}
              aria-label="Remove file"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="rounded-lg p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--danger)]"
            >
              <X className="h-4.5 w-4.5" />
            </motion.button>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <motion.button
              onClick={onExtract}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="group flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-5 py-3 text-sm font-semibold text-white shadow-lift"
            >
              <Sparkles className="h-4 w-4" />
              Extract Invoice
            </motion.button>
            <motion.button
              onClick={onChangeFile}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              Change file
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div
            role="button"
            tabIndex={0}
            onClick={openPicker}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openPicker()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            aria-label="Upload invoice: drop a file here or press Enter to browse"
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl2 border-2 border-dashed px-6 py-14 text-center transition-all duration-200 ${
              isDragging
                ? "scale-[1.01] border-[var(--primary)] bg-gradient-to-br from-[var(--primary-light)] to-[var(--secondary-light)]"
                : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)]/40"
            }`}
          >
            <motion.span
              animate={isDragging ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[var(--primary)] shadow-soft"
            >
              <UploadCloud className="h-8 w-8" />
            </motion.span>
            <p className="mt-5 text-base font-semibold text-[var(--foreground)]">
              Drop your invoice here
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">or browse files</p>
            <p className="mt-4 text-xs text-[var(--muted)]">PNG, JPG, JPEG or PDF · Maximum 10 MB</p>

            <input
              ref={inputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) onSelectFile(selected);
                e.target.value = "";
              }}
            />
          </div>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[var(--muted)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure document processing · API credentials remain server-side
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
