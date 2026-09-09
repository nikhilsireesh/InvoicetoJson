import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Upload } from "lucide-react";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Security", href: "#security" },
];

export function Header({ onUploadClick }: { onUploadClick: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
        <a href="#top" className="flex items-center">
          <Logo />
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-[var(--primary)] transition-transform duration-200 ease-out group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <motion.button
            onClick={onUploadClick}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-soft"
          >
            <Upload className="h-4 w-4" />
            Upload Invoice
          </motion.button>
        </div>

        <button
          className="flex items-center justify-center rounded-lg p-2 text-[var(--foreground)] md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={open ? "close" : "open"}
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-[var(--border)] bg-white md:hidden"
          >
            <nav className="flex flex-col gap-3 px-5 py-4" aria-label="Mobile">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  className="text-sm font-medium text-[var(--muted)]"
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.button
                onClick={() => {
                  setOpen(false);
                  onUploadClick();
                }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: NAV_LINKS.length * 0.04 }}
                className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Upload className="h-4 w-4" />
                Upload Invoice
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
