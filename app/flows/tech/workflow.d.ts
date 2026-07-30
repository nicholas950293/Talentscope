import type { Question } from "../../domain/types";

export type QuestionFilters = { query?: string; type?: string; difficulty?: string; skill?: string };
export type PaperSummary = { selected: Question[]; count: number; totalMinutes: number; typeCounts: { SQL: number; 程式設計: number; 技術問答: number }; canCreateInvite: boolean };

export function filterQuestionBank(questions: Question[], filters?: QuestionFilters): Question[];
export function toggleQuestionSelection(selectedIds: number[], questionId: number): number[];
export function moveSelectedQuestion(selectedIds: number[], index: number, direction: number): number[];
export function getPaperSummary(questions: Question[], selectedIds: number[]): PaperSummary;
export function updateReviewerScore(scores: number[], index: number, score: number): number[];
