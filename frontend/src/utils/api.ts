import type { ExtractResponse } from "../types/invoice";

const API_BASE = "/api";

export async function extractInvoiceFile(file: File): Promise<ExtractResponse> {
  const formData = new FormData();
  formData.append("invoice", file);

  try {
    const res = await fetch(`${API_BASE}/extract`, {
      method: "POST",
      body: formData,
    });
    const json = (await res.json()) as ExtractResponse;
    return json;
  } catch {
    return {
      success: false,
      error: "We couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function fetchSampleInvoice(): Promise<ExtractResponse> {
  try {
    const res = await fetch(`${API_BASE}/sample`);
    const json = (await res.json()) as ExtractResponse;
    return json;
  } catch {
    return {
      success: false,
      error: "We couldn't load the sample invoice. Please try again.",
    };
  }
}
