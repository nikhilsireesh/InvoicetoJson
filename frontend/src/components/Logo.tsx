import { FileText } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const text = size === "sm" ? "text-base" : "text-lg";

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`relative flex ${box} items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white shadow-soft`}
        aria-hidden="true"
      >
        <FileText className="h-[55%] w-[55%]" strokeWidth={2.2} />
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-[var(--secondary)] shadow-soft">
          {"{ }"}
        </span>
      </span>
      <span className={`font-extrabold tracking-tight text-[var(--foreground)] ${text}`}>
        Invoice2JSON
      </span>
    </div>
  );
}
