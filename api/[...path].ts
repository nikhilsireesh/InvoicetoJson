// Vercel serverless entry point. Any request under /api/* (e.g.
// /api/extract, /api/sample) is routed here and handed straight to the
// same Express app used for local dev, so routing/validation/verification
// logic never has to be duplicated between environments.
import { app } from "../backend/src/app.js";

export default app;
