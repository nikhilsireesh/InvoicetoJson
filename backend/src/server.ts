import { app } from "./app.js";

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Invoice2JSON API listening on http://localhost:${PORT}`);
  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "⚠ OPENAI_API_KEY is not set. Real invoice extraction will fail until it is configured in backend/.env"
    );
  }
});
