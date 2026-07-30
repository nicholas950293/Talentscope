export function createInterviewSession(questionCount, durationSeconds = 75 * 60) {
  return {
    answers: Array.from({ length: questionCount }, () => ""),
    currentQuestion: 0,
    remainingSeconds: Math.max(0, durationSeconds),
    submitted: false,
    submissionSource: null,
  };
}

export function reduceInterviewSession(state, action) {
  if (state.submitted) return state;
  switch (action.type) {
    case "tick": {
      const remainingSeconds = Math.max(0, state.remainingSeconds - 1);
      if (remainingSeconds === 0) return { ...state, remainingSeconds, submitted: true, submissionSource: "timeout" };
      return { ...state, remainingSeconds };
    }
    case "select-question":
      return { ...state, currentQuestion: action.index };
    case "update-answer":
      return { ...state, answers: state.answers.map((answer, index) => index === action.index ? action.answer : answer) };
    case "submit":
      return { ...state, submitted: true, submissionSource: action.source };
    default:
      return state;
  }
}
