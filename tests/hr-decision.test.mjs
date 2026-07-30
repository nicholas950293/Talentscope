import assert from "node:assert/strict";
import test from "node:test";
import { RECRUITMENT_RESULTS, buildRecruitmentDecision } from "../app/flows/hr/hrLogic.mjs";

test("TC-DECISION-001：只允許三種合法招募結果，決策者固定為 HR", () => {
  assert.deepEqual(RECRUITMENT_RESULTS, ["通過", "不通過", "待討論"]);
  const now = Date.parse("2026-07-30T18:00:00+08:00");
  for (const result of RECRUITMENT_RESULTS) {
    const decision = buildRecruitmentDecision(result, now);
    assert.equal(decision.result, result);
    assert.equal(decision.decidedBy, "HR");
    assert.equal(decision.decidedAt, new Date(now).toISOString());
  }
});

test("TC-DECISION-001：AI 或其他非人工來源的結果不得被接受", () => {
  assert.throws(() => buildRecruitmentDecision("AI 自動通過"), /不支援的招募結果/);
  assert.throws(() => buildRecruitmentDecision(""), /不支援的招募結果/);
  assert.throws(() => buildRecruitmentDecision(undefined), /不支援的招募結果/);
});
