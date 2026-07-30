import type { AIConversationMessage } from "./types";
export type CandidateAIEndpointRequest = { interviewId: string; questionId: number; candidateMessage: string; requestId: string; history: AIConversationMessage[] };
export type CandidateAIEndpointResponse = { requestId: string; assistantMessage: string; provider: "mock" | "gemini"; modelVersion: string; promptVersion: string; createdAt: string };
export function createCandidateAIService(options?: { fetchImpl?: typeof fetch }): { provider: "endpoint"; getMode(): Promise<{ provider: "mock" | "gemini"; modelVersion: string; promptVersion: string }>; ask(input: CandidateAIEndpointRequest): Promise<CandidateAIEndpointResponse> };
