import assert from "node:assert/strict";
import test from "node:test";
import { createInterviewSession, reduceInterviewSession } from "../app/demo/interviewController.mjs";

test("倒數正確遞減且永遠不小於零", () => {
  const initial = createInterviewSession(3, 2);
  const oneSecond = reduceInterviewSession(initial, { type: "tick" });
  const zero = reduceInterviewSession(oneSecond, { type: "tick" });
  const afterZero = reduceInterviewSession(zero, { type: "tick" });
  assert.equal(oneSecond.remainingSeconds, 1);
  assert.equal(zero.remainingSeconds, 0);
  assert.equal(afterZero.remainingSeconds, 0);
});

test("歸零只提交一次並記錄 timeout 來源", () => {
  const initial = createInterviewSession(3, 1);
  const submitted = reduceInterviewSession(initial, { type: "tick" });
  const duplicate = reduceInterviewSession(submitted, { type: "tick" });
  assert.equal(submitted.submitted, true);
  assert.equal(submitted.submissionSource, "timeout");
  assert.strictEqual(duplicate, submitted);
});

test("切題與更新答案不會重置倒數", () => {
  const ticking = reduceInterviewSession(createInterviewSession(3, 4500), { type: "tick" });
  const switched = reduceInterviewSession(ticking, { type: "select-question", index: 1 });
  const answered = reduceInterviewSession(switched, { type: "update-answer", index: 1, answer: "SELECT 1" });
  assert.equal(switched.remainingSeconds, 4499);
  assert.equal(answered.remainingSeconds, 4499);
  assert.equal(answered.currentQuestion, 1);
  assert.equal(answered.answers[1], "SELECT 1");
});

test("手動提交後拒絕逾時重複提交、修改答案與再次提交", () => {
  const answered = reduceInterviewSession(createInterviewSession(3, 1), { type: "update-answer", index: 0, answer: "原答案" });
  const manual = reduceInterviewSession(answered, { type: "submit", source: "manual" });
  const timeout = reduceInterviewSession(manual, { type: "tick" });
  const edited = reduceInterviewSession(timeout, { type: "update-answer", index: 0, answer: "修改後" });
  const resubmitted = reduceInterviewSession(edited, { type: "submit", source: "manual" });
  assert.equal(manual.submissionSource, "manual");
  assert.strictEqual(timeout, manual);
  assert.strictEqual(edited, manual);
  assert.strictEqual(resubmitted, manual);
  assert.equal(resubmitted.answers[0], "原答案");
});
