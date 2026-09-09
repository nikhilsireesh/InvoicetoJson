import multer from "multer";
import type { Request, Response, NextFunction } from "express";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "application/pdf",
]);

const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".pdf"]);

function extensionOf(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx === -1 ? "" : filename.slice(idx).toLowerCase();
}

// Store the file in memory only — we never persist uploaded invoices to disk.
// The buffer is used once for extraction and then discarded when the
// request completes (nothing writes it anywhere durable).
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    const extOk = ALLOWED_EXTENSIONS.has(extensionOf(file.originalname));
    const mimeOk = ALLOWED_MIME_TYPES.has(file.mimetype);
    if (!extOk || !mimeOk) {
      cb(new Error("UNSUPPORTED_FILE_TYPE"));
      return;
    }
    cb(null, true);
  },
});

/**
 * Translates multer / fileFilter errors into the same
 * { success: false, error } shape the rest of the API uses,
 * instead of letting a raw stack trace reach the client.
 */
export function handleUploadErrors(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        error: "File is too large. Maximum size is 10 MB.",
      });
    }
    return res.status(400).json({
      success: false,
      error: "We couldn't process this upload. Please try again.",
    });
  }

  if (err instanceof Error && err.message === "UNSUPPORTED_FILE_TYPE") {
    return res.status(400).json({
      success: false,
      error: "Unsupported file type. Please upload PNG, JPG, JPEG or PDF.",
    });
  }

  console.error("Unhandled upload error:", err);
  return res.status(500).json({
    success: false,
    error: "We couldn't process this invoice. Please try again.",
  });
}
