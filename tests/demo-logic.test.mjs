import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERVIEW_STATUSES,
  canTransitionInterviewStatus,
  claimSubmission,
  filterCandidates,
  getAnswerProgress,
  isLegalInterviewStatus,
} from "../app/demoLogic.mjs";

const candidates = [
  { candidate: "陳怡安", email: "yian@example.com", job: "Junior Data Analyst", lead: "王柏翰", status: "等待人工審核" },
  { candidate: "林冠宇", email: "lin@example.com", job: "Backend Engineer", lead: "王柏翰", status: "等待面試者開始" },
  { candidate: "張雅婷", email: "chang@example.com", job: "Junior Data Analyst", lead: "李欣蓉", status: "作答中" },
];

test("候選人關鍵字、狀態與職缺可以複合篩選", () => {
  assert.deepEqual(
    filterCandidates(candidates, { query: "王柏翰", status: "等待人工審核", job: "Junior Data Analyst" }),
    [candidates[0]],
  );
  assert.deepEqual(filterCandidates(candidates, { query: "不存在", job: "Junior Data Analyst" }), []);
});

test("答題完成度會忽略只有空白的答案並列出未作答題目", () => {
  assert.deepEqual(getAnswerProgress(["SELECT 1", "  ", "分析內容"], ["SQL 一", "SQL 二", "問答"]), {
    completedCount: 2,
    incompleteCount: 1,
    incompleteIndexes: [1],
    incompleteQuestions: ["SQL 二"],
  });
});

test("合法狀態固定為九種且只允許定義的轉換", () => {
  assert.equal(INTERVIEW_STATUSES.length, 9);
  assert.ok(INTERVIEW_STATUSES.every(isLegalInterviewStatus));
  assert.equal(isLegalInterviewStatus("審核完成"), false);
  assert.equal(canTransitionInterviewStatus("等待面試者開始", "作答中"), true);
  assert.equal(canTransitionInterviewStatus("已提交", "作答中"), false);
});

test("手動與逾時提交使用相同單次提交保護", () => {
  const manual = claimSubmission(false, "manual");
  assert.deepEqual(manual, { shouldSubmit: true, submitted: true, source: "manual" });
  assert.deepEqual(claimSubmission(manual.submitted, "timeout"), {
    shouldSubmit: false,
    submitted: true,
    source: "timeout",
  });
  assert.equal(claimSubmission(false, "timeout").shouldSubmit, true);
});
