import { AI_LIMITS, getCandidateAIConfig } from "./candidateAIConfig.mjs";
import { createGeminiAdapter, createServerMockAdapter } from "./candidateAIAdapters.mjs";
import { buildCandidatePrompt, sanitizeHistory } from "./candidateAIPrompt.mjs";
import { getInterviewQuestion } from "./questionCatalog.mjs";

const statusByCode = { invalid_request: 400, input_too_long: 413, timeout: 504, rate_limited: 429, provider_unavailable: 503, configuration_error: 503, safety_blocked: 422, unknown_error: 500 };
export const errorBody = code => ({ error: { code, message: { invalid_request: "請求內容不正確。", input_too_long: "訊息超過允許長度。", timeout: "AI 回覆逾時，請稍後重試。", rate_limited: "AI 使用量已達限制，請稍後重試。", provider_unavailable: "AI 服務暫時無法使用。", configuration_error: "AI 服務尚未完成設定。", safety_blocked: "此內容無法由 AI 回覆。", unknown_error: "AI 發生未預期錯誤。" }[code] } });

export async function handleCandidateAIRequest(body, options = {}) {
  const requestId = typeof body?.requestId === "string" && body.requestId ? body.requestId : crypto.randomUUID();
  const interviewId = body?.interviewId;
  const questionId = Number(body?.questionId);
  const candidateMessage = typeof body?.candidateMessage === "string" ? body.candidateMessage.trim() : "";
  if (typeof interviewId !== "string" || !Number.isInteger(questionId) || !candidateMessage) return { status: 400, body: errorBody("invalid_request") };
  if (candidateMessage.length > AI_LIMITS.inputCharacters) return { status: 413, body: errorBody("input_too_long") };
  const question = (options.getQuestion || getInterviewQuestion)(interviewId, questionId);
  if (!question) return { status: 400, body: errorBody("invalid_request") };
  const history = sanitizeHistory(body.history, interviewId, questionId);
  const config = options.config || getCandidateAIConfig(options.env);
  const prompt = buildCandidatePrompt({ question, candidateMessage, history });
  const adapter = options.adapter || (config.provider === "gemini" ? createGeminiAdapter({ apiKey: config.apiKey, model: config.model, promptVersion: config.promptVersion, clientFactory: options.clientFactory, timeoutMs: options.timeoutMs }) : createServerMockAdapter());
  try { return { status: 200, body: await adapter.ask({ prompt, candidateMessage, requestId, promptVersion: config.promptVersion }) }; }
  catch (error) { const code = statusByCode[error?.appCode] ? error.appCode : "unknown_error"; return { status: statusByCode[code], body: errorBody(code) }; }
}
