import assert from "node:assert/strict";
import test from "node:test";
import {
  canSendAIMessage,
  createAIConversationState,
  messagesForQuestion,
  reduceAIConversation,
} from "../app/interview/aiConversation.mjs";
import { createMockCandidateAIService } from "../app/mocks/mockCandidateAIService.mjs";

const begin = (state, overrides = {}) => reduceAIConversation(state, {
  type: "begin",
  interviewId: "interview-demo-001",
  questionId: 101,
  content: "我目前卡在資料關係。",
  requestId: "request-1",
  createdAt: "2026-07-30T10:00:00.000Z",
  ...overrides,
});

test("空白訊息不可傳送，送出後同題 pending 期間不可重複傳送", () => {
  const initial = createAIConversationState();
  assert.equal(canSendAIMessage(initial, 101, "   "), false);
  const pending = begin(initial);
  assert.equal(pending.messages.length, 2);
  assert.equal(canSendAIMessage(pending, 101, "另一則訊息"), false);
  assert.strictEqual(begin(pending, { requestId: "request-2" }), pending);
});

test("每題對話互相隔離，延遲回覆仍寫回原題", () => {
  let state = begin(createAIConversationState());
  state = begin(state, { questionId: 102, requestId: "request-2", content: "第二題的問題" });
  state = reduceAIConversation(state, { type: "resolve", requestId: "request-1", content: "第一題回覆", createdAt: "2026-07-30T10:00:01.000Z" });
  assert.equal(messagesForQuestion(state, 101).at(-1).content, "第一題回覆");
  assert.equal(messagesForQuestion(state, 102).at(-1).status, "pending");
});

test("成功、失敗與重試保留原 candidate message 且不重複建立", () => {
  let state = begin(createAIConversationState());
  state = reduceAIConversation(state, { type: "fail", requestId: "request-1", errorCode: "MOCK_AI_ERROR", createdAt: "2026-07-30T10:00:01.000Z" });
  assert.equal(state.messages.at(-1).status, "error");
  const countBeforeRetry = state.messages.length;
  state = reduceAIConversation(state, { type: "retry", requestId: "request-1", createdAt: "2026-07-30T10:00:02.000Z" });
  assert.equal(state.messages.length, countBeforeRetry);
  assert.equal(state.messages.at(-1).status, "pending");
  state = reduceAIConversation(state, { type: "resolve", requestId: "request-1", content: "重試成功", createdAt: "2026-07-30T10:00:03.000Z" });
  assert.equal(state.messages.at(-1).content, "重試成功");
});

test("面試提交鎖定後不得新增訊息、重試或接受延遲回覆", () => {
  const pending = begin(createAIConversationState());
  const locked = reduceAIConversation(pending, { type: "lock" });
  assert.equal(canSendAIMessage(locked, 101, "還想詢問"), false);
  assert.strictEqual(begin(locked, { requestId: "request-2" }), locked);
  assert.strictEqual(reduceAIConversation(locked, { type: "resolve", requestId: "request-1", content: "太晚的回覆" }), locked);
});

test("Mock AI service 支援成功與可控錯誤", async () => {
  const service = createMockCandidateAIService({ latencyMs: 0 });
  const input = { interviewId: "interview-demo-001", questionId: 101, questionTitle: "測試題", content: "請幫我釐清題意", requestId: "request-1" };
  const response = await service.ask(input);
  assert.match(response.content, /^Mock AI：/);
  await assert.rejects(() => service.ask({ ...input, content: "模擬錯誤" }), /Mock AI request failed/);
});
