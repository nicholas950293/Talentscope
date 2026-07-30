"use client";

import { useState } from "react";
import type { Candidate, InterviewStatus, RecruitmentResult, View } from "../../domain/types";
import { Badge, Button, Icon, PageTitle } from "../../shared/ui";
import { CandidateTable } from "../HrFlow";

const EVALUATIONS = [
  ["題意理解", 4], ["解題方法", 4], ["正確性", 3], ["效率與複雜度", 4], ["邊界條件", 2], ["表達與推理", 4],
] as const;

export function HrDashboard({ candidates, setModal, navigate, result }: { candidates: Candidate[]; setModal: (modal: "candidate") => void; navigate: (view: View) => void; result: RecruitmentResult }) {
  const metrics = [["候選人總數", "12", "+3 本週", "◎"], ["等待面試", "4", "2 份將到期", "◷"], ["面試進行中", "1", "進度 67%", "▶"], ["等待技術審核", "3", "平均 1.2 天", "✓"], ["已完成", "4", "本月", "◆"], ["需要人工複核", "1", "請優先處理", "!"]];
  return <div className="page">
    <PageTitle eyebrow="早安，佳穎" title="招募進度一目了然" text="追蹤所有候選人的面試進度與待辦事項。" action={<Button onClick={() => setModal("candidate")}>＋ 新增候選人</Button>} />
    <div className="metric-grid">{metrics.map((metric, index) => <div className={`metric-card ${index === 5 ? "attention" : ""}`} key={metric[0]}><div className="metric-head"><span>{metric[0]}</span><Icon name={metric[3]} /></div><strong>{metric[1]}</strong><small>{metric[2]}</small></div>)}</div>
    <div className="two-col">
      <section className="panel wide"><div className="panel-head"><div><h2>近期候選人</h2><p>依照面試期限與審核狀態排序</p></div><button className="text-btn" onClick={() => navigate("candidates")}>查看全部 →</button></div><CandidateTable rows={candidates.slice(0, 4)} onOpen={candidate => candidate.candidate === "陳怡安" ? navigate("review") : navigate("candidates")} /></section>
      <section className="panel"><div className="panel-head"><div><h2>本週待辦</h2><p>3 個項目需要你的關注</p></div></div><div className="todo-list">
        <button onClick={() => navigate("review")}><span className="todo-icon violet">✓</span><div><strong>確認陳怡安面試結果</strong><small>技術審核已完成 · {result}</small></div><span>→</span></button>
        <button><span className="todo-icon amber">!</span><div><strong>2 份面試即將到期</strong><small>距離期限不到 24 小時</small></div><span>→</span></button>
        <button onClick={() => setModal("candidate")}><span className="todo-icon blue">＋</span><div><strong>建立新面試邀請</strong><small>Backend Engineer · 1 位</small></div><span>→</span></button>
      </div></section>
    </div>
  </div>;
}

export function HrSummary({ result, status, setModal }: { result: RecruitmentResult; status: InterviewStatus; setModal: (modal: "result") => void }) {
  return <div className="page review-page"><PageTitle title="陳怡安的面試摘要" text="Junior Data Analyst · 技術審核摘要" action={<Badge status={status} />} />
    <div className="summary-banner"><div><small>技術主管建議</small><h2>建議進入下一階段</h2><p>SQL 基礎扎實、表達清楚；建議後續面談確認邊界條件敏感度。</p></div><div className="score-ring"><strong>21</strong><span>/ 30</span></div></div>
    <div className="three-summary">{[["作答完成度", "3 / 3", "全數作答"], ["實際作答時間", "82 分鐘", "預估 75 分鐘"], ["AI 對話紀錄", "4 則", "Mock 協作紀錄"]].map(item => <div className="panel" key={item[0]}><small>{item[0]}</small><strong>{item[1]}</strong><span>{item[2]}</span></div>)}</div>
    <section className="panel hr-result"><div><h2>招募結果</h2><p>此決策由 HR 根據完整面試摘要與團隊討論後確認。</p></div><div className="result-chip">{result}</div><Button onClick={() => setModal("result")}>更新招募結果</Button></section>
    <section className="panel"><div className="panel-head"><div><h2>能力摘要</h2><p>僅呈現招募決策需要的重點，不包含詳細程式碼分析</p></div></div><div className="ability-grid">{EVALUATIONS.map(([label, score]) => <div key={label}><div><strong>{label}</strong><span>{score} / 5</span></div><div className="bar"><i style={{ width: `${score * 20}%` }} /></div></div>)}</div></section>
  </div>;
}

export function ResultModal({ result, onClose, onSave }: { result: RecruitmentResult; onClose: () => void; onSave: (value: RecruitmentResult) => void }) {
  const [value, setValue] = useState<RecruitmentResult>(result);
  const options: RecruitmentResult[] = ["通過", "不通過", "待討論"];
  return <div className="modal-backdrop"><div className="modal small"><div className="modal-head"><div><h2>更新招募結果</h2><p>此決策不會由 AI 自動產生。</p></div><button onClick={onClose}>×</button></div><div className="result-options">{options.map(option => <button key={option} className={value === option ? "active" : ""} onClick={() => setValue(option)}><span>{value === option ? "●" : "○"}</span><div><strong>{option}</strong><small>{option === "通過" ? "建議進入下一階段" : option === "不通過" ? "結束本次招募流程" : "需要團隊進一步討論"}</small></div></button>)}</div><div className="modal-actions"><Button kind="secondary" onClick={onClose}>取消</Button><Button onClick={() => onSave(value)}>儲存結果</Button></div></div></div>;
}
