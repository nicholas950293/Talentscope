import type { ReactNode } from "react";
import { INTERVIEW_STATUSES } from "../domain/interviewWorkflow.mjs";
import type { InterviewStatus } from "../domain/types";

export const Icon = ({ name }: { name: string }) => <span className="icon" aria-hidden>{name}</span>;
export const Brand = () => <div className="brand"><div className="brand-mark">T</div><div>Talent<span>scope</span></div></div>;
export const Badge = ({ status }: { status: InterviewStatus }) => <span className={`badge s-${INTERVIEW_STATUSES.indexOf(status)}`}>{status}</span>;
export const Button = ({ children, kind = "primary", onClick, disabled, type = "button" }: { children: ReactNode; kind?: string; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" }) => <button type={type} className={`btn ${kind}`} onClick={onClick} disabled={disabled}>{children}</button>;
export const Toast = ({ text }: { text: string }) => <div className="toast"><Icon name="✓" />{text}</div>;
export const PageTitle = ({ eyebrow, title, text, action }: { eyebrow?: string; title: string; text: string; action?: ReactNode }) => <div className="page-title"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1><p>{text}</p></div>{action}</div>;
