import { INTERVIEW_STATUSES } from "../demoLogic.mjs";

export type Role = "login" | "hr" | "lead" | "candidate";
export type View = "dashboard" | "candidates" | "questions" | "builder" | "review" | "invite" | "verify" | "brief" | "exam" | "done";
export type RecruitmentResult = "通過" | "不通過" | "待討論";
export type InterviewStatus = typeof INTERVIEW_STATUSES[number];

export type Question = {
  id: number;
  title: string;
  type: "SQL" | "程式設計" | "技術問答";
  difficulty: "簡單" | "中等" | "困難";
  skills: string[];
  minutes: number;
  description: string;
  detail: string;
  example: string;
  rubric: string;
};

export type Candidate = {
  candidate: string;
  email: string;
  job: string;
  lead: string;
  due: string;
  code: string;
  url: string;
  status: InterviewStatus;
};

export type Interview = Candidate & {
  title: string;
  durationMinutes: number;
  questionIds: number[];
};

export type Answer = { questionId: number; content: string };
export type HintRecord = { q: number; level: number; text: string; time: string };
export type RecruitmentDecision = { result: RecruitmentResult; decidedBy: "HR"; decidedAt?: string };
