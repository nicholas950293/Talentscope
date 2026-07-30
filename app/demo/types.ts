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
export type AIConversationRole = "candidate" | "assistant";
export type AIMessageStatus = "pending" | "success" | "error";
export type AIConversationMessage = {
  id: string;
  interviewId: string;
  questionId: number;
  role: AIConversationRole;
  content: string;
  createdAt: string;
  requestId: string;
  status: AIMessageStatus;
  provider: "pending" | "mock" | "gemini";
  modelVersion?: string;
  promptVersion?: string;
  errorCode?: string;
};
export type AIConversationState = {
  messages: AIConversationMessage[];
  pendingByQuestion: Record<number, string>;
  locked: boolean;
};
export type AIConversationAction =
  | { type: "begin"; interviewId: string; questionId: number; content: string; requestId: string; createdAt: string }
  | { type: "resolve"; requestId: string; content: string; createdAt: string; provider: "mock" | "gemini"; modelVersion: string; promptVersion: string }
  | { type: "fail"; requestId: string; content?: string; errorCode?: string; createdAt: string }
  | { type: "retry"; requestId: string; createdAt: string }
  | { type: "lock" };
export type RecruitmentDecision = { result: RecruitmentResult; decidedBy: "HR"; decidedAt?: string };
