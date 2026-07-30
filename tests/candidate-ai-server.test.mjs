import test from "node:test";
import assert from "node:assert/strict";
import { handleCandidateAIRequest } from "../app/server/candidateAIHandler.mjs";
import { createGeminiAdapter, mapGeminiError } from "../app/server/candidateAIAdapters.mjs";
import { AI_LIMITS } from "../app/server/candidateAIConfig.mjs";
import { buildCandidatePrompt, sanitizeHistory } from "../app/server/candidateAIPrompt.mjs";
import { readFile } from "node:fs/promises";

const base = { interviewId: "interview-demo-001", questionId: 1, candidateMessage: "如何開始？", requestId: "req-1", history: [] };
const mockConfig = { provider: "mock", apiKey: "", model: "", promptVersion: "v1" };

test("server route handler 提供統一 request/response 契約且 Mock 不需要金鑰", async () => {
  const result = await handleCandidateAIRequest(base, { config: mockConfig });
  assert.equal(result.status, 200);
  assert.deepEqual(Object.keys(result.body).sort(), ["assistantMessage", "createdAt", "modelVersion", "promptVersion", "provider", "requestId"].sort());
  assert.equal(result.body.provider, "mock");
});

test("空白、過長、未知面試或題目在 provider 前被拒絕", async () => {
  assert.equal((await handleCandidateAIRequest({ ...base, candidateMessage: " " }, { config: mockConfig })).body.error.code, "invalid_request");
  assert.equal((await handleCandidateAIRequest({ ...base, candidateMessage: "x".repeat(AI_LIMITS.inputCharacters + 1) }, { config: mockConfig })).body.error.code, "input_too_long");
  assert.equal((await handleCandidateAIRequest({ ...base, interviewId: "other" }, { config: mockConfig })).body.error.code, "invalid_request");
  assert.equal((await handleCandidateAIRequest({ ...base, questionId: 999 }, { config: mockConfig })).body.error.code, "invalid_request");
});

test("history 僅保留同 interviewId/questionId 且有筆數上限", () => {
  const history = Array.from({ length: 12 }, (_, index) => ({ interviewId: index === 0 ? "other" : base.interviewId, questionId: index === 1 ? 2 : 1, role: "candidate", content: `m${index}`, status: "success" }));
  const safe = sanitizeHistory(history, base.interviewId, 1);
  assert.equal(safe.length, AI_LIMITS.historyMessages);
  assert.ok(safe.every(item => item.content !== "m0" && item.content !== "m1"));
});

test("prompt builder 只包含題目、有限歷史與候選人訊息", () => {
  const prompt = buildCandidatePrompt({ question: { title: "Q", type: "SQL", description: "D", detail: "T", example: "E" }, candidateMessage: "C", history: [{ role: "candidate", content: "H" }] });
  for (const allowed of ["Q", "D", "T", "E", "C", "H"]) assert.match(prompt, new RegExp(allowed));
  assert.doesNotMatch(prompt, /email|驗證碼|招募結果|HR/iu);
});

test("Gemini 缺少設定回傳 configuration_error", async () => {
  const result = await handleCandidateAIRequest(base, { config: { provider: "gemini", apiKey: "", model: "", promptVersion: "v1" } });
  assert.equal(result.body.error.code, "configuration_error");
});

test("Gemini Interactions 呼叫明確 store:false 且不使用 previous_interaction_id", async () => {
  let params;
  const adapter = createGeminiAdapter({ apiKey: "test-only", model: "gemini-2.5-flash", promptVersion: "v1", clientFactory: async () => ({ interactions: { create: async input => { params = input; return { outputs: [{ text: "ok" }] }; } } }) });
  const result = await adapter.ask({ prompt: "safe", requestId: "r" });
  assert.equal(result.provider, "gemini");
  assert.equal(params.store, false);
  assert.equal("previous_interaction_id" in params, false);
  assert.equal(params.tools, undefined);
});

test("Gemini timeout、429、5xx 與 safety error 正規化", () => {
  assert.equal(mapGeminiError({ name: "AbortError" }), "timeout");
  assert.equal(mapGeminiError({ status: 429 }), "rate_limited");
  assert.equal(mapGeminiError({ status: 503 }), "provider_unavailable");
  assert.equal(mapGeminiError({ message: "response blocked by safety" }), "safety_blocked");
});

test("錯誤回應不洩漏原始錯誤、stack 或 key", async () => {
  const adapter = { ask: async () => { throw Object.assign(new Error("secret-key stack"), { appCode: "provider_unavailable" }); } };
  const result = await handleCandidateAIRequest(base, { config: mockConfig, adapter });
  const serialized = JSON.stringify(result.body);
  assert.equal(result.body.error.code, "provider_unavailable");
  assert.doesNotMatch(serialized, /secret|stack|key/i);
});

test("Candidate 前端只呼叫專案 endpoint，不直接引用 Gemini SDK 或 key", async () => {
  const source = await readFile(new URL("../app/demo/candidateAIService.mjs", import.meta.url), "utf8");
  assert.match(source, /\/api\/candidate-ai/);
  assert.doesNotMatch(source, /@google\/genai|GEMINI_API_KEY|generativelanguage\.googleapis/i);
});
