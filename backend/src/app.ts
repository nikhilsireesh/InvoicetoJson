import "dotenv/config";
import express from "express";
import cors from "cors";
import { extractRouter } from "./routes/extract.js";

export const app = express();

const allowedOrigins = new Set(
  [
    "http://localhost:5173",
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim()) : []),
  ]
);

// Vite falls back to the next free port (5174, 5175, ...) whenever 5173 is
// already taken by another running instance, which otherwise trips CORS for
// no reason a developer would expect. Allow any localhost/127.0.0.1 port in
// non-production so a busy port doesn't look like a broken app.
const isLocalDevOrigin = (origin: string) =>
  process.env.NODE_ENV !== "production" && /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

app.use(
  // Using the options-delegate form (a function of (req, callback) instead
  // of a static object) so we can compare the Origin header against the
  // request's own Host — deployed on Vercel, frontend and API share one
  // origin, but the browser still sends an Origin header on same-origin
  // multipart/fetch requests, and a static allowlist would reject it.
  cors((req, callback) => {
    const origin = req.headers.origin;
    let sameOrigin = false;
    if (origin) {
      try {
        sameOrigin = new URL(origin).host === req.headers.host;
      } catch {
        sameOrigin = false;
      }
    }
    const allowed =
      !origin || sameOrigin || allowedOrigins.has(origin) || isLocalDevOrigin(origin);
    callback(allowed ? null : new Error("Not allowed by CORS"), { origin: allowed });
  })
);

app.get("/api/health", (_req, res) => {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
  const aiConfigured =
    provider === "gemini" ? !!process.env.GEMINI_API_KEY : !!process.env.OPENAI_API_KEY;
  res.json({ ok: true, provider, aiConfigured });
});

app.use("/api", extractRouter);

// Centralized fallback error handler — never leak stack traces to clients.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, error: "Something went wrong on our end." });
});
