const DEFAULT_REPLIES = [
  "Mock AI：先說說你目前的理解，以及卡住的是條件、資料關係，還是解法取捨？我會依你的思路一起釐清。",
  "Mock AI：可以把問題拆成輸入、預期輸出與限制三部分，再檢查每一步是否都能由題目條件支持。",
  "Mock AI：試著列出正常案例與邊界案例，並解釋目前方法在兩者上的行為；我不會直接提供完整答案。",
];

const COMPLETE_ANSWER_PATTERNS = [
  /```(?:sql|javascript|typescript|python)?[\s\S]*```/i,
  /(?:完整答案|標準答案|直接答案)[：:]/,
  /\bSELECT\s+[\s\S]+\bFROM\b/i,
];

export const isMockGuidanceSafe = (content) =>
  Boolean(content.trim()) && COMPLETE_ANSWER_PATTERNS.every((pattern) => !pattern.test(content));

export function createMockCandidateAIService(options = {}) {
  const latencyMs = options.latencyMs ?? 450;
  const shouldFail = options.shouldFail ?? ((input) => input.content.includes("模擬錯誤"));
  return {
    provider: "Mock",
    async ask(input) {
      if (latencyMs > 0) await new Promise((resolve) => setTimeout(resolve, latencyMs));
      if (shouldFail(input)) {
        const error = new Error("Mock AI request failed");
        error.code = "MOCK_AI_ERROR";
        throw error;
      }
      const seed = [...input.content].reduce((total, character) => total + character.charCodeAt(0), 0);
      const content = DEFAULT_REPLIES[seed % DEFAULT_REPLIES.length];
      if (!isMockGuidanceSafe(content)) {
        const error = new Error("Mock AI guidance rejected by safety guard");
        error.code = "MOCK_AI_UNSAFE_GUIDANCE";
        throw error;
      }
      return { content, provider: "Mock" };
    },
  };
}
