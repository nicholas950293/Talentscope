"use client";

import { useState } from "react";
import type { InterviewStatus, RecruitmentResult, Role, View } from "./domain/types";
import { CandidateFlow } from "./flows/CandidateFlow";
import { HrFlow, NewCandidate } from "./flows/HrFlow";
import { HrDashboard, HrSummary, ResultModal } from "./flows/hr/HrViews";
import { TechLeadFlow } from "./flows/TechLeadFlow";
import { demoInterview, seedCandidates } from "./mocks/data";
import { RoleSelection } from "./shell/RoleSelection";
import { WorkspaceShell } from "./shell/WorkspaceShell";

type Modal = "" | "candidate" | "submit" | "result";

export default function TalentScopeApp() {
  const [role, setRole] = useState<Role>("login");
  const [view, setView] = useState<View>("dashboard");
  const [toast, setToast] = useState("");
  const [status, setStatus] = useState<InterviewStatus>(demoInterview.status);
  const [candidates, setCandidates] = useState(seedCandidates);
  const [modal, setModal] = useState<Modal>("");
  const [result, setResult] = useState<RecruitmentResult>("待討論");

  const showToast = (text: string) => { setToast(text); window.setTimeout(() => setToast(""), 2400); };
  const navigate = (nextView: View) => { setView(nextView); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const enterRole = (nextRole: Exclude<Role, "login">) => {
    if (nextRole === "candidate") setStatus("等待面試者開始");
    setRole(nextRole);
    setView(nextRole === "candidate" ? "verify" : "dashboard");
  };

  if (role === "login") return <RoleSelection onEnter={enterRole} />;
  if (role === "candidate") return <CandidateFlow view={view} navigate={navigate} modal={modal} setModal={setModal} status={status} setStatus={setStatus} showToast={showToast} />;

  const visibleCandidates = candidates.map(candidate => candidate.email === demoInterview.email ? { ...candidate, status } : candidate);
  return <>
    <WorkspaceShell role={role} view={view} navigate={navigate} onSwitchRole={() => setRole("login")} toast={toast}>
      {role === "hr" && <HrFlow view={view} candidates={visibleCandidates} setModal={setModal} navigate={navigate} dashboard={<HrDashboard candidates={visibleCandidates} setModal={setModal} navigate={navigate} result={result} />} summary={<HrSummary result={result} status={status} setModal={setModal} />} />}
      {role === "lead" && <TechLeadFlow view={view} navigate={navigate} showToast={showToast} status={status} />}
    </WorkspaceShell>
    {modal === "candidate" && <NewCandidate candidates={candidates} onClose={() => setModal("")} onSave={candidate => { setCandidates([candidate, ...candidates]); setModal(""); showToast("候選人與面試邀請已建立"); }} />}
    {modal === "result" && <ResultModal result={result} onClose={() => setModal("")} onSave={value => { setResult(value); setStatus("已完成"); setModal(""); showToast("招募結果已更新"); }} />}
  </>;
}
