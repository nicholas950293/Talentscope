import type { Candidate, RecruitmentDecision, RecruitmentResult } from "../../demo/types";

export const RECRUITMENT_RESULTS: readonly RecruitmentResult[];

export type CandidateFormInput = {
  name: string;
  email: string;
  job: string;
  lead: string;
  due: string;
};

export function hasRequiredCandidateFields(form: CandidateFormInput): boolean;
export function validateCandidateForm(form: CandidateFormInput, now?: number): string[];
export function normalizeCandidateInput(form: CandidateFormInput): Pick<Candidate, "candidate" | "email" | "job" | "lead" | "due">;
export function generateInterviewCode(random?: () => number): string;
export function generateInterviewUrl(now?: number): string;
export function buildCandidateRecord(form: CandidateFormInput, meta: { code: string; url: string }): Candidate;
export function getUniqueSortedField<T extends Record<string, unknown>, K extends keyof T>(records: T[], field: K): Array<T[K]>;
export function buildRecruitmentDecision(result: string, now?: number): RecruitmentDecision;
