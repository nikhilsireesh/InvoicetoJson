import { Router, type Request, type Response } from "express";
import { upload, handleUploadErrors } from "../middleware/uploadValidation.js";
import { extractInvoice, ExtractionError } from "../services/invoiceExtractor.js";
import { runVerification } from "../services/verificationService.js";
import { SAMPLE_INVOICE_DATA } from "../services/sampleInvoice.js";

export const extractRouter = Router();

/**
 * POST /api/extract
 * multipart/form-data, field name "invoice".
 *
 * Real pipeline (Section 20-30):
 *   upload -> validate file -> vision AI -> normalize -> schema validate
 *   -> financial verification -> respond
 *
 * The uploaded buffer lives only in memory for the duration of this
 * request (see middleware/uploadValidation.ts) and is never written to
 * disk or any store.
 */
extractRouter.post(
  "/extract",
  upload.single("invoice"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No invoice file was provided.",
      });
    }

    try {
      const data = await extractInvoice({
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
      });
      const verification = runVerification(data);

      return res.json({ success: true, data, verification });
    } catch (err) {
      if (err instanceof ExtractionError) {
        return res.status(422).json({ success: false, error: err.message });
      }
      console.error("Extraction failed:", err);
      return res.status(500).json({
        success: false,
        error: "We couldn't process this invoice. Please try again.",
      });
    }
  },
  handleUploadErrors
);

/**
 * GET /api/sample
 * Returns fixed demo data for the "Try Sample Invoice" button so the
 * product can be demoed offline, without burning a real AI call.
 */
extractRouter.get("/sample", (_req: Request, res: Response) => {
  const verification = runVerification(SAMPLE_INVOICE_DATA);
  return res.json({ success: true, data: SAMPLE_INVOICE_DATA, verification });
});
