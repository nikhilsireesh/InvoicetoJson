import { FileJson2 } from "lucide-react";

export function EmptyResults() {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-xl2 border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center">
      <span className="flex h-16 w-16 animate-floaty items-center justify-center rounded-2xl bg-white text-[var(--secondary)] shadow-soft">
        <FileJson2 className="h-8 w-8" />
      </span>
      <p className="mt-5 max-w-xs text-sm text-[var(--muted)]">
        Your extracted invoice data will appear here.
      </p>
    </div>
  );
}
