// Types for the in-memory interview session reducer.
export type SubmissionSource = "manual" | "timeout";
export type InterviewSession = { answers: string[]; currentQuestion: number; remainingSeconds: number; submitted: boolean; submissionSource: SubmissionSource | null };
export type InterviewAction = { type: "tick" } | { type: "select-question"; index: number } | { type: "update-answer"; index: number; answer: string } | { type: "submit"; source: SubmissionSource };
export function createInterviewSession(questionCount: number, durationSeconds?: number): InterviewSession;
export function reduceInterviewSession(state: InterviewSession, action: InterviewAction): InterviewSession;
