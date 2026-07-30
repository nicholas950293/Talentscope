import assert from "node:assert/strict";
import test from "node:test";
import { getAnswerProgress } from "../app/demoLogic.mjs";
import { createAIConversationState, reduceAIConversation } from "../app/demo/aiConversation.mjs";
import { createInterviewSession, reduceInterviewSession } from "../app/demo/interviewController.mjs";
import { createMockCandidateAIService, isMockGuidanceSafe } from "../app/demo/mockCandidateAIService.mjs";
import { shouldSendAIMessageFromKeyboard, validateCandidateCredentials } from "../app/flows/candidate/candidateWorkflow.mjs";

const expectedCredentials = { email: "yian.chen@example.com", code: "482916" };

test("TC-VERIFY-001：正確 Demo Email 與驗證碼可通過", () => {
  assert.deepEqual(
    validateCandidateCredentials({ email: " YIAN.CHEN@example.com ", code: "482916" }, expectedCredentials),
    { valid: true, error: "" },
  );
});

test("TC-VERIFY-002：錯誤或格式不符的資料會回傳明確錯誤", () => {
  assert.equal(validateCandidateCredentials({ email: "wrong@example.com", code: "482916" }, expectedCredentials).valid, false);
  assert.equal(validateCandidateCredentials({ email: "not-an-email", code: "12" }, expectedCredentials).error, "Email 或驗證碼格式不正確。");
  assert.equal(validateCandidateCredentials({ email: "", code: "" }, expectedCredentials).error, "請輸入 Email 與 6 位數驗證碼。");
});

test("TC-ANSWER-001～003：切題保留答案、完成度與未作答清單正確", () => {
  let session = createInterviewSession(3, 4500);
  session = reduceInterviewSession(session, { type: "update-answer", index: 0, answer: "SELECT 1" });
  session = reduceInterviewSession(session, { type: "select-question", index: 2 });
  session = reduceInterviewSession(session, { type: "update-answer", index: 2, answer: "  " });
  assert.equal(session.answers[0], "SELECT 1");
  assert.deepEqual(getAnswerProgress(session.answers, ["第一題", "第二題", "第三題"]), {
    completedCount: 1,
    incompleteCount: 2,
    incompleteIndexes: [1, 2],
    incompleteQuestions: ["第二題", "第三題"],
  });
  assert.strictEqual(reduceInterviewSession(session, { type: "select-question", index: 99 }), session);
});

test("TC-TIMER-001～002：切題與輸入不重置倒數，逾時只提交一次", () => {
  const ticking = reduceInterviewSession(createInterviewSession(3, 2), { type: "tick" });
  const switched = reduceInterviewSession(ticking, { type: "select-question", index: 1 });
  const answered = reduceInterviewSession(switched, { type: "update-answer", index: 1, answer: "思路" });
  const timedOut = reduceInterviewSession(answered, { type: "tick" });
  assert.equal(answered.remainingSeconds, 1);
  assert.equal(timedOut.submissionSource, "timeout");
  assert.strictEqual(reduceInterviewSession(timedOut, { type: "tick" }), timedOut);
});

test("TC-AI-001～006：鍵盤傳送條件、pending、隔離、延遲回覆、重試與提交鎖定", () => {
  assert.equal(shouldSendAIMessageFromKeyboard({ key: "Enter", shiftKey: false, isComposing: false }), true);
  assert.equal(shouldSendAIMessageFromKeyboard({ key: "Enter", shiftKey: true, isComposing: false }), false);
  assert.equal(shouldSendAIMessageFromKeyboard({ key: "Enter", shiftKey: false, isComposing: true }), false);

  let state = createAIConversationState();
  state = reduceAIConversation(state, { type: "begin", interviewId: "demo", questionId: 1, content: "第一題", requestId: "r1", createdAt: "t1" });
  const pending = state;
  assert.strictEqual(reduceAIConversation(state, { type: "begin", interviewId: "demo", questionId: 1, content: "重複", requestId: "r2", createdAt: "t2" }), pending);
  state = reduceAIConversation(state, { type: "begin", interviewId: "demo", questionId: 2, content: "第二題", requestId: "r2", createdAt: "t2" });
  state = reduceAIConversation(state, { type: "resolve", requestId: "r1", content: "第一題回覆", createdAt: "t3" });
  assert.equal(state.messages.find(message => message.requestId === "r1" && message.role === "assistant").questionId, 1);
  state = reduceAIConversation(state, { type: "fail", requestId: "r2", errorCode: "MOCK_AI_ERROR", createdAt: "t3" });
  const messageCount = state.messages.length;
  state = reduceAIConversation(state, { type: "retry", requestId: "r2", createdAt: "t4" });
  assert.equal(state.messages.length, messageCount);
  const locked = reduceAIConversation(state, { type: "lock" });
  assert.strictEqual(reduceAIConversation(locked, { type: "resolve", requestId: "r2", content: "延遲回覆", createdAt: "t5" }), locked);
});

test("TC-HINT-002：Mock AI 回覆護欄拒絕完整答案型內容", async () => {
  assert.equal(isMockGuidanceSafe("先列出輸入、輸出與邊界條件。"), true);
  assert.equal(isMockGuidanceSafe("完整答案：SELECT * FROM candidates"), false);
  const service = createMockCandidateAIService({ latencyMs: 0, shouldFail: () => false });
  const response = await service.ask({ interviewId: "demo", questionId: 1, questionTitle: "題目", content: "請協助釐清", requestId: "r1" });
  assert.equal(isMockGuidanceSafe(response.content), true);
});
