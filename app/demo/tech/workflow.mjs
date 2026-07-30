export function filterQuestionBank(questions, filters = {}) {
  const query = String(filters.query || "").trim().toLocaleLowerCase();
  const type = filters.type || "全部";
  const difficulty = filters.difficulty || "全部";
  const skill = filters.skill || "全部";
  return questions.filter((question) => {
    const searchable = `${question.title} ${question.description} ${question.skills.join(" ")}`.toLocaleLowerCase();
    return (!query || searchable.includes(query))
      && (type === "全部" || question.type === type)
      && (difficulty === "全部" || question.difficulty === difficulty)
      && (skill === "全部" || question.skills.includes(skill));
  });
}

export function toggleQuestionSelection(selectedIds, questionId) {
  return selectedIds.includes(questionId)
    ? selectedIds.filter((id) => id !== questionId)
    : [...selectedIds, questionId];
}

export function moveSelectedQuestion(selectedIds, index, direction) {
  const targetIndex = index + direction;
  if (index < 0 || index >= selectedIds.length || targetIndex < 0 || targetIndex >= selectedIds.length) return selectedIds;
  const reordered = [...selectedIds];
  [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
  return reordered;
}

export function getPaperSummary(questions, selectedIds) {
  const selected = selectedIds.map((id) => questions.find((question) => question.id === id)).filter(Boolean);
  return {
    selected,
    count: selected.length,
    totalMinutes: selected.reduce((total, question) => total + question.minutes, 0),
    typeCounts: {
      SQL: selected.filter((question) => question.type === "SQL").length,
      程式設計: selected.filter((question) => question.type === "程式設計").length,
      技術問答: selected.filter((question) => question.type === "技術問答").length,
    },
    canCreateInvite: selected.length > 0,
  };
}

export function updateReviewerScore(scores, index, score) {
  if (!Number.isInteger(index) || index < 0 || index >= scores.length || !Number.isInteger(score) || score < 1 || score > 5) return scores;
  return scores.map((current, currentIndex) => currentIndex === index ? score : current);
}
