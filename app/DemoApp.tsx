"use client";

/* eslint-disable react-hooks/rules-of-hooks, react-hooks/refs, react-hooks/exhaustive-deps -- Demo callback name and ref guard live in a compact legacy-compatible component. */

import { useEffect, useMemo, useRef, useState } from "react";
import { INTERVIEW_STATUSES, claimSubmission, filterCandidates, formatCountdown, getAnswerProgress } from "./demoLogic.mjs";

type Role = "login" | "hr" | "lead" | "candidate";
type View = "dashboard" | "candidates" | "questions" | "builder" | "review" | "invite" | "verify" | "brief" | "exam" | "done";
type Status = "草稿" | "待寄送" | "等待面試者開始" | "作答中" | "已提交" | "AI 分析中" | "等待人工審核" | "已完成" | "已過期";
type Question = {
  id: number; title: string; type: "SQL" | "程式設計" | "技術問答"; difficulty: "簡單" | "中等" | "困難";
  skills: string[]; minutes: number; description: string; detail: string; example: string; rubric: string;
};

const questions: Question[] = [
  { id: 1, title: "找出連續活躍用戶", type: "SQL", difficulty: "中等", skills: ["SQL", "Window Function"], minutes: 25, description: "找出連續三天都有登入紀錄的使用者。", detail: "login_events(user_id INT, login_at TIMESTAMP)。同一天多次登入只計一次。", example: "輸出：user_id、streak_start、streak_end", rubric: "去重 20%、日期分組 35%、連續區間判斷 45%" },
  { id: 2, title: "電商月留存率", type: "SQL", difficulty: "中等", skills: ["SQL", "CTE", "分析"], minutes: 30, description: "計算每個註冊月份的次月留存率。", detail: "users(id, created_at)、orders(user_id, created_at)。需處理無訂單月份。", example: "2026-01 | 42.5%", rubric: "cohort 定義 30%、留存計算 40%、邊界情況 30%" },
  { id: 3, title: "部門薪資中位數", type: "SQL", difficulty: "困難", skills: ["SQL", "統計"], minutes: 35, description: "不使用資料庫專屬 median 函式，計算各部門薪資中位數。", detail: "employees(id, department_id, salary)。奇偶筆數皆需正確。", example: "department_id | median_salary", rubric: "排序策略 35%、奇偶處理 40%、可讀性 25%" },
  { id: 4, title: "訂單漏斗轉換", type: "SQL", difficulty: "簡單", skills: ["SQL", "Aggregation"], minutes: 20, description: "計算瀏覽、加購、購買三階段的轉換率。", detail: "events(user_id, event_name, occurred_at)。期間由參數指定。", example: "view_to_cart | cart_to_purchase", rubric: "條件聚合 50%、分母為零 25%、格式 25%" },
  { id: 5, title: "最長不重複子字串", type: "程式設計", difficulty: "中等", skills: ["JavaScript", "演算法"], minutes: 30, description: "回傳字串中不含重複字元的最長連續子字串長度。", detail: "輸入為 UTF-8 字串，長度 0～100,000。", example: "輸入 abcabcbb，輸出 3", rubric: "正確性 50%、O(n) 解法 30%、說明 20%" },
  { id: 6, title: "合併事件區間", type: "程式設計", difficulty: "中等", skills: ["Python", "演算法"], minutes: 30, description: "合併所有重疊或相鄰的時間區間。", detail: "輸入為 [start, end] 陣列，可能未排序。", example: "[[1,3],[2,6],[8,10]] → [[1,6],[8,10]]", rubric: "排序 20%、合併 50%、空輸入 15%、複雜度 15%" },
  { id: 7, title: "限流器設計", type: "程式設計", difficulty: "困難", skills: ["System Design", "Redis"], minutes: 40, description: "實作可測試的滑動視窗限流器核心邏輯。", detail: "需說明分散式環境的競態條件與時間來源。", example: "allow(key, timestamp): boolean", rubric: "核心邏輯 40%、競態 25%、測試 20%、取捨 15%" },
  { id: 8, title: "資料品質異常處理", type: "技術問答", difficulty: "中等", skills: ["資料分析", "溝通"], minutes: 20, description: "儀表板營收突然成長 35%，你會如何驗證與回報？", detail: "請依序描述檢查、定位、溝通與後續預防。", example: "以條列方式說明你的調查步驟。", rubric: "驗證框架 35%、假設品質 25%、溝通 25%、預防 15%" },
  { id: 9, title: "A/B Test 結果判讀", type: "技術問答", difficulty: "中等", skills: ["實驗設計", "統計"], minutes: 25, description: "轉換率提升但客單價下降，應如何決定是否上線？", detail: "請涵蓋主要指標、護欄指標、統計與商業顯著性。", example: "提出你的決策框架與需要補充的資料。", rubric: "多指標判讀 35%、風險 25%、決策 25%、表達 15%" },
  { id: 10, title: "指標定義衝突", type: "技術問答", difficulty: "簡單", skills: ["資料分析", "Stakeholder"], minutes: 15, description: "產品與財務對『活躍客戶』定義不同，你會怎麼處理？", detail: "回答需包含對齊、紀錄與落地方式。", example: "不超過 500 字。", rubric: "釐清 30%、協作 30%、治理 25%、表達 15%" },
  { id: 11, title: "缺失值策略", type: "技術問答", difficulty: "簡單", skills: ["資料分析", "統計"], minutes: 15, description: "說明你會如何為不同缺失機制選擇處理策略。", detail: "至少比較刪除、簡單填補與模型填補。", example: "舉一個實際業務情境。", rubric: "機制理解 40%、取捨 35%、例子 25%" },
  { id: 12, title: "近即時資料管線", type: "技術問答", difficulty: "困難", skills: ["Data Engineering", "System Design"], minutes: 35, description: "設計每 5 分鐘更新的營運指標管線。", detail: "涵蓋來源、轉換、儲存、品質檢查與告警。", example: "可用文字或簡圖描述。", rubric: "架構完整 35%、可靠性 30%、觀測性 20%、取捨 15%" },
];

const statuses = INTERVIEW_STATUSES as Status[];
const demoInterview = { candidate: "陳怡安", email: "yian.chen@example.com", job: "Junior Data Analyst", lead: "王柏翰", due: "2026/08/02 23:59", code: "482916", url: "talentscope.demo/i/DA-260801", status: "等待人工審核" as Status };
const seedCandidates = [
  demoInterview,
  { candidate: "林冠宇", email: "kuanyu.lin@example.com", job: "Backend Engineer", lead: "王柏翰", due: "2026/08/05 18:00", code: "163820", url: "talentscope.demo/i/BE-260805", status: "等待面試者開始" as Status },
  { candidate: "張雅婷", email: "yating@example.com", job: "Product Analyst", lead: "李欣蓉", due: "2026/07/31 23:59", code: "739211", url: "talentscope.demo/i/PA-260731", status: "作答中" as Status },
  { candidate: "周子翔", email: "zixiang@example.com", job: "Data Engineer", lead: "王柏翰", due: "2026/07/28 18:00", code: "550324", url: "talentscope.demo/i/DE-260728", status: "已完成" as Status },
];

