export type CandidateAIRequest = {
  interviewId: string;
  questionId: number;
  questionTitle: string;
  content: string;
  requestId: string;
};

export type CandidateAIService = {
  provider: "Mock";
  ask(input: CandidateAIRequest): Promise<{ content: string; provider: "Mock" }>;
};

export function createMockCandidateAIService(options?: {
  latencyMs?: number;
  shouldFail?: (input: CandidateAIRequest) => boolean;
}): CandidateAIService;

export function isMockGuidanceSafe(content: string): boolean;
