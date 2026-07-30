import type { ReactNode } from "react";
import { INTERVIEW_STATUSES } from "../demoLogic.mjs";
import type { InterviewStatus } from "./types";

export const Icon = ({ name }: { name: string }) => <span className="icon" aria-hidden>{name}</span>;
export const Brand = () => <div className="brand"><div className="brand-mark">T</div><div>Talent<span>scope</span></div></div>;
export const Badge = ({ status }: { status: InterviewStatus }) => <span className={`badge s-${INTERVIEW_STATUSES.indexOf(status)}`}>{status}</span>;
export const Button = ({ children, kind = "primary", onClick, disabled, type = "button" }: { children: ReactNode; kind?: string; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" }) => <button type={type} className={`btn ${kind}`} onClick={onClick} disabled={disabled}>{children}</button>;
