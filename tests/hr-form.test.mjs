import assert from "node:assert/strict";
import test from "node:test";
import {
  hasRequiredCandidateFields,
  normalizeCandidateInput,
  validateCandidateForm,
} from "../app/flows/hr/hrLogic.mjs";

const validForm = {
  name: "陳怡安",
  email: "yian.chen@example.com",
  job: "Junior Data Analyst",
  lead: "王柏翰",
  due: "2099-01-01T10:00",
};

test("TC-FORM-001：缺少必填欄位時，逐一提示缺漏欄位", () => {
  assert.deepEqual(validateCandidateForm({ name: "", email: "", job: "", lead: "", due: "" }), [
    "請輸入候選人姓名。",
    "請輸入候選人 Email。",
    "請選擇應徵職缺。",
    "請選擇技術主管。",
    "請選擇面試期限。",
  ]);
  assert.equal(hasRequiredCandidateFields({ name: "", email: "", job: "", lead: "", due: "" }), false);
  assert.equal(hasRequiredCandidateFields(validForm), true);
  assert.deepEqual(validateCandidateForm(validForm), []);
});

test("TC-FORM-001：只留白姓名或 Email 仍會個別擋下", () => {
  assert.deepEqual(validateCandidateForm({ ...validForm, name: "   " }), ["請輸入候選人姓名。"]);
  assert.deepEqual(validateCandidateForm({ ...validForm, email: "   " }), ["請輸入候選人 Email。"]);
});

test("TC-FORM-002：Email 格式不正確時顯示明確錯誤", () => {
  assert.deepEqual(validateCandidateForm({ ...validForm, email: "not-an-email" }), ["請輸入有效的 Email 格式。"]);
  assert.deepEqual(validateCandidateForm({ ...validForm, email: "missing-domain@" }), ["請輸入有效的 Email 格式。"]);
});

test("面試期限必須晚於目前時間，否則顯示錯誤", () => {
  const now = Date.parse("2026-07-30T12:00:00+08:00");
  assert.deepEqual(validateCandidateForm({ ...validForm, due: "2026-07-30T11:00+08:00" }, now), [
    "面試期限必須晚於目前時間。",
  ]);
  assert.deepEqual(validateCandidateForm({ ...validForm, due: "2026-07-30T13:00+08:00" }, now), []);
});

test("正規化候選人輸入會去除前後空白並轉小寫 Email", () => {
  assert.deepEqual(
    normalizeCandidateInput({ name: "  陳怡安  ", email: "  Yian.Chen@Example.com ", job: "Junior Data Analyst", lead: "王柏翰", due: "2099-01-01T10:00" }),
    { candidate: "陳怡安", email: "yian.chen@example.com", job: "Junior Data Analyst", lead: "王柏翰", due: "2099-01-01 10:00" },
  );
});
