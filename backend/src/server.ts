import "dotenv/config";
import express from "express";
import cors from "cors";
import { extractRouter } from "./routes/extract.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

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
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin) || isLocalDevOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, aiConfigured: !!process.env.OPENAI_API_KEY });
});

app.use("/api", extractRouter);

// Centralized fallback error handler — never leak stack traces to clients.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, error: "Something went wrong on our end." });
});

app.listen(PORT, () => {
  console.log(`Invoice2JSON API listening on http://localhost:${PORT}`);
  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "⚠ OPENAI_API_KEY is not set. Real invoice extraction will fail until it is configured in backend/.env"
    );
  }
});
