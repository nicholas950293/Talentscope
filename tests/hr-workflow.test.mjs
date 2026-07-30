import assert from "node:assert/strict";
import test from "node:test";
import { filterCandidates } from "../app/demoLogic.mjs";
import {
  buildCandidateRecord,
  generateInterviewCode,
  generateInterviewUrl,
  hasRequiredCandidateFields,
  validateCandidateForm,
} from "../app/flows/hr/hrLogic.mjs";

const seedCandidates = [
  { candidate: "陳怡安", email: "yian.chen@example.com", job: "Junior Data Analyst", lead: "王柏翰", due: "2026/08/02 23:59", code: "482916", url: "talentscope.demo/i/DA-260801", status: "等待人工審核" },
];

test("TC-HR-001：HR Happy Path 在純邏輯層完整成立（新增候選人→列表可見）", () => {
  const now = Date.parse("2026-07-30T09:00:00+08:00");
  const form = { name: "林冠宇", email: "Kuanyu.Lin@Example.com", job: "Backend Engineer", lead: "王柏翰", due: "2026-08-05T18:00" };

  assert.equal(hasRequiredCandidateFields(form), true);
  assert.deepEqual(validateCandidateForm(form, now), []);

  const record = buildCandidateRecord(form, {
    code: generateInterviewCode(() => 0.5),
    url: generateInterviewUrl(now),
  });

  assert.deepEqual(record, {
    candidate: "林冠宇",
    email: "kuanyu.lin@example.com",
    job: "Backend Engineer",
    lead: "王柏翰",
    due: "2026-08-05 18:00",
    code: "550000",
    url: `talentscope.demo/i/${now}`,
    status: "草稿",
  });

  const nextCandidates = [record, ...seedCandidates];
  assert.deepEqual(filterCandidates(nextCandidates, { query: "林冠宇" }), [record]);
  assert.deepEqual(filterCandidates(nextCandidates, { job: "Junior Data Analyst" }), seedCandidates);
});

test("無效資料不會被納入建立流程（必填缺漏會擋在驗證階段）", () => {
  const invalidForm = { name: "", email: "not-an-email", job: "", lead: "", due: "" };
  const errors = validateCandidateForm(invalidForm);
  assert.ok(errors.length > 0);
  assert.equal(hasRequiredCandidateFields(invalidForm), false);
});
