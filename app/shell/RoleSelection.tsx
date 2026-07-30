"use client";

import type { Role } from "../domain/types";
import { Brand, Icon } from "../shared/ui";

const ROLE_OPTIONS: Array<{ id: Exclude<Role, "login">; icon: string; title: string; text: string; who: string }> = [
  { id: "hr", icon: "◎", title: "HR Demo", text: "管理候選人、面試邀請與招募結果", who: "林佳穎・HR 招募專員" },
  { id: "lead", icon: "⌘", title: "技術主管 Demo", text: "選題組卷、檢視作答並人工審核", who: "王柏翰・資料團隊主管" },
  { id: "candidate", icon: "⌁", title: "面試者 Demo", text: "驗證身分、開始作答與使用 Mock AI 協作", who: "陳怡安・Junior Data Analyst" },
];

export function RoleSelection({ onEnter }: { onEnter: (role: Exclude<Role, "login">) => void }) {
  return <main className="login-page">
    <div className="login-orb orb-one" /><div className="login-orb orb-two" />
    <div className="login-nav"><Brand /><span className="demo-pill">互動原型 · Sprint 1</span></div>
    <section className="login-content">
      <div className="eyebrow">面試協作，從邀請到決策</div>
      <h1>讓每一場面試<br /><span>更清楚、更公平。</span></h1>
      <p>Talentscope 串起招募、技術出題與候選人作答，讓團隊在同一條流程上協作。</p>
      <div className="role-grid">{ROLE_OPTIONS.map(option => <button key={option.id} className="role-card" onClick={() => onEnter(option.id)}>
        <div className="role-icon"><Icon name={option.icon} /></div><div className="role-copy"><h2>{option.title}</h2><p>{option.text}</p><small>{option.who}</small></div><span className="role-arrow">→</span>
      </button>)}</div>
      <div className="login-note"><Icon name="i" /> 此為展示環境，所有資料皆為 Demo 假資料，不會寄出真實邀請。</div>
    </section>
  </main>;
}
