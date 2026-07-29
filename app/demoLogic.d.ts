export const INTERVIEW_STATUSES: string[];
export const INTERVIEW_TRANSITIONS: Record<string, string[]>;
export function isLegalInterviewStatus(status: string): boolean;
export function canTransitionInterviewStatus(from: string, to: string): boolean;
export function filterCandidates<T extends { candidate: string; email: string; job: string; lead: string; status: string }>(candidates: T[], filters?: { query?: string; status?: string; job?: string }): T[];
export function getAnswerProgress(answers: string[], questionTitles: string[]): {
  completedCount: number;
  incompleteCount: number;
  incompleteIndexes: number[];
  incompleteQuestions: string[];
};
export function claimSubmission(alreadySubmitted: boolean, source: "manual" | "timeout"): { shouldSubmit: boolean; submitted: boolean; source: "manual" | "timeout" };
export function formatCountdown(totalSeconds: number): string;
