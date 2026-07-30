export function createCandidateAIService({ fetchImpl = fetch } = {}) {
  return { provider: "endpoint", async getMode() { const response = await fetchImpl("/api/candidate-ai"); return response.json(); }, async ask(input) {
    const response = await fetchImpl("/api/candidate-ai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input) });
    const body = await response.json();
    if (!response.ok) throw Object.assign(new Error(body?.error?.message || "AI request failed"), { code: body?.error?.code || "unknown_error" });
    return body;
  } };
}
