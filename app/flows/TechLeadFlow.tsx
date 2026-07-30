"use client";

import { useState } from "react";
import type { InterviewStatus, View } from "../demo/types";
import { Builder, Invite, LeadDashboard, QuestionBank, QuestionEditor, TechReview } from "./tech/TechLeadViews";

export function TechLeadFlow({ view, navigate, showToast, status }: { view: View; navigate: (view: View) => void; showToast: (text: string) => void; status: InterviewStatus }) {
  const [selected, setSelected] = useState<number[]>([1, 2, 8]);
  const [editorOpen, setEditorOpen] = useState(false);

  return <>
    {view === "dashboard" && <LeadDashboard navigate={navigate} status={status} />}
    {view === "questions" && <QuestionBank selected={selected} setSelected={setSelected} openEditor={() => setEditorOpen(true)} navigate={navigate} showToast={showToast} />}
    {view === "builder" && <Builder selected={selected} setSelected={setSelected} navigate={navigate} showToast={showToast} />}
    {view === "invite" && <Invite navigate={navigate} showToast={showToast} />}
    {view === "review" && <TechReview navigate={navigate} showToast={showToast} status={status} />}
    {editorOpen && <QuestionEditor onClose={() => setEditorOpen(false)} showToast={showToast} />}
  </>;
}