const Icon = ({ name }: { name: string }) => <span className="icon" aria-hidden>{name}</span>;
const Badge = ({ status }: { status: Status }) => <span className={`badge s-${statuses.indexOf(status)}`}>{status}</span>;
const Button = ({ children, kind = "primary", onClick, disabled, type = "button" }: { children: React.ReactNode; kind?: string; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" }) => <button type={type} className={`btn ${kind}`} onClick={onClick} disabled={disabled}>{children}</button>;
const Toast = ({ text }: { text: string }) => <div className="toast"><Icon name="✓" />{text}</div>;

export default function DemoApp() {
  const [role, setRole] = useState<Role>("login");
  const [view, setView] = useState<View>("dashboard");
  const [toast, setToast] = useState("");
  const [selected, setSelected] = useState<number[]>([1, 2, 8]);
  const [status, setStatus] = useState<Status>(demoInterview.status);
  const [candidates, setCandidates] = useState(seedCandidates);
  const [modal, setModal] = useState<"" | "candidate" | "submit" | "question" | "result">("");
  const [result, setResult] = useState("待討論");
  const showToast = (text: string) => { setToast(text); window.setTimeout(() => setToast(""), 2400); };
  const enter = (r: Role) => { if (r === "candidate") setStatus("等待面試者開始"); setRole(r); setView(r === "candidate" ? "verify" : "dashboard"); };
  const navigate = (v: View) => { setView(v); window.scrollTo({ top: 0, behavior: "smooth" }); };

  if (role === "login") return <Login onEnter={enter} />;
  if (role === "candidate") return <CandidateFlow view={view} navigate={navigate} modal={modal} setModal={setModal} status={status} setStatus={setStatus} showToast={showToast} />;

  const visibleCandidates = candidates.map(candidate => candidate.email === demoInterview.email ? { ...candidate, status } : candidate);

  const nav = role === "hr"
    ? [{ id: "dashboard", label: "總覽", icon: "⌂" }, { id: "candidates", label: "候選人", icon: "◎" }]
    : [{ id: "dashboard", label: "工作台", icon: "⌂" }, { id: "questions", label: "題庫", icon: "▤" }, { id: "builder", label: "面試組卷", icon: "＋" }, { id: "review", label: "審核中心", icon: "✓" }];

  return <div className="app-shell">
    <aside className="sidebar">
      <Brand />
      <div className="role-label">{role === "hr" ? "HR 工作區" : "技術主管工作區"}<span>DEMO</span></div>
      <nav>{nav.map(n => <button key={n.id} className={view === n.id ? "active" : ""} onClick={() => navigate(n.id as View)}><Icon name={n.icon} />{n.label}</button>)}</nav>
      <div className="side-bottom">
        <button><Icon name="?" />使用說明</button><button onClick={() => setRole("login")}><Icon name="⇄" />切換 Demo 角色</button>
        <div className="user-chip"><div className="avatar">{role === "hr" ? "林" : "王"}</div><div><strong>{role === "hr" ? "林佳穎" : "王柏翰"}</strong><small>{role === "hr" ? "HR 招募專員" : "技術主管"}</small></div></div>
      </div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="mobile-brand"><Brand /></div><div className="crumb">Talentscope <span>/</span> {nav.find(n => n.id === view)?.label || "詳情"}</div><div className="top-actions"><button className="icon-btn">⌕</button><button className="icon-btn notification">♢</button></div></header>
      {role === "hr" && view === "dashboard" && <HrDashboard candidates={visibleCandidates} setModal={setModal} navigate={navigate} result={result} />}
      {role === "hr" && view === "candidates" && <CandidateList candidates={visibleCandidates} setModal={setModal} navigate={navigate} />}
      {role === "hr" && view === "review" && <HrSummary result={result} status={status} setModal={setModal} />}
      {role === "lead" && view === "dashboard" && <LeadDashboard navigate={navigate} status={status} />}
      {role === "lead" && view === "questions" && <QuestionBank selected={selected} setSelected={setSelected} setModal={setModal} navigate={navigate} showToast={showToast} />}
      {role === "lead" && view === "builder" && <Builder selected={selected} setSelected={setSelected} navigate={navigate} showToast={showToast} />}
      {role === "lead" && view === "invite" && <Invite navigate={navigate} showToast={showToast} />}
      {role === "lead" && view === "review" && <TechReview navigate={navigate} showToast={showToast} status={status} />}
      {role === "lead" && view === "candidates" && <TechReview navigate={navigate} showToast={showToast} status={status} />}
      {toast && <Toast text={toast} />}
    </main>
    {modal === "candidate" && <NewCandidate candidates={candidates} onClose={() => setModal("")} onSave={(c) => { setCandidates([c, ...candidates]); setModal(""); showToast("候選人與面試邀請已建立"); }} />}
    {modal === "result" && <ResultModal result={result} onClose={() => setModal("")} onSave={(v) => { setResult(v); setStatus("已完成"); setModal(""); showToast("招募結果已更新"); }} />}
    {modal === "question" && <QuestionEditor onClose={() => setModal("")} showToast={showToast} />}
  </div>;
}

function Brand() { return <div className="brand"><div className="brand-mark">T</div><div>Talent<span>scope</span></div></div>; }

function Login({ onEnter }: { onEnter: (r: Role) => void }) {
  const roles = [
    { id: "hr" as Role, icon: "◎", title: "HR Demo", text: "管理候選人、面試邀請與招募結果", who: "林佳穎・HR 招募專員" },
    { id: "lead" as Role, icon: "⌘", title: "技術主管 Demo", text: "選題組卷、檢視作答並人工審核", who: "王柏翰・資料團隊主管" },
    { id: "candidate" as Role, icon: "⌁", title: "面試者 Demo", text: "驗證身分、開始作答與使用 AI 提示", who: "陳怡安・Junior Data Analyst" },
  ];
  return <main className="login-page">
    <div className="login-orb orb-one" /><div className="login-orb orb-two" />
    <div className="login-nav"><Brand /><span className="demo-pill">互動原型 · Sprint 1</span></div>
    <section className="login-content">
      <div className="eyebrow">面試協作，從邀請到決策</div>
      <h1>讓每一場面試<br /><span>更清楚、更公平。</span></h1>
      <p>Talentscope 串起招募、技術出題與候選人作答，讓團隊在同一條流程上協作。</p>
      <div className="role-grid">{roles.map(r => <button key={r.id} className="role-card" onClick={() => onEnter(r.id)}>
        <div className="role-icon"><Icon name={r.icon} /></div><div className="role-copy"><h2>{r.title}</h2><p>{r.text}</p><small>{r.who}</small></div><span className="role-arrow">→</span>
      </button>)}</div>
      <div className="login-note"><Icon name="i" /> 此為展示環境，所有資料皆為 Demo 假資料，不會寄出真實邀請。</div>
    </section>
  </main>;
}

function PageTitle({ eyebrow, title, text, action }: { eyebrow?: string; title: string; text: string; action?: React.ReactNode }) {
  return <div className="page-title"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1><p>{text}</p></div>{action}</div>;
}

function HrDashboard({ candidates, setModal, navigate, result }: { candidates: typeof seedCandidates; setModal: (m: "candidate" | "result") => void; navigate: (v: View) => void; result: string }) {
  const metrics = [["候選人總數", "12", "+3 本週", "◎"], ["等待面試", "4", "2 份將到期", "◷"], ["面試進行中", "1", "進度 67%", "▶"], ["等待技術審核", "3", "平均 1.2 天", "✓"], ["已完成", "4", "本月", "◆"], ["需要人工複核", "1", "請優先處理", "!"]];
  return <div className="page">
    <PageTitle eyebrow="早安，佳穎" title="招募進度一目了然" text="追蹤所有候選人的面試進度與待辦事項。" action={<Button onClick={() => setModal("candidate")}>＋ 新增候選人</Button>} />
    <div className="metric-grid">{metrics.map((m, i) => <div className={`metric-card ${i === 5 ? "attention" : ""}`} key={m[0]}><div className="metric-head"><span>{m[0]}</span><Icon name={m[3]} /></div><strong>{m[1]}</strong><small>{m[2]}</small></div>)}</div>
    <div className="two-col">
      <section className="panel wide"><div className="panel-head"><div><h2>近期候選人</h2><p>依照面試期限與審核狀態排序</p></div><button className="text-btn" onClick={() => navigate("candidates")}>查看全部 →</button></div><CandidateTable rows={candidates.slice(0, 4)} onOpen={(c) => c.candidate === "陳怡安" ? navigate("review") : navigate("candidates")} /></section>
      <section className="panel"><div className="panel-head"><div><h2>本週待辦</h2><p>3 個項目需要你的關注</p></div></div><div className="todo-list">
        <button onClick={() => navigate("review")}><span className="todo-icon violet">✓</span><div><strong>確認陳怡安面試結果</strong><small>技術審核已完成 · {result}</small></div><span>→</span></button>
        <button><span className="todo-icon amber">!</span><div><strong>2 份面試即將到期</strong><small>距離期限不到 24 小時</small></div><span>→</span></button>
        <button onClick={() => setModal("candidate")}><span className="todo-icon blue">＋</span><div><strong>建立新面試邀請</strong><small>Backend Engineer · 1 位</small></div><span>→</span></button>
      </div></section>
    </div>
  </div>;
}

function CandidateTable({ rows, onOpen }: { rows: typeof seedCandidates; onOpen: (r: typeof seedCandidates[number]) => void }) {
  return <div className="table-wrap"><table><thead><tr><th>候選人</th><th>應徵職缺</th><th>技術主管</th><th>面試期限</th><th>狀態</th><th></th></tr></thead><tbody>{rows.map(r => <tr key={r.email}><td><div className="person"><span>{r.candidate.slice(-1)}</span><div><strong>{r.candidate}</strong><small>{r.email}</small></div></div></td><td>{r.job}</td><td>{r.lead}</td><td>{r.due.split(" ")[0]}</td><td><Badge status={r.status} /></td><td><button className="more" onClick={() => onOpen(r)}>查看詳情</button></td></tr>)}</tbody></table></div>;
}

function CandidateList({ candidates, setModal, navigate }: { candidates: typeof seedCandidates; setModal: (m: "candidate") => void; navigate: (v: View) => void }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const jobs = useMemo(() => [...new Set(candidates.map(candidate => candidate.job))].sort(), [candidates]);
  const filtered = useMemo(() => filterCandidates(candidates, { query, status: statusFilter, job: jobFilter }), [candidates, query, statusFilter, jobFilter]);
  return <div className="page"><PageTitle title="候選人" text="管理候選人資料、面試邀請與進度。" action={<Button onClick={() => setModal("candidate")}>＋ 新增候選人</Button>} />
    <section className="panel"><div className="toolbar"><label className="search"><Icon name="⌕" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜尋姓名、Email、職缺或技術主管" /></label><select aria-label="依狀態篩選" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="">所有狀態</option>{statuses.map(s => <option key={s}>{s}</option>)}</select><select aria-label="依職缺篩選" value={jobFilter} onChange={e => setJobFilter(e.target.value)}><option value="">所有職缺</option>{jobs.map(job => <option key={job}>{job}</option>)}</select></div>
      {filtered.length ? <CandidateTable rows={filtered} onOpen={(c) => c.candidate === "陳怡安" ? navigate("review") : navigate("candidates")} /> : <div className="empty"><Icon name="⌕" /><h3>找不到符合的候選人</h3><p>目前沒有同時符合關鍵字、狀態與職缺的資料。</p><Button kind="secondary" onClick={() => { setQuery(""); setStatusFilter(""); setJobFilter(""); }}>清除篩選</Button></div>}
    </section></div>;
}

function LeadDashboard({ navigate, status }: { navigate: (v: View) => void; status: Status }) {
  return <div className="page"><PageTitle eyebrow="早安，柏翰" title="今天有 3 件事等你處理" text="聚焦出題與審核，讓面試流程順利往前。" />
    <div className="lead-stats">{[["待建立的面試", "2", "＋", "builder"], ["等待候選人作答", "4", "◷", "invite"], ["等待人工審核", "3", "✓", "review"], ["最近完成", "8", "◆", "review"]].map((s, i) => <button key={s[0]} onClick={() => navigate(s[3] as View)} className="lead-stat"><span className={`stat-icon c${i}`}>{s[2]}</span><div><small>{s[0]}</small><strong>{s[1]}</strong></div><span>→</span></button>)}</div>
    <div className="two-col lead-layout"><section className="panel wide"><div className="panel-head"><div><h2>需要你處理</h2><p>依優先順序排列</p></div></div><div className="assignment-list">
      <div className="assignment"><div className="avatar lg">林</div><div className="assignment-main"><div><h3>林冠宇 <Badge status="草稿" /></h3><p>Backend Engineer · HR 林佳穎指派</p></div><div className="assignment-meta"><span>期限 08/05</span><span>尚未選題</span></div></div><Button onClick={() => navigate("builder")}>開始組卷</Button></div>
      <div className="assignment"><div className="avatar lg purple">陳</div><div className="assignment-main"><div><h3>陳怡安 <Badge status={status} /></h3><p>Junior Data Analyst · Demo 面試</p></div><div className="assignment-meta"><span>提交於昨天 16:42</span><span>3 題 · 82 分鐘</span></div></div><Button kind="secondary" onClick={() => navigate("review")}>進行審核</Button></div>
    </div></section><section className="panel"><div className="panel-head"><div><h2>本週面試概況</h2><p>7/27 — 8/2</p></div></div><div className="mini-chart">{[42,65,35,78,52,88,60].map((h,i)=><div key={i}><span style={{height:`${h}%`}}/><small>{["一","二","三","四","五","六","日"][i]}</small></div>)}</div><div className="chart-legend"><span><i /> 已完成 8</span><span><i /> 待處理 5</span></div></section></div>
  </div>;
}

function QuestionBank({ selected, setSelected, setModal, navigate, showToast }: { selected: number[]; setSelected: (v: number[]) => void; setModal: (m: "question") => void; navigate: (v: View) => void; showToast: (s: string) => void }) {
  const [query, setQuery] = useState(""); const [type, setType] = useState("全部"); const [difficulty, setDifficulty] = useState("全部"); const [skill, setSkill] = useState("全部"); const [preview, setPreview] = useState<Question | null>(null);
  const filtered = useMemo(() => questions.filter(q => (q.title + q.description + q.skills.join(" ")).toLowerCase().includes(query.toLowerCase()) && (type === "全部" || q.type === type) && (difficulty === "全部" || q.difficulty === difficulty) && (skill === "全部" || q.skills.includes(skill))), [query,type,difficulty,skill]);
  const toggle = (id: number) => { setSelected(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]); showToast(selected.includes(id) ? "已從面試移除" : "已加入面試"); };
  return <div className="page"><PageTitle title="題庫" text="搜尋、篩選並組合適合這場面試的題目。" action={<div className="button-row"><Button kind="secondary" onClick={() => setModal("question")}>＋ 建立新題目</Button><Button onClick={() => navigate("builder")}>已選 {selected.length} 題 · 前往組卷</Button></div>} />
    <section className="panel question-panel"><div className="toolbar filters"><label className="search grow"><Icon name="⌕" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜尋題目名稱、描述或技能標籤" /></label>
      <select value={type} onChange={e => setType(e.target.value)}><option>全部</option><option>SQL</option><option>程式設計</option><option>技術問答</option></select>
      <select value={difficulty} onChange={e => setDifficulty(e.target.value)}><option>全部</option><option>簡單</option><option>中等</option><option>困難</option></select>
      <select value={skill} onChange={e => setSkill(e.target.value)}><option>全部</option><option>SQL</option><option>資料分析</option><option>統計</option><option>JavaScript</option><option>System Design</option></select></div>
      <div className="filter-result"><span>共 {filtered.length} 題</span><button onClick={()=>{setQuery("");setType("全部");setDifficulty("全部");setSkill("全部")}}>清除篩選</button></div>
      {filtered.length ? <div className="question-list">{filtered.map(q => <article key={q.id} className={`question-row ${selected.includes(q.id) ? "selected" : ""}`}><button className="check" onClick={() => toggle(q.id)} aria-label="選取題目">{selected.includes(q.id) ? "✓" : ""}</button><div className="q-main" onClick={() => setPreview(q)}><div className="q-title"><h3>{q.title}</h3><span className={`type type-${q.type}`}>{q.type}</span><span className={`difficulty d-${q.difficulty}`}>{q.difficulty}</span></div><p>{q.description}</p><div className="tags">{q.skills.map(s => <span key={s}>{s}</span>)}</div></div><div className="q-side"><span><Icon name="◷" /> {q.minutes} 分鐘</span><button onClick={() => setPreview(q)}>查看詳情</button><button onClick={() => setModal("question")}>編輯</button></div></article>)}</div> : <div className="empty"><Icon name="▤" /><h3>沒有符合條件的題目</h3><p>清除部分篩選條件後再試一次。</p></div>}
    </section>{preview && <QuestionPreview q={preview} selected={selected.includes(preview.id)} onToggle={() => toggle(preview.id)} onClose={() => setPreview(null)} />}</div>;
}

function QuestionPreview({ q, selected, onToggle, onClose }: { q: Question; selected: boolean; onToggle: () => void; onClose: () => void }) {
  return <div className="drawer-backdrop" onMouseDown={onClose}><aside className="drawer" onMouseDown={e=>e.stopPropagation()}><div className="drawer-head"><div><span className={`type type-${q.type}`}>{q.type}</span><span className={`difficulty d-${q.difficulty}`}>{q.difficulty}</span></div><button onClick={onClose}>×</button></div><h2>{q.title}</h2><div className="tags">{q.skills.map(s=><span key={s}>{s}</span>)}</div><div className="detail-block"><h4>題目描述</h4><p>{q.description}</p></div><div className="detail-block"><h4>資料結構／輸入輸出</h4><p>{q.detail}</p></div><div className="code-example">{q.example}</div><div className="detail-block"><h4>評分標準</h4><p>{q.rubric}</p></div><div className="drawer-footer"><span>預估 {q.minutes} 分鐘</span><Button onClick={onToggle} kind={selected ? "secondary" : "primary"}>{selected ? "✓ 已加入面試" : "＋ 加入面試"}</Button></div></aside></div>;
}

function Builder({ selected, setSelected, navigate, showToast }: { selected: number[]; setSelected: (v: number[]) => void; navigate: (v: View) => void; showToast: (s: string) => void }) {
  const picked = selected.map(id => questions.find(q => q.id === id)!).filter(Boolean);
  const move = (i:number,d:number) => { const next=[...selected]; const ni=i+d;if(ni<0||ni>=next.length)return;[next[i],next[ni]]=[next[ni],next[i]];setSelected(next); };
  return <div className="page"><PageTitle eyebrow="林冠宇 · Backend Engineer" title="建立面試試卷" text="安排題目順序、確認作答時間，再產生面試邀請。" action={<Button kind="secondary" onClick={()=>showToast("草稿已儲存")}>儲存草稿</Button>} />
    <div className="stepper"><div className="done"><span>✓</span>候選人資訊</div><i/><div className="active"><span>2</span>選題與排序</div><i/><div><span>3</span>預覽與邀請</div></div>
    <div className="builder-layout"><section className="panel"><div className="panel-head"><div><h2>面試題目</h2><p>拖曳或使用箭頭調整順序</p></div><button className="text-btn" onClick={() => navigate("questions")}>＋ 從題庫加入</button></div>
      {picked.length ? <div className="picked-list">{picked.map((q,i)=><div className="picked" key={q.id}><span className="drag">⠿</span><span className="number">{i+1}</span><div><h3>{q.title}</h3><p><span className={`type type-${q.type}`}>{q.type}</span> · {q.difficulty} · {q.minutes} 分鐘</p></div><div className="order"><button onClick={()=>move(i,-1)}>↑</button><button onClick={()=>move(i,1)}>↓</button><button onClick={()=>setSelected(selected.filter(id=>id!==q.id))}>×</button></div></div>)}</div> : <div className="empty"><Icon name="▤" /><h3>尚未加入題目</h3><p>從題庫選擇適合這場面試的題目。</p><Button onClick={() => navigate("questions")}>前往題庫</Button></div>}
    </section><aside className="panel summary-card"><h2>面試摘要</h2><div className="candidate-summary"><div className="avatar lg">林</div><div><strong>林冠宇</strong><small>Backend Engineer</small></div></div><dl><div><dt>題目數量</dt><dd>{picked.length} 題</dd></div><div><dt>SQL／程式／問答</dt><dd>{picked.filter(q=>q.type==="SQL").length} / {picked.filter(q=>q.type==="程式設計").length} / {picked.filter(q=>q.type==="技術問答").length}</dd></div><div className="total"><dt>預估總作答時間</dt><dd>{picked.reduce((a,q)=>a+q.minutes,0)} 分鐘</dd></div></dl><div className="summary-note"><Icon name="i" />建議控制在 60–90 分鐘，為候選人保留檢查時間。</div><Button disabled={!picked.length} onClick={() => navigate("invite")}>預覽並產生邀請 →</Button></aside></div>
  </div>;
}

function Invite({ navigate, showToast }: { navigate: (v: View) => void; showToast: (s: string) => void }) {
  return <div className="page narrow"><button className="back" onClick={()=>navigate("builder")}>← 返回面試組卷</button><div className="success-hero"><span>✓</span><h1>面試邀請已建立</h1><p>你可以將專屬連結與驗證碼提供給候選人。</p></div><section className="panel invite-card"><div className="invite-person"><div className="avatar lg">林</div><div><h2>林冠宇</h2><p>Backend Engineer · 技術面試</p></div><Badge status="待寄送" /></div><div className="credential"><label>面試專屬連結</label><div><code>https://{demoInterview.url.replace("DA","BE")}</code><Button kind="secondary" onClick={()=>showToast("面試連結已複製")}>複製連結</Button></div></div><div className="credential split"><div><label>6 位數驗證碼</label><strong>163 820</strong><button onClick={()=>showToast("驗證碼已複製")}>複製</button></div><div><label>有效期限</label><strong>2026/08/05 18:00</strong><small>Asia/Taipei</small></div></div><div className="invite-note"><Icon name="i" /><div><strong>Demo 模式</strong><p>系統不會寄出真實 Email。展示時請直接複製邀請資訊。</p></div></div><div className="invite-actions"><Button kind="secondary" onClick={()=>navigate("dashboard")}>回到工作台</Button><Button onClick={()=>showToast("Demo 邀請已標記為寄送")}>標記為已寄送</Button></div></section></div>;
}

const evals = [
  ["題意理解", 4, "能正確拆解 cohort 與次月活躍定義，未混淆訂單月與註冊月。"],
  ["解題方法", 4, "使用 CTE 分層處理 cohort 與 retention，步驟清楚。"],
  ["正確性", 3, "主要邏輯正確，但未完整處理無訂單月份。"],
  ["效率與複雜度", 4, "避免逐列子查詢，聚合與 join 選擇合理。"],
  ["邊界條件", 2, "未說明分母為零與跨年月份的處理。"],
  ["表達與推理", 4, "註解精簡，能說明選擇此解法的原因。"],
];

function TechReview({ navigate, showToast, status }: { navigate: (v: View) => void; showToast: (s: string) => void; status: Status }) {
  const [scores,setScores]=useState(evals.map(e=>e[1] as number)); const [tab,setTab]=useState(0); const [note,setNote]=useState("SQL 基礎扎實，能清楚說明解題步驟。建議後續面談確認邊界條件敏感度。");
  return <div className="page review-page"><button className="back" onClick={()=>navigate("dashboard")}>← 返回工作台</button><PageTitle title="陳怡安的面試審核" text="Junior Data Analyst · 2026/07/28 提交" action={<Badge status={status} />} />
    <div className="ai-warning"><Icon name="i" /><strong>AI 評估僅供輔助，最終結果由面試官確認。</strong><span>請根據候選人完整作答與你的專業判斷調整分數。</span></div>
    <div className="review-layout"><div><section className="panel candidate-info"><div className="person"><span>陳</span><div><strong>陳怡安</strong><small>yian.chen@example.com</small></div></div><dl><div><dt>作答時間</dt><dd>82 分 14 秒</dd></div><div><dt>完成題數</dt><dd>3 / 3</dd></div><div><dt>AI 提示</dt><dd>3 次</dd></div><div><dt>提交時間</dt><dd>07/28 16:42</dd></div></dl></section>
      <section className="panel answer-panel"><div className="question-tabs">{["Q1 連續活躍用戶","Q2 電商月留存率","Q3 資料品質異常"].map((t,i)=><button key={t} className={tab===i?"active":""} onClick={()=>setTab(i)}>{t}<span>{i===2?"問答":"SQL"} · {[24,31,27][i]} 分</span></button>)}</div><div className="answer-content"><div className="answer-head"><div><span>第 {tab+1} 題</span><h2>{[questions[0].title,questions[1].title,questions[7].title][tab]}</h2></div><span className="time-chip">停留 {[24,31,27][tab]}:0{tab+2}</span></div><p>{[questions[0].description,questions[1].description,questions[7].description][tab]}</p>
      {tab<2?<pre className="answer-code"><code>{tab===0?`WITH daily AS (\n  SELECT DISTINCT user_id, DATE(login_at) AS dt\n  FROM login_events\n), grouped AS (\n  SELECT *, dt - ROW_NUMBER() OVER (\n    PARTITION BY user_id ORDER BY dt\n  ) * INTERVAL '1 day' AS grp\n  FROM daily\n)\nSELECT user_id, MIN(dt), MAX(dt)\nFROM grouped\nGROUP BY user_id, grp\nHAVING COUNT(*) >= 3;`:`WITH cohorts AS (\n  SELECT id, DATE_TRUNC('month', created_at) cohort\n  FROM users\n), active AS (\n  SELECT DISTINCT user_id, DATE_TRUNC('month', created_at) active_month\n  FROM orders\n)\nSELECT cohort, COUNT(active.user_id)::float / COUNT(cohorts.id)\nFROM cohorts LEFT JOIN active ON ...\nGROUP BY cohort;`}</code></pre>:<div className="text-answer">我會先確認這 35% 是真實業務變化還是資料問題。第一步比較來源系統的訂單筆數與金額，再依日期、渠道、商品拆解差異；同時確認退貨、取消與幣別轉換規則是否改變。若確認是異常，我會先在儀表板標示資料調查中，通知使用者暫緩決策，接著定位 ETL 或上游事件的變更並補算歷史資料。最後補上品質檢查與異常告警。</div>}
      <div className="hint-log"><h3>AI 提示使用紀錄</h3>{tab===0?<div className="empty-inline">本題未使用 AI 提示</div>:<div className="hint-item"><span>等級 {tab+1}</span><div><strong>{tab===1?"提醒思考方向":"提醒可能遺漏的邊界條件"}</strong><p>{tab===1?"先分開定義註冊 cohort 與後續活躍月份，再思考兩者如何對齊。":"除了來源筆數，也想想金額欄位的幣別、取消與退款狀態是否一致。"}</p><small>15:{tab===1?"24":"51"} · 第 {tab+1} 題</small></div></div>}</div></div></section></div>
      <aside><section className="panel ai-score"><div className="panel-head"><div><h2>AI 初步分析</h2><p>基於作答內容與過程紀錄</p></div><span className="ai-tag">Mock AI</span></div><div className="strength"><strong>整體觀察</strong><p>候選人具備良好的 SQL 拆解能力與清楚表達，主要疑點在邊界條件與資料完整性考量。</p></div>{evals.map((e,i)=><div className="eval" key={e[0]}><div className="eval-head"><strong>{e[0]}</strong><span>AI {e[1]}/5</span></div><p>{e[2]}</p><div className="score-control"><label>人工評分</label><div>{[1,2,3,4,5].map(n=><button key={n} className={scores[i]===n?"active":""} onClick={()=>setScores(scores.map((s,j)=>j===i?n:s))}>{n}</button>)}</div></div></div>)}</section>
      <section className="panel reviewer-note"><h2>面試官備註</h2><textarea value={note} onChange={e=>setNote(e.target.value)} /><div className="decision"><label>技術建議</label><select><option>建議進入下一階段</option><option>需要進一步討論</option><option>不建議進入下一階段</option></select></div><Button onClick={()=>showToast("人工審核已儲存，HR 可查看摘要")}>確認並完成審核</Button></section></aside></div>
  </div>;
}

export function LegacyHrSummary({ result, setModal }: { result: string; setModal: (m:"result")=>void }) {
  return <div className="page review-page"><PageTitle title="陳怡安的面試摘要" text="Junior Data Analyst · 技術審核已完成" action={<Badge status="已完成" />} /><div className="summary-banner"><div><small>技術主管建議</small><h2>建議進入下一階段</h2><p>SQL 基礎扎實、表達清楚；建議後續面談確認邊界條件敏感度。</p></div><div className="score-ring"><strong>21</strong><span>/ 30</span></div></div><div className="three-summary">{[["作答完成度","3 / 3","全數作答"],["實際作答時間","82 分鐘","預估 75 分鐘"],["AI 提示使用","3 次","未提供完整答案"]].map(x=><div className="panel" key={x[0]}><small>{x[0]}</small><strong>{x[1]}</strong><span>{x[2]}</span></div>)}</div><section className="panel hr-result"><div><h2>招募結果</h2><p>此決策由 HR 根據完整面試摘要與團隊討論後確認。</p></div><div className="result-chip">{result}</div><Button onClick={()=>setModal("result")}>更新招募結果</Button></section><section className="panel"><div className="panel-head"><div><h2>能力摘要</h2><p>僅呈現招募決策需要的重點，不包含詳細程式碼分析</p></div></div><div className="ability-grid">{evals.map((e,i)=><div key={e[0]}><div><strong>{e[0]}</strong><span>{[4,4,3,4,2,4][i]} / 5</span></div><div className="bar"><i style={{width:`${[80,80,60,80,40,80][i]}%`}}/></div></div>)}</div></section></div>;
}

function HrSummary({ result, status, setModal }: { result: string; status: Status; setModal: (m:"result")=>void }) {
  return <div className="page review-page"><PageTitle title="陳怡安的面試摘要" text="Junior Data Analyst · 技術審核摘要" action={<Badge status={status} />} />
    <div className="summary-banner"><div><small>技術主管建議</small><h2>建議進入下一階段</h2><p>SQL 基礎扎實、表達清楚；建議後續面談確認邊界條件敏感度。</p></div><div className="score-ring"><strong>21</strong><span>/ 30</span></div></div>
    <div className="three-summary">{[["作答完成度","3 / 3","全數作答"],["實際作答時間","82 分鐘","預估 75 分鐘"],["AI 提示使用","3 次","未提供完整答案"]].map(x=><div className="panel" key={x[0]}><small>{x[0]}</small><strong>{x[1]}</strong><span>{x[2]}</span></div>)}</div>
    <section className="panel hr-result"><div><h2>招募結果</h2><p>此決策由 HR 根據完整面試摘要與團隊討論後確認。</p></div><div className="result-chip">{result}</div><Button onClick={()=>setModal("result")}>更新招募結果</Button></section>
    <section className="panel"><div className="panel-head"><div><h2>能力摘要</h2><p>僅呈現招募決策需要的重點，不包含詳細程式碼分析</p></div></div><div className="ability-grid">{evals.map((e,i)=><div key={e[0]}><div><strong>{e[0]}</strong><span>{[4,4,3,4,2,4][i]} / 5</span></div><div className="bar"><i style={{width:`${[80,80,60,80,40,80][i]}%`}}/></div></div>)}</div></section>
  </div>;
}

function CandidateFlow({ view, navigate, modal, setModal, status, setStatus, showToast }: { view: View; navigate:(v:View)=>void; modal:string; setModal:(m:""| "submit")=>void; status: Status; setStatus:(s:Status)=>void; showToast:(s:string)=>void }) {
  const examQs = [questions[0], questions[1], questions[7]];
  const [email,setEmail]=useState("");
  const [code,setCode]=useState("");
  const [error,setError]=useState("");
  const [confirmed,setConfirmed]=useState(false);
  const [answers,setAnswers]=useState(["","", ""]);
  const [q,setQ]=useState(0);
  const [hints,setHints]=useState<{q:number;level:number;text:string;time:string}[]>([]);
  const [remainingSeconds,setRemainingSeconds]=useState(75 * 60);
  const [submitting,setSubmitting]=useState(false);
  const submittedRef=useRef(false);
  const progress: { completedCount:number; incompleteCount:number; incompleteIndexes:number[]; incompleteQuestions:string[] }=getAnswerProgress(answers, examQs.map(question=>question.title));
  const verify=(e:React.FormEvent)=>{e.preventDefault();if(email.toLowerCase()===demoInterview.email&&code===demoInterview.code){setError("");navigate("brief")}else setError("Email 或驗證碼不正確，請確認後再試一次。");};
  const submitInterview=(source:"manual"|"timeout")=>{const claim=claimSubmission(submittedRef.current,source);if(!claim.shouldSubmit)return;submittedRef.current=claim.submitted;setSubmitting(true);setModal("");setStatus("已提交");navigate("done");};
  useEffect(()=>{if(view!=="exam"||submittedRef.current)return;const timer=window.setInterval(()=>setRemainingSeconds(value=>Math.max(0,value-1)),1000);return()=>window.clearInterval(timer);},[view]);
  useEffect(()=>{if(view==="exam"&&remainingSeconds===0)submitInterview("timeout");},[view,remainingSeconds]);
  const useHint=(level:number)=>{if(submittedRef.current)return;const texts=["先用自己的話重述輸入資料、要找的對象，以及輸出的欄位。","想想是否能先把同一天的登入去重，再為連續日期建立分組識別。","檢查空資料、同日多次登入，以及超過三天連續紀錄的處理。","可以比較每筆日期與排序序號的差值；連續日期會得到相同的分組鍵。"];const now=new Date().toLocaleTimeString("zh-TW",{hour:"2-digit",minute:"2-digit"});setHints(current=>[...current,{q:q+1,level,text:texts[level-1],time:now}]);showToast(`已記錄第 ${level} 級提示`);};

  if(view==="verify") return <main className="candidate-entry"><div className="candidate-nav"><Brand /><button onClick={()=>location.reload()}>切換 Demo 角色</button></div><div className="verify-layout"><section><div className="eyebrow">候選人面試入口</div><h1>嗨，陳怡安<br/>準備好展現你的思考方式了嗎？</h1><p>完成身分驗證後，你會先看到面試說明與注意事項。</p><div className="interview-preview"><span>Junior Data Analyst</span><h2>資料分析技術面試</h2><div><span><Icon name="◷"/> 75 分鐘</span><span><Icon name="▤"/> 3 題</span><span><Icon name="⌁"/> 期限 8/2</span></div></div></section><form className="verify-card" onSubmit={verify}><div className="lock">⌁</div><h2>驗證面試身分</h2><p>請輸入邀請信中的 Email 與 6 位數驗證碼。</p><label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" /></label><label>6 位數驗證碼<input required className="code-input" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="000000" inputMode="numeric" /></label>{error&&<div className="form-error" role="alert">! {error}</div>}<Button type="submit" disabled={!email||code.length!==6}>驗證並繼續 →</Button><div className="demo-credential"><strong>Demo 驗證資料</strong><span>{demoInterview.email}</span><span>{demoInterview.code}</span></div></form></div></main>;
  if(view==="brief") return <main className="brief-page"><div className="candidate-nav"><Brand/><Badge status={status}/></div><section className="brief-card"><div className="brief-head"><span>資料分析技術面試</span><h1>開始前，請先閱讀面試說明</h1><p>Junior Data Analyst · 候選人：陳怡安</p></div><div className="brief-metrics"><div><Icon name="◷"/><strong>75 分鐘</strong><span>倒數計時</span></div><div><Icon name="▤"/><strong>3 題</strong><span>2 題 SQL · 1 題問答</span></div><div><Icon name="◇"/><strong>工作階段暫存</strong><span>重新整理後不保留</span></div></div><div className="instructions"><h2>作答須知</h2><ol><li><span>1</span><div><strong>安排不受打擾的時間</strong><p>面試開始後會持續倒數，無法暫停。</p></div></li><li><span>2</span><div><strong>可以使用 AI 提示</strong><p>共四級提示，使用紀錄會提供面試官參考，但不會顯示完整答案。</p></div></li><li><span>3</span><div><strong>提交前仔細確認</strong><p>提交後將無法返回或修改任何答案。</p></div></li></ol></div><label className="confirm-check"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> 我已閱讀並了解以上說明，準備開始面試。</label><Button disabled={!confirmed} onClick={()=>{setStatus("作答中");navigate("exam")}}>開始面試</Button></section></main>;
  if(view==="done") return <main className="done-page"><Brand/><section><span className="big-check">✓</span><div className="eyebrow">提交成功</div><h1>謝謝你完成面試，陳怡安。</h1><p>你的答案已在此 Demo 工作階段提交。HR 將在團隊完成審核後與你聯繫。</p><div className="receipt"><div><span>面試</span><strong>Junior Data Analyst 技術面試</strong></div><div><span>完成題數</span><strong>{progress.completedCount} / {answers.length}</strong></div><div><span>提交狀態</span><Badge status={status}/></div><div><span>AI 提示使用</span><strong>{hints.length} 次</strong></div></div><small>你現在可以安全關閉此頁面。</small></section></main>;
  return <main className="exam"><header className="exam-top"><Brand/><div><strong>資料分析技術面試</strong><span>答案暫存於本工作階段</span></div><div className="timer"><small>剩餘時間</small><strong>{formatCountdown(remainingSeconds)}</strong></div><Button kind="danger" disabled={submitting} onClick={()=>setModal("submit")}>提交面試</Button></header><div className="exam-body"><aside className="q-nav"><h3>題目導覽</h3>{examQs.map((x,i)=><button key={x.id} className={q===i?"active":""} onClick={()=>setQ(i)}><span>{answers[i].trim()?"✓":i+1}</span><div><strong>{x.title}</strong><small>{x.type} · {x.minutes} 分鐘</small></div></button>)}<div className="nav-legend"><span><i className="answered"/>已作答</span><span><i/>未作答</span></div></aside><section className="workspace"><div className="question-content"><div className="q-kicker"><span>第 {q+1} 題，共 3 題</span><span className={`type type-${examQs[q].type}`}>{examQs[q].type}</span><span className={`difficulty d-${examQs[q].difficulty}`}>{examQs[q].difficulty}</span></div><h1>{examQs[q].title}</h1><p>{examQs[q].description}</p><div className="schema"><strong>{examQs[q].type==="技術問答"?"回答方向":"資料表結構／輸入輸出"}</strong><code>{examQs[q].detail}</code></div><div className="example"><strong>範例</strong><p>{examQs[q].example}</p></div></div><div className="editor"><div className="editor-bar"><span>{examQs[q].type==="SQL"?"SQL":"文字作答"}</span><span>工作階段已更新 ✓</span></div><textarea disabled={submitting||submittedRef.current} spellCheck={false} value={answers[q]} onChange={e=>setAnswers(current=>current.map((answer,i)=>i===q?e.target.value:answer))} placeholder={examQs[q].type==="技術問答"?"請輸入你的分析、判斷與理由…":"-- 在這裡輸入你的答案\nSELECT ..."} /></div><div className="exam-nav"><Button kind="secondary" disabled={q===0||submitting} onClick={()=>setQ(q-1)}>← 上一題</Button><span>第 {q+1} / 3 題</span><Button disabled={q===2||submitting} onClick={()=>setQ(q+1)}>下一題 →</Button></div></section><aside className="ai-panel"><div className="ai-title"><span>✦</span><div><h3>AI 思考提示</h3><p>幫你推進思路，不提供答案</p></div></div><div className="hint-levels">{[["重新解釋題意","用不同方式釐清這題在問什麼"],["提醒思考方向","提供一個開始分析的角度"],["檢查邊界條件","提醒可能遺漏的特殊情況"],["較明確的解題提示","給出更具體但非完整答案的提示"]].map((x,i)=><button disabled={submitting} key={x[0]} onClick={()=>useHint(i+1)}><span>{i+1}</span><div><strong>{x[0]}</strong><small>{x[1]}</small></div><b>→</b></button>)}</div>{hints.filter(h=>h.q===q+1).length>0&&<div className="current-hints"><h4>本題提示紀錄</h4>{hints.filter(h=>h.q===q+1).map((h,i)=><div key={i}><span>L{h.level}</span><p>{h.text}</p><small>{h.time}</small></div>)}</div>}<div className="ai-disclaimer"><Icon name="i"/>所有提示使用時間、題號與內容都會記錄供面試官參考。</div></aside></div>{modal==="submit"&&<div className="modal-backdrop"><div className="modal small"><div className="danger-icon">!</div><h2>確定要提交面試嗎？</h2><p>提交後將無法繼續修改任何答案。</p><div className="submission-summary"><strong>已完成 {progress.completedCount} 題</strong><strong>未完成 {progress.incompleteCount} 題</strong></div>{progress.incompleteCount>0&&<div className="form-error" role="alert"><strong>未作答題目：</strong><ul>{progress.incompleteQuestions.map((title,index)=><li key={title}>第 {progress.incompleteIndexes[index]+1} 題：{title}</li>)}</ul><span>你仍可確認提交未完成答案。</span></div>}<div className="modal-actions"><Button kind="secondary" disabled={submitting} onClick={()=>setModal("")}>返回檢查</Button><Button kind="danger" disabled={submitting} onClick={()=>submitInterview("manual")}>{submitting?"提交中…":"確認提交"}</Button></div></div></div>}</main>;
}

export function LegacyCandidateFlow({ view, navigate, modal, setModal, setStatus, showToast }: { view: View; navigate:(v:View)=>void; modal:string; setModal:(m:""| "submit")=>void; setStatus:(s:Status)=>void; showToast:(s:string)=>void }) {
  const [email,setEmail]=useState(""); const [code,setCode]=useState(""); const [error,setError]=useState(""); const [answers,setAnswers]=useState(["","", ""]); const [q,setQ]=useState(0); const [hints,setHints]=useState<{q:number;level:number;text:string;time:string}[]>([]);
  const verify=(e:React.FormEvent)=>{e.preventDefault();if(email.toLowerCase()===demoInterview.email&&code===demoInterview.code){setError("");navigate("brief")}else setError("Email 或驗證碼不正確，請確認後再試一次。");};
  if(view==="verify") return <main className="candidate-entry"><div className="candidate-nav"><Brand /><button onClick={()=>location.reload()}>切換 Demo 角色</button></div><div className="verify-layout"><section><div className="eyebrow">候選人面試入口</div><h1>嗨，陳怡安<br/>準備好展現你的思考方式了嗎？</h1><p>完成身分驗證後，你會先看到面試說明與注意事項。</p><div className="interview-preview"><span>Junior Data Analyst</span><h2>資料分析技術面試</h2><div><span><Icon name="◷"/> 75 分鐘</span><span><Icon name="▤"/> 3 題</span><span><Icon name="⌁"/> 期限 8/2</span></div></div></section><form className="verify-card" onSubmit={verify}><div className="lock">⌁</div><h2>驗證面試身分</h2><p>請輸入邀請信中的 Email 與 6 位數驗證碼。</p><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" /></label><label>6 位數驗證碼<input className="code-input" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="000000" inputMode="numeric" /></label>{error&&<div className="form-error">! {error}</div>}<Button type="submit">驗證並繼續 →</Button><div className="demo-credential"><strong>Demo 驗證資料</strong><span>{demoInterview.email}</span><span>{demoInterview.code}</span></div></form></div></main>;
  if(view==="brief") return <main className="brief-page"><div className="candidate-nav"><Brand/><Badge status="等待面試者開始"/></div><section className="brief-card"><div className="brief-head"><span>資料分析技術面試</span><h1>開始前，請先閱讀面試說明</h1><p>Junior Data Analyst · 候選人：陳怡安</p></div><div className="brief-metrics"><div><Icon name="◷"/><strong>75 分鐘</strong><span>倒數計時</span></div><div><Icon name="▤"/><strong>3 題</strong><span>2 題 SQL · 1 題問答</span></div><div><Icon name="◇"/><strong>自動儲存</strong><span>離開前會保留作答</span></div></div><div className="instructions"><h2>作答須知</h2><ol><li><span>1</span><div><strong>安排不受打擾的時間</strong><p>面試開始後會持續倒數，無法暫停。</p></div></li><li><span>2</span><div><strong>可以使用 AI 提示</strong><p>共四級提示，使用紀錄會提供面試官參考，但不會顯示完整答案。</p></div></li><li><span>3</span><div><strong>提交前仔細確認</strong><p>提交後將無法返回或修改任何答案。</p></div></li></ol></div><label className="confirm-check"><input type="checkbox" defaultChecked/> 我已閱讀並了解以上說明，準備開始面試。</label><Button onClick={()=>{setStatus("作答中");navigate("exam")}}>開始面試</Button></section></main>;
  if(view==="done") return <main className="done-page"><Brand/><section><span className="big-check">✓</span><div className="eyebrow">提交成功</div><h1>謝謝你完成面試，陳怡安。</h1><p>你的答案已安全提交。HR 將在團隊完成審核後與你聯繫。</p><div className="receipt"><div><span>面試</span><strong>Junior Data Analyst 技術面試</strong></div><div><span>完成題數</span><strong>3 / 3</strong></div><div><span>提交狀態</span><Badge status="已提交"/></div><div><span>AI 提示使用</span><strong>{hints.length} 次</strong></div></div><small>你現在可以安全關閉此頁面。</small></section></main>;
  const examQs=[questions[0],questions[1],questions[7]];
  const useHint=(level:number)=>{const texts=["先用自己的話重述輸入資料、要找的對象，以及輸出的欄位。","想想是否能先把同一天的登入去重，再為連續日期建立分組識別。","檢查空資料、同日多次登入，以及超過三天連續紀錄的處理。","可以比較每筆日期與排序序號的差值；連續日期會得到相同的分組鍵。"];const now=new Date().toLocaleTimeString("zh-TW",{hour:"2-digit",minute:"2-digit"});setHints([...hints,{q:q+1,level,text:texts[level-1],time:now}]);showToast(`已記錄第 ${level} 級提示`);};
  return <main className="exam"><header className="exam-top"><Brand/><div><strong>資料分析技術面試</strong><span>自動儲存於剛剛</span></div><div className="timer"><small>剩餘時間</small><strong>01:08:42</strong></div><Button kind="danger" onClick={()=>setModal("submit")}>提交面試</Button></header><div className="exam-body"><aside className="q-nav"><h3>題目導覽</h3>{examQs.map((x,i)=><button key={x.id} className={q===i?"active":""} onClick={()=>setQ(i)}><span>{answers[i]?"✓":i+1}</span><div><strong>{x.title}</strong><small>{x.type} · {x.minutes} 分鐘</small></div></button>)}<div className="nav-legend"><span><i className="answered"/>已作答</span><span><i/>未作答</span></div></aside><section className="workspace"><div className="question-content"><div className="q-kicker"><span>第 {q+1} 題，共 3 題</span><span className={`type type-${examQs[q].type}`}>{examQs[q].type}</span><span className={`difficulty d-${examQs[q].difficulty}`}>{examQs[q].difficulty}</span></div><h1>{examQs[q].title}</h1><p>{examQs[q].description}</p><div className="schema"><strong>{examQs[q].type==="技術問答"?"回答方向":"資料表結構／輸入輸出"}</strong><code>{examQs[q].detail}</code></div><div className="example"><strong>範例</strong><p>{examQs[q].example}</p></div></div><div className="editor"><div className="editor-bar"><span>{examQs[q].type==="SQL"?"SQL":examQs[q].type==="程式設計"?"JavaScript":"文字作答"}</span><span>已儲存 ✓</span></div><textarea spellCheck={false} value={answers[q]} onChange={e=>setAnswers(answers.map((a,i)=>i===q?e.target.value:a))} placeholder={examQs[q].type==="技術問答"?"請輸入你的分析、判斷與理由…":"-- 在這裡輸入你的答案\nSELECT ..."} /></div><div className="exam-nav"><Button kind="secondary" disabled={q===0} onClick={()=>setQ(q-1)}>← 上一題</Button><span>第 {q+1} / 3 題</span><Button disabled={q===2} onClick={()=>setQ(q+1)}>下一題 →</Button></div></section><aside className="ai-panel"><div className="ai-title"><span>✦</span><div><h3>AI 思考提示</h3><p>幫你推進思路，不提供答案</p></div></div><div className="hint-levels">{[["重新解釋題意","用不同方式釐清這題在問什麼"],["提醒思考方向","提供一個開始分析的角度"],["檢查邊界條件","提醒可能遺漏的特殊情況"],["較明確的解題提示","給出更具體但非完整答案的提示"]].map((x,i)=><button key={x[0]} onClick={()=>useHint(i+1)}><span>{i+1}</span><div><strong>{x[0]}</strong><small>{x[1]}</small></div><b>→</b></button>)}</div>{hints.filter(h=>h.q===q+1).length>0&&<div className="current-hints"><h4>本題提示紀錄</h4>{hints.filter(h=>h.q===q+1).map((h,i)=><div key={i}><span>L{h.level}</span><p>{h.text}</p><small>{h.time}</small></div>)}</div>}<div className="ai-disclaimer"><Icon name="i"/>所有提示使用時間、題號與內容都會記錄供面試官參考。</div></aside></div>{modal==="submit"&&<div className="modal-backdrop"><div className="modal small"><div className="danger-icon">!</div><h2>確定要提交面試嗎？</h2><p>提交後將無法繼續修改任何答案。你目前完成 <strong>{answers.filter(Boolean).length} / 3</strong> 題。</p>{answers.filter(Boolean).length<3&&<div className="form-error">尚有 {3-answers.filter(Boolean).length} 題未作答</div>}<div className="modal-actions"><Button kind="secondary" onClick={()=>setModal("")}>返回檢查</Button><Button kind="danger" onClick={()=>{setStatus("已提交");setModal("");navigate("done")}}>確認提交</Button></div></div></div>}</main>;
}

function NewCandidate({ candidates, onClose, onSave }: { candidates: typeof seedCandidates; onClose:()=>void; onSave:(c:typeof seedCandidates[number])=>void }) {
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [job,setJob]=useState("");
  const [lead,setLead]=useState("");
  const [due,setDue]=useState("");
  const [errors,setErrors]=useState<string[]>([]);
  const [saving,setSaving]=useState(false);
  const jobs=useMemo(()=>[...new Set(candidates.map(candidate=>candidate.job))].sort(),[candidates]);
  const leads=useMemo(()=>[...new Set(candidates.map(candidate=>candidate.lead))].sort(),[candidates]);
  const requiredReady=Boolean(name.trim()&&email.trim()&&job&&lead&&due);
  const submit=(event:React.FormEvent)=>{event.preventDefault();if(saving)return;const nextErrors:string[]=[];if(!name.trim()||!email.trim()||!job||!lead||!due)nextErrors.push("請完整填寫所有必填欄位。");if(email.trim()&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))nextErrors.push("請輸入有效的 Email 格式。");if(due&&new Date(due).getTime()<=Date.now())nextErrors.push("面試期限必須晚於目前時間。");setErrors(nextErrors);if(nextErrors.length)return;setSaving(true);onSave({candidate:name.trim(),email:email.trim().toLowerCase(),job,lead,due:due.replace("T"," "),code:String(Math.floor(100000+Math.random()*900000)),url:`talentscope.demo/i/${Date.now()}`,status:"草稿"});};
  return <div className="modal-backdrop"><form className="modal" onSubmit={submit} noValidate><div className="modal-head"><div><h2>新增候選人</h2><p>建立候選人資料並指派技術主管。</p></div><button type="button" onClick={onClose}>×</button></div>{errors.length>0&&<div className="form-error" role="alert"><strong>無法建立候選人：</strong><ul>{errors.map(message=><li key={message}>{message}</li>)}</ul></div>}<fieldset><legend>基本資料</legend><div className="form-grid"><label>候選人姓名<input required value={name} onChange={e=>setName(e.target.value)} placeholder="例：陳怡安"/></label><label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/></label></div></fieldset><fieldset><legend>面試安排</legend><div className="form-grid"><label>應徵職缺<select required value={job} onChange={e=>setJob(e.target.value)}><option value="">請選擇職缺</option>{jobs.map(value=><option key={value}>{value}</option>)}</select></label><label>技術主管<select required value={lead} onChange={e=>setLead(e.target.value)}><option value="">請選擇技術主管</option>{leads.map(value=><option key={value}>{value}</option>)}</select></label><label className="full">面試期限<input required type="datetime-local" value={due} onChange={e=>setDue(e.target.value)}/></label></div></fieldset><div className="modal-actions"><Button kind="secondary" disabled={saving} onClick={onClose}>取消</Button><Button type="submit" disabled={!requiredReady||saving}>{saving?"建立中…":"建立候選人與面試"}</Button></div></form></div>;
}

