// Shared domain rules for interview status, filtering, progress, and submission.
export const INTERVIEW_STATUSES = [
  "草稿",
  "待寄送",
  "等待面試者開始",
  "作答中",
  "已提交",
  "AI 分析中",
  "等待人工審核",
  "已完成",
  "已過期",
];

export const INTERVIEW_TRANSITIONS = {
  草稿: ["待寄送"],
  待寄送: ["等待面試者開始", "已過期"],
  等待面試者開始: ["作答中", "已過期"],
  作答中: ["已提交", "已過期"],
  已提交: ["AI 分析中"],
  "AI 分析中": ["等待人工審核"],
  等待人工審核: ["已完成"],
  已完成: [],
  已過期: [],
};

export function isLegalInterviewStatus(status) {
  return INTERVIEW_STATUSES.includes(status);
}

export function canTransitionInterviewStatus(from, to) {
  return isLegalInterviewStatus(from) && INTERVIEW_TRANSITIONS[from].includes(to);
}

export function filterCandidates(candidates, filters = {}) {
  const query = (filters.query ?? "").trim().toLocaleLowerCase("zh-TW");
  return candidates.filter((candidate) => {
    const searchable = [candidate.candidate, candidate.email, candidate.job, candidate.lead]
      .join(" ")
      .toLocaleLowerCase("zh-TW");
    return (!query || searchable.includes(query))
      && (!filters.status || candidate.status === filters.status)
      && (!filters.job || candidate.job === filters.job);
  });
}

export function getAnswerProgress(answers, questionTitles) {
  const incompleteIndexes = answers
    .map((answer, index) => ({ answer, index }))
    .filter(({ answer }) => !answer.trim())
    .map(({ index }) => index);
  return {
    completedCount: answers.length - incompleteIndexes.length,
    incompleteCount: incompleteIndexes.length,
    incompleteIndexes,
    incompleteQuestions: incompleteIndexes.map((index) => questionTitles[index]),
  };
}

export function claimSubmission(alreadySubmitted, source) {
  return {
    shouldSubmit: !alreadySubmitted,
    submitted: true,
    source,
  };
}

export function formatCountdown(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}
