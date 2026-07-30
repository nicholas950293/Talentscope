import test from "node:test";
import assert from "node:assert/strict";
import { questions } from "../app/mocks/data.ts";
import { filterQuestionBank, getPaperSummary, moveSelectedQuestion, toggleQuestionSelection, updateReviewerScore } from "../app/flows/tech/workflow.mjs";

test("TC-QBANK-001 關鍵字可搜尋題名、描述與技能", () => {
  assert.deepEqual(filterQuestionBank(questions, { query: "留存" }).map(question => question.id), [2]);
  assert.deepEqual(filterQuestionBank(questions, { query: "window function" }).map(question => question.id), [1]);
});

test("TC-QBANK-002 題型、難度、技能與關鍵字可複合篩選", () => {
  const result = filterQuestionBank(questions, { query: "資料", type: "技術問答", difficulty: "中等", skill: "資料分析" });
  assert.deepEqual(result.map(question => question.id), [8]);
});

test("TC-QBANK-003 題目選取不重複且可再次移除", () => {
  assert.deepEqual(toggleQuestionSelection([1, 2], 8), [1, 2, 8]);
  assert.deepEqual(toggleQuestionSelection([1, 2, 8], 2), [1, 8]);
});

test("TC-BUILDER-001 組卷排序維持題目集合並保護邊界", () => {
  assert.deepEqual(moveSelectedQuestion([1, 2, 8], 1, -1), [2, 1, 8]);
  const original = [1, 2, 8];
  assert.equal(moveSelectedQuestion(original, 0, -1), original);
});

test("TC-BUILDER-002 組卷摘要正確計算類型與估時", () => {
  const summary = getPaperSummary(questions, [1, 5, 8]);
  assert.equal(summary.count, 3);
  assert.equal(summary.totalMinutes, 75);
  assert.deepEqual(summary.typeCounts, { SQL: 1, 程式設計: 1, 技術問答: 1 });
});

test("TC-BUILDER-003 空試卷不可建立邀請", () => {
  const summary = getPaperSummary(questions, []);
  assert.equal(summary.canCreateInvite, false);
  assert.equal(summary.totalMinutes, 0);
});

test("TC-REVIEW-001 題目資料維持固定順序供逐題切換", () => {
  assert.deepEqual(getPaperSummary(questions, [1, 2, 8]).selected.map(question => question.id), [1, 2, 8]);
});

test("TC-REVIEW-002 人工分數更新不改動 AI 初評來源且限制 1 到 5", () => {
  const aiScores = Object.freeze([4, 4, 3, 4, 2, 4]);
  assert.deepEqual(updateReviewerScore(aiScores, 2, 5), [4, 4, 5, 4, 2, 4]);
  assert.deepEqual(aiScores, [4, 4, 3, 4, 2, 4]);
  assert.equal(updateReviewerScore(aiScores, 2, 6), aiScores);
});