export function LegacyNewCandidate({ onClose, onSave }: { onClose:()=>void; onSave:(c:typeof seedCandidates[number])=>void }) {
  const [name,setName]=useState(""); const [email,setEmail]=useState("");
  return <div className="modal-backdrop"><form className="modal" onSubmit={e=>{e.preventDefault();onSave({candidate:name,email,job:"Junior Data Analyst",lead:"王柏翰",due:"2026/08/08 18:00",code:"284631",url:"talentscope.demo/i/DA-260808",status:"草稿"})}}><div className="modal-head"><div><h2>新增候選人</h2><p>建立候選人資料並指派技術主管。</p></div><button type="button" onClick={onClose}>×</button></div><fieldset><legend>基本資料</legend><div className="form-grid"><label>候選人姓名<input required value={name} onChange={e=>setName(e.target.value)} placeholder="例：陳怡安"/></label><label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/></label></div></fieldset><fieldset><legend>面試安排</legend><div className="form-grid"><label>應徵職缺<select><option>Junior Data Analyst</option><option>Backend Engineer</option><option>Product Analyst</option></select></label><label>技術主管<select><option>王柏翰</option><option>李欣蓉</option></select></label><label className="full">面試期限<input type="datetime-local" defaultValue="2026-08-08T18:00"/></label></div></fieldset><div className="modal-actions"><Button kind="secondary" onClick={onClose}>取消</Button><Button type="submit">建立候選人與面試</Button></div></form></div>;
}

