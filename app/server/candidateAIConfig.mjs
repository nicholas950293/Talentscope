export const AI_LIMITS = Object.freeze({ inputCharacters: 2000, historyMessages: 8, contextCharacters: 8000, maxOutputTokens: 800, timeoutMs: 15000 });
export const AI_ERROR_CODES = Object.freeze(["invalid_request", "input_too_long", "timeout", "rate_limited", "provider_unavailable", "configuration_error", "safety_blocked", "unknown_error"]);

export function getCandidateAIConfig(env = process.env) {
  return {
    provider: env.AI_PROVIDER === "gemini" ? "gemini" : "mock",
    apiKey: env.GEMINI_API_KEY || "",
    model: env.GEMINI_MODEL || "",
    promptVersion: env.AI_PROMPT_VERSION || "v1",
  };
}
