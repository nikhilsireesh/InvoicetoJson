import { useState } from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, Maximize2, FileText } from "lucide-react";

export function InvoicePreview({
  previewUrl,
  fileName,
  isPdf,
}: {
  previewUrl: string | null;
  fileName: string;
  isPdf: boolean;
}) {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="rounded-xl2 border border-[var(--border)] bg-white p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Invoice preview</h3>
        {!isPdf && previewUrl && (
          <div className="flex items-center gap-1">
            <motion.button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              aria-label="Zoom out"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            >
              <ZoomOut className="h-4 w-4" />
            </motion.button>
            <motion.button
              onClick={() => setZoom(1)}
              aria-label="Fit to screen"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            >
              <Maximize2 className="h-4 w-4" />
            </motion.button>
            <motion.button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
              aria-label="Zoom in"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            >
              <ZoomIn className="h-4 w-4" />
            </motion.button>
          </div>
        )}
      </div>

      <div className="flex max-h-[420px] items-center justify-center overflow-auto rounded-lg bg-[var(--surface)] p-3">
        {isPdf ? (
          <div className="flex flex-col items-center gap-2 py-16 text-[var(--muted)]">
            <FileText className="h-10 w-10 text-[var(--primary)]" />
            <p className="text-sm font-medium text-[var(--foreground)]">{fileName}</p>
            <p className="text-xs">PDF preview renders inline once processed</p>
          </div>
        ) : previewUrl ? (
          <img
            src={previewUrl}
            alt={`Preview of ${fileName}`}
            style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
            className="max-w-full rounded-md transition-transform duration-200"
          />
        ) : null}
      </div>
    </div>
  );
}