function ResultModal({ result, onClose, onSave }: { result:string; onClose:()=>void; onSave:(v:string)=>void }) {
  const [value,setValue]=useState(result);
  return <div className="modal-backdrop"><div className="modal small"><div className="modal-head"><div><h2>更新招募結果</h2><p>此決策不會由 AI 自動產生。</p></div><button onClick={onClose}>×</button></div><div className="result-options">{["通過","不通過","待討論"].map(x=><button key={x} className={value===x?"active":""} onClick={()=>setValue(x)}><span>{value===x?"●":"○"}</span><div><strong>{x}</strong><small>{x==="通過"?"建議進入下一階段":x==="不通過"?"結束本次招募流程":"需要團隊進一步討論"}</small></div></button>)}</div><div className="modal-actions"><Button kind="secondary" onClick={onClose}>取消</Button><Button onClick={()=>onSave(value)}>儲存結果</Button></div></div></div>;
}

function QuestionEditor({ onClose, showToast }: { onClose:()=>void; showToast:(s:string)=>void }) {
  const [preview,setPreview]=useState(false);
  return <div className="modal-backdrop editor-modal"><div className="modal"><div className="modal-head"><div><h2>{preview?"題目預覽":"建立新題目"}</h2><p>{preview?"以候選人視角檢查題目內容。":"建立自有題目，可先儲存為草稿。"}</p></div><button onClick={onClose}>×</button></div>{preview?<div className="editor-preview"><span className="type type-SQL">SQL</span><h2>每週活躍使用者</h2><p>計算指定月份中每週至少登入一次的使用者數量。</p><div className="schema"><strong>資料表結構</strong><code>login_events(user_id INT, login_at TIMESTAMP)</code></div></div>:<div className="question-form"><fieldset><legend>題目基本資訊</legend><div className="form-grid"><label className="full">題目名稱<input defaultValue="每週活躍使用者"/></label><label>題型<select><option>SQL</option><option>程式設計</option><option>技術問答</option></select></label><label>難度<select><option>簡單</option><option>中等</option><option>困難</option></select></label><label className="full">技能標籤<input defaultValue="SQL, Aggregation, 日期處理"/></label></div></fieldset><fieldset><legend>題目內容</legend><label>題目描述<textarea defaultValue="計算指定月份中每週至少登入一次的使用者數量。"/></label><label>資料表結構或輸入／輸出說明<textarea defaultValue="login_events(user_id INT, login_at TIMESTAMP)"/></label><label>範例<textarea defaultValue="2026-W27 | 1,240"/></label></fieldset><fieldset><legend>評分設定</legend><div className="form-grid"><label>評分標準<textarea defaultValue="日期分組 40%、去重 30%、邊界處理 30%"/></label><label>預估作答時間（分鐘）<input type="number" defaultValue="20"/></label></div></fieldset></div>}<div className="modal-actions"><Button kind="secondary" onClick={()=>{showToast("草稿已儲存");onClose()}}>儲存草稿</Button><Button onClick={()=>setPreview(!preview)}>{preview?"返回編輯":"預覽題目"}</Button></div></div></div>;
}
