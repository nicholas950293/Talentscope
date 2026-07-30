"use client";

import type { ReactNode } from "react";
import type { Role, View } from "../domain/types";
import { Brand, Icon, Toast } from "../shared/ui";

type InternalRole = Extract<Role, "hr" | "lead">;

const NAVIGATION: Record<InternalRole, Array<{ id: View; label: string; icon: string }>> = {
  hr: [{ id: "dashboard", label: "總覽", icon: "⌂" }, { id: "candidates", label: "候選人", icon: "◎" }],
  lead: [{ id: "dashboard", label: "工作台", icon: "⌂" }, { id: "questions", label: "題庫", icon: "▤" }, { id: "builder", label: "面試組卷", icon: "＋" }, { id: "review", label: "審核中心", icon: "✓" }],
};

export function WorkspaceShell({ role, view, navigate, onSwitchRole, toast, children }: { role: InternalRole; view: View; navigate: (view: View) => void; onSwitchRole: () => void; toast: string; children: ReactNode }) {
  const nav = NAVIGATION[role];
  return <div className="app-shell">
    <aside className="sidebar">
      <Brand />
      <div className="role-label">{role === "hr" ? "HR 工作區" : "技術主管工作區"}<span>DEMO</span></div>
      <nav>{nav.map(item => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => navigate(item.id)}><Icon name={item.icon} />{item.label}</button>)}</nav>
      <div className="side-bottom">
        <button><Icon name="?" />使用說明</button><button onClick={onSwitchRole}><Icon name="⇄" />切換 Demo 角色</button>
        <div className="user-chip"><div className="avatar">{role === "hr" ? "林" : "王"}</div><div><strong>{role === "hr" ? "林佳穎" : "王柏翰"}</strong><small>{role === "hr" ? "HR 招募專員" : "技術主管"}</small></div></div>
      </div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="mobile-brand"><Brand /></div><div className="crumb">Talentscope <span>/</span> {nav.find(item => item.id === view)?.label || "詳情"}</div><div className="top-actions"><button className="icon-btn">⌕</button><button className="icon-btn notification">♢</button></div></header>
      {children}
      {toast && <Toast text={toast} />}
    </main>
  </div>;
}
