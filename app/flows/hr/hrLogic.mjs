export const RECRUITMENT_RESULTS = ["通過", "不通過", "待討論"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readCandidateForm(form) {
  return {
    name: (form.name ?? "").trim(),
    email: (form.email ?? "").trim(),
    job: form.job ?? "",
    lead: form.lead ?? "",
    due: form.due ?? "",
  };
}

export function hasRequiredCandidateFields(form) {
  const { name, email, job, lead, due } = readCandidateForm(form);
  return Boolean(name && email && job && lead && due);
}

export function validateCandidateForm(form, now = Date.now()) {
  const { name, email, job, lead, due } = readCandidateForm(form);
  const errors = [];
  if (!name) errors.push("請輸入候選人姓名。");
  if (!email) errors.push("請輸入候選人 Email。");
  else if (!EMAIL_PATTERN.test(email)) errors.push("請輸入有效的 Email 格式。");
  if (!job) errors.push("請選擇應徵職缺。");
  if (!lead) errors.push("請選擇技術主管。");
  if (!due) errors.push("請選擇面試期限。");
  else if (new Date(due).getTime() <= now) errors.push("面試期限必須晚於目前時間。");
  return errors;
}

export function normalizeCandidateInput(form) {
  const { name, email, job, lead, due } = readCandidateForm(form);
  return {
    candidate: name,
    email: email.toLowerCase(),
    job,
    lead,
    due: due.replace("T", " "),
  };
}

export function generateInterviewCode(random = Math.random) {
  return String(Math.floor(100000 + random() * 900000));
}

export function generateInterviewUrl(now = Date.now()) {
  return `talentscope.demo/i/${now}`;
}

export function buildCandidateRecord(form, meta) {
  return {
    ...normalizeCandidateInput(form),
    code: meta.code,
    url: meta.url,
    status: "草稿",
  };
}

export function getUniqueSortedField(records, field) {
  return [...new Set(records.map((record) => record[field]))].sort();
}

export function buildRecruitmentDecision(result, now = Date.now()) {
  if (!RECRUITMENT_RESULTS.includes(result)) {
    throw new Error(`不支援的招募結果：${result}`);
  }
  return { result, decidedBy: "HR", decidedAt: new Date(now).toISOString() };
}
