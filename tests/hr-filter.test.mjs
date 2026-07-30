import assert from "node:assert/strict";
import test from "node:test";
import { filterCandidates } from "../app/demoLogic.mjs";
import { getUniqueSortedField } from "../app/flows/hr/hrLogic.mjs";

const candidates = [
  { candidate: "陳怡安", email: "yian@example.com", job: "Junior Data Analyst", lead: "王柏翰", status: "等待人工審核" },
  { candidate: "林冠宇", email: "lin@example.com", job: "Backend Engineer", lead: "王柏翰", status: "等待面試者開始" },
  { candidate: "張雅婷", email: "chang@example.com", job: "Junior Data Analyst", lead: "李欣蓉", status: "作答中" },
  { candidate: "周子翔", email: "zixiang@example.com", job: "Data Engineer", lead: "王柏翰", status: "已完成" },
];

test("TC-FILTER-001：關鍵字、狀態與職缺同時成立才會顯示", () => {
  assert.deepEqual(
    filterCandidates(candidates, { query: "王柏翰", status: "等待人工審核", job: "Junior Data Analyst" }),
    [candidates[0]],
  );
  assert.deepEqual(filterCandidates(candidates, { query: "王柏翰", job: "Backend Engineer" }), [candidates[1]]);
});

test("TC-FILTER-001：任一條件不成立則回傳空陣列（Empty State 依據）", () => {
  assert.deepEqual(filterCandidates(candidates, { query: "王柏翰", job: "Data Engineer", status: "作答中" }), []);
  assert.deepEqual(filterCandidates(candidates, {}), candidates);
});

test("TC-FILTER-001：清除篩選等同回到未過濾清單", () => {
  const filtered = filterCandidates(candidates, { query: "王柏翰", status: "已完成", job: "Data Engineer" });
  assert.deepEqual(filtered, [candidates[3]]);
  assert.deepEqual(filterCandidates(candidates, { query: "", status: "", job: "" }), candidates);
});

test("職缺選單依候選人資料去重並排序", () => {
  assert.deepEqual(getUniqueSortedField(candidates, "job"), ["Backend Engineer", "Data Engineer", "Junior Data Analyst"]);
  assert.deepEqual(getUniqueSortedField(candidates, "lead"), ["李欣蓉", "王柏翰"]);
});
