import { AI_LIMITS } from "./candidateAIConfig.mjs";
import { SYSTEM_INSTRUCTION } from "./candidateAIPrompt.mjs";

const MOCK_REPLIES = ["Mock AI：可以先列出你目前的假設與需要驗證的條件，我們再一起檢查推論。", "Mock AI：試著把問題拆成輸入、輸出、限制與邊界案例，再說明你目前選擇的方法。"];

export function createServerMockAdapter() {
  return { provider: "mock", async ask({ candidateMessage, requestId, promptVersion }) { const seed = [...candidateMessage].reduce((sum, char) => sum + char.charCodeAt(0), 0); return { requestId, assistantMessage: MOCK_REPLIES[seed % MOCK_REPLIES.length], provider: "mock", modelVersion: "mock-v1", promptVersion, createdAt: new Date().toISOString() }; } };
}

export function mapGeminiError(error) {
  if (error?.name === "AbortError" || error?.code === "ABORT_ERR") return "timeout";
  const status = Number(error?.status || error?.code);
  const message = String(error?.message || "").toLowerCase();
  if (status === 429 || message.includes("quota") || message.includes("resource_exhausted")) return "rate_limited";
  if (status >= 500 && status <= 599) return "provider_unavailable";
  if (message.includes("safety") || message.includes("blocked")) return "safety_blocked";
  return "unknown_error";
}

function extractText(interaction) {
  if (typeof interaction?.text === "string") return interaction.text;
  const outputs = Array.isArray(interaction?.outputs) ? interaction.outputs : [];
  return outputs.flatMap(output => Array.isArray(output?.content) ? output.content : [output]).map(part => part?.text).filter(Boolean).join("\n");
}

export function createGeminiAdapter({ apiKey, model, promptVersion, clientFactory, timeoutMs = AI_LIMITS.timeoutMs } = {}) {
  return { provider: "gemini", async ask({ prompt, requestId }) {
    if (!apiKey || !model) throw Object.assign(new Error("Gemini configuration missing"), { appCode: "configuration_error" });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const client = clientFactory ? await clientFactory(apiKey) : new (await import("@google/genai")).GoogleGenAI({ apiKey });
      const providerRequest = client.interactions.create({ model, input: prompt, system_instruction: SYSTEM_INSTRUCTION, store: false, generation_config: { max_output_tokens: AI_LIMITS.maxOutputTokens } });
      const timeout = new Promise((_, reject) => controller.signal.addEventListener("abort", () => reject(Object.assign(new Error("Candidate AI timeout"), { name: "AbortError" })), { once: true }));
      const interaction = await Promise.race([providerRequest, timeout]);
      const assistantMessage = extractText(interaction).trim();
      if (!assistantMessage) throw Object.assign(new Error("Gemini response blocked or empty"), { appCode: "safety_blocked" });
      return { requestId, assistantMessage, provider: "gemini", modelVersion: model, promptVersion, createdAt: new Date().toISOString() };
    } catch (error) {
      if (error?.appCode) throw error;
      throw Object.assign(new Error("Candidate AI provider request failed"), { appCode: mapGeminiError(error) });
    } finally { clearTimeout(timer); }
  } };
}
