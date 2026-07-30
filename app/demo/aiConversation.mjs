export const createAIConversationState = () => ({
  messages: [],
  pendingByQuestion: {},
  locked: false,
});

export const messagesForQuestion = (state, questionId) =>
  state.messages.filter((message) => message.questionId === questionId);

export const canSendAIMessage = (state, questionId, content) =>
  !state.locked && Boolean(content.trim()) && !state.pendingByQuestion[questionId];

export function reduceAIConversation(state, action) {
  switch (action.type) {
    case "begin": {
      const content = action.content.trim();
      if (!canSendAIMessage(state, action.questionId, content)) return state;
      const common = {
        interviewId: action.interviewId,
        questionId: action.questionId,
        createdAt: action.createdAt,
        requestId: action.requestId,
        provider: "pending",
      };
      return {
        ...state,
        messages: [
          ...state.messages,
          { ...common, id: `${action.requestId}-candidate`, role: "candidate", content, status: "success" },
          { ...common, id: `${action.requestId}-assistant`, role: "assistant", content: "", status: "pending" },
        ],
        pendingByQuestion: { ...state.pendingByQuestion, [action.questionId]: action.requestId },
      };
    }
    case "resolve":
      return settleRequest(state, action.requestId, {
        content: action.content,
        createdAt: action.createdAt,
        status: "success",
        provider: action.provider,
        modelVersion: action.modelVersion,
        promptVersion: action.promptVersion,
        errorCode: undefined,
      });
    case "fail":
      return settleRequest(state, action.requestId, {
        content: action.content || "AI 暫時無法回覆，請稍後重試。",
        createdAt: action.createdAt,
        status: "error",
        errorCode: action.errorCode || "MOCK_AI_ERROR",
      });
    case "retry": {
      if (state.locked) return state;
      const failed = state.messages.find(
        (message) => message.requestId === action.requestId && message.role === "assistant" && message.status === "error",
      );
      if (!failed || state.pendingByQuestion[failed.questionId]) return state;
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.id === failed.id
            ? { ...message, content: "", status: "pending", errorCode: undefined, createdAt: action.createdAt }
            : message,
        ),
        pendingByQuestion: { ...state.pendingByQuestion, [failed.questionId]: action.requestId },
      };
    }
    case "lock":
      return state.locked ? state : { ...state, locked: true, pendingByQuestion: {} };
    default:
      return state;
  }
}

function settleRequest(state, requestId, update) {
  const assistant = state.messages.find(
    (message) => message.requestId === requestId && message.role === "assistant" && message.status === "pending",
  );
  if (!assistant || state.locked) return state;
  const pendingByQuestion = { ...state.pendingByQuestion };
  delete pendingByQuestion[assistant.questionId];
  return {
    ...state,
    messages: state.messages.map((message) => (message.id === assistant.id ? { ...message, ...update } : message)),
    pendingByQuestion,
  };
}
