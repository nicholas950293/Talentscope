"use client";

import { useMemo, useState, type ReactNode } from "react";
import { filterCandidates, INTERVIEW_STATUSES } from "../demoLogic.mjs";
import { Badge, Button, Icon } from "../demo/shared";
import type { Candidate, View } from "../demo/types";
import {
  buildCandidateRecord,
  generateInterviewCode,
  generateInterviewUrl,
  getUniqueSortedField,
  hasRequiredCandidateFields,
  validateCandidateForm,
} from "./hr/hrLogic.mjs";

export function HrFlow({ view, candidates, dashboard, summary, setModal, navigate }: { view: View; candidates: Candidate[]; dashboard: ReactNode; summary: ReactNode; setModal: (modal: "candidate") => void; navigate: (view: View) => void }) {
  if (view === "dashboard") return dashboard;
  if (view === "review") return summary;
  return <CandidateList candidates={candidates} setModal={setModal} navigate={navigate} />;
}

export function CandidateTable({ rows, onOpen }: { rows: Candidate[]; onOpen: (candidate: Candidate) => void }) {
  return <div className="table-wrap"><table><thead><tr><th>候選人</th><th>應徵職缺</th><th>技術主管</th><th>面試期限</th><th>狀態</th><th></th></tr></thead><tbody>{rows.map(candidate => <tr key={candidate.email}><td><div className="person"><span>{candidate.candidate.slice(-1)}</span><div><strong>{candidate.candidate}</strong><small>{candidate.email}</small></div></div></td><td>{candidate.job}</td><td>{candidate.lead}</td><td>{candidate.due.split(" ")[0]}</td><td><Badge status={candidate.status} /></td><td><button className="more" onClick={() => onOpen(candidate)}>查看詳情</button></td></tr>)}</tbody></table></div>;
}

function CandidateList({ candidates, setModal, navigate }: { candidates: Candidate[]; setModal: (modal: "candidate") => void; navigate: (view: View) => void }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const jobs = useMemo(() => getUniqueSortedField(candidates, "job"), [candidates]);
  const filtered = useMemo(() => filterCandidates(candidates, { query, status: statusFilter, job: jobFilter }), [candidates, query, statusFilter, jobFilter]);
  const clearFilters = () => { setQuery(""); setStatusFilter(""); setJobFilter(""); };
  const filtersActive = Boolean(query || statusFilter || jobFilter);
  return <div className="page"><div className="page-title"><div><h1>候選人</h1><p>管理候選人資料、面試邀請與進度。</p></div><Button onClick={() => setModal("candidate")}>＋ 新增候選人</Button></div><section className="panel"><div className="toolbar"><label className="search"><Icon name="⌕" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜尋姓名、Email、職缺或技術主管" /></label><select aria-label="依狀態篩選" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option value="">所有狀態</option>{INTERVIEW_STATUSES.map(status => <option key={status}>{status}</option>)}</select><select aria-label="依職缺篩選" value={jobFilter} onChange={event => setJobFilter(event.target.value)}><option value="">所有職缺</option>{jobs.map(job => <option key={job}>{job}</option>)}</select>{filtersActive && <button type="button" className="text-btn" onClick={clearFilters}>清除篩選</button>}</div>{filtered.length ? <CandidateTable rows={filtered} onOpen={candidate => candidate.email === "yian.chen@example.com" ? navigate("review") : navigate("candidates")} /> : <div className="empty"><Icon name="⌕" /><h3>找不到符合的候選人</h3><p>目前沒有同時符合關鍵字、狀態與職缺的資料。</p><Button kind="secondary" onClick={clearFilters}>清除篩選</Button></div>}</section></div>;
}

export function NewCandidate({ candidates, onClose, onSave }: { candidates: Candidate[]; onClose: () => void; onSave: (candidate: Candidate) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [job, setJob] = useState("");
  const [lead, setLead] = useState("");
  const [due, setDue] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const jobs = useMemo(() => getUniqueSortedField(candidates, "job"), [candidates]);
  const leads = useMemo(() => getUniqueSortedField(candidates, "lead"), [candidates]);
  const requiredReady = hasRequiredCandidateFields({ name, email, job, lead, due });
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    const nextErrors = validateCandidateForm({ name, email, job, lead, due });
    setErrors(nextErrors);
    if (nextErrors.length) return;
    setSaving(true);
    onSave(buildCandidateRecord({ name, email, job, lead, due }, { code: generateInterviewCode(), url: generateInterviewUrl() }));
  };
  return <div className="modal-backdrop"><form className="modal" onSubmit={submit} noValidate><div className="modal-head"><div><h2>新增候選人</h2><p>建立候選人資料並指派技術主管。</p></div><button type="button" onClick={onClose}>×</button></div>{errors.length > 0 && <div className="form-error" role="alert"><strong>無法建立候選人：</strong><ul>{errors.map(message => <li key={message}>{message}</li>)}</ul></div>}<fieldset><legend>基本資料</legend><div className="form-grid"><label>候選人姓名<input required value={name} onChange={event => setName(event.target.value)} placeholder="例：陳怡安" /></label><label>Email<input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" /></label></div></fieldset><fieldset><legend>面試安排</legend><div className="form-grid"><label>應徵職缺<select required value={job} onChange={event => setJob(event.target.value)}><option value="">請選擇職缺</option>{jobs.map(value => <option key={value}>{value}</option>)}</select></label><label>技術主管<select required value={lead} onChange={event => setLead(event.target.value)}><option value="">請選擇技術主管</option>{leads.map(value => <option key={value}>{value}</option>)}</select></label><label className="full">面試期限<input required type="datetime-local" value={due} onChange={event => setDue(event.target.value)} /></label></div></fieldset><div className="modal-actions"><Button kind="secondary" disabled={saving} onClick={onClose}>取消</Button><Button type="submit" disabled={!requiredReady || saving}>{saving ? "建立中…" : "建立候選人與面試"}</Button></div></form></div>;
}
