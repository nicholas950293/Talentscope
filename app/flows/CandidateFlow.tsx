"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { formatCountdown, getAnswerProgress } from "../demoLogic.mjs";
import { demoInterview, questions } from "../demo/data";
import { canSendAIMessage, createAIConversationState, messagesForQuestion, reduceAIConversation } from "../demo/aiConversation.mjs";
import { createInterviewSession, reduceInterviewSession } from "../demo/interviewController.mjs";
import { createMockCandidateAIService } from "../demo/mockCandidateAIService.mjs";
import { Badge, Brand, Button, Icon } from "../demo/shared";
import type { AIConversationAction, AIConversationMessage, AIConversationState, InterviewStatus, View } from "../demo/types";
import { shouldSendAIMessageFromKeyboard, validateCandidateCredentials } from "./candidate/candidateWorkflow.mjs";

type Props = {
  view: View;
  navigate: (view: View) => void;
  modal: string;
  setModal: (modal: "" | "submit") => void;
  status: InterviewStatus;
  setStatus: (status: InterviewStatus) => void;
  showToast: (text: string) => void;
};

export function CandidateFlow({ view, navigate, modal, setModal, status, setStatus, showToast }: Props) {
  const examQuestions = useMemo(() => demoInterview.questionIds.map(id => questions.find(question => question.id === id)!), []);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [conversation, setConversation] = useState<AIConversationState>(() => createAIConversationState());
  const conversationDispatch = (action: AIConversationAction) => setConversation(current => reduceAIConversation(current, action));
  const [aiInput, setAIInput] = useState("");
  const [session, dispatch] = useReducer(reduceInterviewSession, examQuestions.length, count => createInterviewSession(count));
  const submissionHandled = useRef(false);
  const aiRequestSequence = useRef(0);
  const aiService = useMemo(() => createMockCandidateAIService(), []);
  const progress: AnswerProgress = getAnswerProgress(session.answers, examQuestions.map(question => question.title));

  useEffect(() => {
    if (view !== "exam" || session.submitted) return;
    const timer = window.setInterval(() => dispatch({ type: "tick" }), 1000);
    return () => window.clearInterval(timer);
  }, [view, session.submitted]);

  useEffect(() => {
    if (!session.submitted || submissionHandled.current) return;
    submissionHandled.current = true;
    conversationDispatch({ type: "lock" });
    setModal("");
    setStatus("已提交");
    navigate("done");
  }, [navigate, session.submitted, setModal, setStatus]);

  const verify = (event: React.FormEvent) => {
    event.preventDefault();
    const result = validateCandidateCredentials({ email, code }, demoInterview);
    setError(result.error);
    if (result.valid) {
      navigate("brief");
    }
  };

  const runAIRequest = async (requestId: string, questionId: number, content: string) => {
    const question = examQuestions.find(item => item.id === questionId)!;
    try {
      const response = await aiService.ask({ interviewId: "interview-demo-001", questionId, questionTitle: question.title, content, requestId });
      conversationDispatch({ type: "resolve", requestId, content: response.content, createdAt: new Date().toISOString() });
    } catch (requestError) {
      const errorCode = requestError instanceof Error && "code" in requestError ? String(requestError.code) : "MOCK_AI_ERROR";
      conversationDispatch({ type: "fail", requestId, errorCode, createdAt: new Date().toISOString() });
    }
  };

  const sendAIMessage = () => {
    const questionId = examQuestions[session.currentQuestion].id;
    if (!canSendAIMessage(conversation, questionId, aiInput)) return;
    const content = aiInput.trim();
    const requestId = `mock-${Date.now()}-${++aiRequestSequence.current}`;
    conversationDispatch({ type: "begin", interviewId: "interview-demo-001", questionId, content, requestId, createdAt: new Date().toISOString() });
    setAIInput("");
    showToast("已送出 AI 協作訊息");
    void runAIRequest(requestId, questionId, content);
  };

  const retryAIMessage = (message: AIConversationMessage) => {
    if (conversation.locked || conversation.pendingByQuestion[message.questionId]) return;
    const original = conversation.messages.find(item => item.requestId === message.requestId && item.role === "candidate");
    if (!original) return;
    conversationDispatch({ type: "retry", requestId: message.requestId, createdAt: new Date().toISOString() });
    void runAIRequest(message.requestId, message.questionId, original.content);
  };

  if (view === "verify") return <main className="candidate-entry"><div className="candidate-nav"><Brand /><button onClick={() => location.reload()}>切換 Demo 角色</button></div><div className="verify-layout"><section><div className="eyebrow">候選人面試入口</div><h1>嗨，陳怡安<br />準備好展現你的思考方式了嗎？</h1><p>完成身分驗證後，你會先看到面試說明與注意事項。</p><div className="interview-preview"><span>Junior Data Analyst</span><h2>資料分析技術面試</h2><div><span><Icon name="◷" /> 75 分鐘</span><span><Icon name="▤" /> 3 題</span><span><Icon name="⌁" /> 期限 8/2</span></div></div></section><form className="verify-card" onSubmit={verify}><div className="lock">⌁</div><h2>驗證面試身分</h2><p>請輸入邀請信中的 Email 與 6 位數驗證碼。</p><label>Email<input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" /></label><label>6 位數驗證碼<input required className="code-input" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" inputMode="numeric" /></label>{error && <div className="form-error" role="alert">! {error}</div>}<Button type="submit" disabled={!email || code.length !== 6}>驗證並繼續 →</Button><div className="demo-credential"><strong>Demo 驗證資料</strong><span>{demoInterview.email}</span><span>{demoInterview.code}</span></div></form></div></main>;

  if (view === "brief") return <main className="brief-page"><div className="candidate-nav"><Brand /><Badge status={status} /></div><section className="brief-card"><div className="brief-head"><span>資料分析技術面試</span><h1>開始前，請先閱讀面試說明</h1><p>Junior Data Analyst · 候選人：陳怡安</p></div><div className="brief-metrics"><div><Icon name="◷" /><strong>75 分鐘</strong><span>倒數計時</span></div><div><Icon name="▤" /><strong>3 題</strong><span>2 題 SQL · 1 題問答</span></div><div><Icon name="◇" /><strong>工作階段暫存</strong><span>重新整理後不保留</span></div></div><div className="instructions"><h2>作答須知</h2><ol><li><span>1</span><div><strong>安排不受打擾的時間</strong><p>面試開始後會持續倒數，無法暫停。</p></div></li><li><span>2</span><div><strong>可以使用 Mock AI 協作</strong><p>每題有獨立對話，可協助釐清題意與思路；不會直接提供完整答案，對話會供面試官參考。</p></div></li><li><span>3</span><div><strong>提交前仔細確認</strong><p>提交後將無法返回、修改答案或繼續 AI 對話。</p></div></li></ol></div><label className="confirm-check"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /> 我已閱讀並了解以上說明，準備開始面試。</label><Button disabled={!confirmed} onClick={() => { setStatus("作答中"); navigate("exam"); }}>開始面試</Button></section></main>;

  if (view === "done") {
    const successfulMessages = conversation.messages.filter(message => message.status === "success");
    const usedQuestionIds = [...new Set(successfulMessages.map(message => message.questionId))];
    return <main className="done-page"><Brand /><section><span className="big-check">✓</span><div className="eyebrow">提交成功</div><h1>謝謝你完成面試，陳怡安。</h1><p>你的答案與 AI 對話已在此 Demo 工作階段提交。HR 將在團隊完成審核後與你聯繫。</p><div className="receipt"><div><span>面試</span><strong>Junior Data Analyst 技術面試</strong></div><div><span>完成題數</span><strong>{progress.completedCount} / {session.answers.length}</strong></div><div><span>提交狀態</span><Badge status={status} /></div><div><span>AI 對話紀錄</span><strong>{successfulMessages.length} 則 · {usedQuestionIds.length} 題</strong></div></div>{usedQuestionIds.length > 0 && <div className="submitted-conversations"><h2>AI 對話紀錄</h2>{usedQuestionIds.map(questionId => <details key={questionId}><summary>{examQuestions.find(question => question.id === questionId)?.title}</summary>{messagesForQuestion(conversation, questionId).filter((message: AIConversationMessage) => message.status === "success").map((message: AIConversationMessage) => <p key={message.id}><strong>{message.role === "candidate" ? "你" : "Mock AI"}</strong>{message.content}</p>)}</details>)}</div>}<small>你現在可以安全關閉此頁面。</small></section></main>;
  }

  const currentQuestion = examQuestions[session.currentQuestion];
  const currentMessages = messagesForQuestion(conversation, currentQuestion.id);
  const aiPending = Boolean(conversation.pendingByQuestion[currentQuestion.id]);
  const canSend = canSendAIMessage(conversation, currentQuestion.id, aiInput) && !session.submitted;
  return <main className="exam">
    <header className="exam-top"><Brand /><div><strong>資料分析技術面試</strong><span>答案與 AI 對話暫存於本工作階段</span></div><div className="timer"><small>剩餘時間</small><strong>{formatCountdown(session.remainingSeconds)}</strong></div><Button kind="danger" disabled={session.submitted} onClick={() => setModal("submit")}>提交面試</Button></header>
    <div className="exam-body">
      <aside className="q-nav"><h3>題目導覽</h3>{examQuestions.map((question, index) => <button key={question.id} className={session.currentQuestion === index ? "active" : ""} onClick={() => dispatch({ type: "select-question", index })}><span>{session.answers[index].trim() ? "✓" : index + 1}</span><div><strong>{question.title}</strong><small>{question.type} · {question.minutes} 分鐘</small></div></button>)}<div className="nav-legend"><span><i className="answered" />已作答</span><span><i />未作答</span></div></aside>
      <section className="workspace"><div className="question-content"><div className="q-kicker"><span>第 {session.currentQuestion + 1} 題，共 3 題</span><span className={`type type-${currentQuestion.type}`}>{currentQuestion.type}</span><span className={`difficulty d-${currentQuestion.difficulty}`}>{currentQuestion.difficulty}</span></div><h1>{currentQuestion.title}</h1><p>{currentQuestion.description}</p><div className="schema"><strong>{currentQuestion.type === "技術問答" ? "回答方向" : "資料表結構／輸入輸出"}</strong><code>{currentQuestion.detail}</code></div><div className="example"><strong>範例</strong><p>{currentQuestion.example}</p></div></div><div className="editor"><div className="editor-bar"><span>{currentQuestion.type === "SQL" ? "SQL" : "文字作答"}</span><span>工作階段已更新 ✓</span></div><textarea disabled={session.submitted} spellCheck={false} value={session.answers[session.currentQuestion]} onChange={event => dispatch({ type: "update-answer", index: session.currentQuestion, answer: event.target.value })} placeholder={currentQuestion.type === "技術問答" ? "請輸入你的分析、判斷與理由…" : "-- 在這裡輸入你的答案\nSELECT ..."} /></div><div className="exam-nav"><Button kind="secondary" disabled={session.currentQuestion === 0 || session.submitted} onClick={() => dispatch({ type: "select-question", index: session.currentQuestion - 1 })}>← 上一題</Button><span>第 {session.currentQuestion + 1} / 3 題</span><Button disabled={session.currentQuestion === 2 || session.submitted} onClick={() => dispatch({ type: "select-question", index: session.currentQuestion + 1 })}>下一題 →</Button></div></section>
      <aside className="ai-panel" aria-label="AI 協作對話"><div className="ai-title"><span>✦</span><div><h3>AI 協作</h3><p>Mock AI · 釐清題意與思路</p></div></div><div className="ai-boundary"><Icon name="i" />AI 不提供完整答案；每題對話獨立保存，並會提供面試官參考。</div><div className="ai-messages" aria-live="polite">{currentMessages.length === 0 && <div className="ai-empty"><strong>從你的思路開始</strong><p>描述你對題目的理解、目前做法或卡住的地方。</p></div>}{currentMessages.map((message: AIConversationMessage) => <div key={message.id} className={`ai-message ${message.role} ${message.status}`}><small>{message.role === "candidate" ? "你" : "Mock AI"}</small>{message.status === "pending" ? <p className="ai-thinking"><i /><i /><i /> 正在整理回覆</p> : <p>{message.content}</p>}{message.status === "error" && <button disabled={session.submitted || aiPending} onClick={() => retryAIMessage(message)}>重試這則回覆</button>}</div>)}</div><div className="ai-composer"><textarea value={aiInput} disabled={session.submitted || aiPending} onChange={event => setAIInput(event.target.value)} onKeyDown={event => { if (shouldSendAIMessageFromKeyboard({ key: event.key, shiftKey: event.shiftKey, isComposing: event.nativeEvent.isComposing })) { event.preventDefault(); sendAIMessage(); } }} placeholder={session.submitted ? "面試已提交，無法繼續對話" : aiPending ? "Mock AI 回覆中…" : "輸入你的問題或目前思路…"} /><div><small>Enter 傳送 · Shift + Enter 換行</small><Button disabled={!canSend} onClick={sendAIMessage}>{aiPending ? "回覆中…" : "傳送"}</Button></div></div></aside>
    </div>
    {modal === "submit" && <SubmitConfirmation progress={progress} submitting={session.submitted} onClose={() => setModal("")} onSubmit={() => { setModal(""); dispatch({ type: "submit", source: "manual" }); }} />}
  </main>;
  /* Sprint 4 的舊提示 JSX 保留於下方作為不執行的結構比對，Sprint 5 介面以上方 AI 對話為唯一執行路徑。 */
  const currentHints: Array<{ level: number; text: string; time: string }> = [];
  const requestHint = (...levels: number[]) => void levels;
  return <main className="exam"><header className="exam-top"><Brand /><div><strong>資料分析技術面試</strong><span>答案暫存於本工作階段</span></div><div className="timer"><small>剩餘時間</small><strong>{formatCountdown(session.remainingSeconds)}</strong></div><Button kind="danger" disabled={session.submitted} onClick={() => setModal("submit")}>提交面試</Button></header><div className="exam-body"><aside className="q-nav"><h3>題目導覽</h3>{examQuestions.map((question, index) => <button key={question.id} className={session.currentQuestion === index ? "active" : ""} onClick={() => dispatch({ type: "select-question", index })}><span>{session.answers[index].trim() ? "✓" : index + 1}</span><div><strong>{question.title}</strong><small>{question.type} · {question.minutes} 分鐘</small></div></button>)}<div className="nav-legend"><span><i className="answered" />已作答</span><span><i />未作答</span></div></aside><section className="workspace"><div className="question-content"><div className="q-kicker"><span>第 {session.currentQuestion + 1} 題，共 3 題</span><span className={`type type-${currentQuestion.type}`}>{currentQuestion.type}</span><span className={`difficulty d-${currentQuestion.difficulty}`}>{currentQuestion.difficulty}</span></div><h1>{currentQuestion.title}</h1><p>{currentQuestion.description}</p><div className="schema"><strong>{currentQuestion.type === "技術問答" ? "回答方向" : "資料表結構／輸入輸出"}</strong><code>{currentQuestion.detail}</code></div><div className="example"><strong>範例</strong><p>{currentQuestion.example}</p></div></div><div className="editor"><div className="editor-bar"><span>{currentQuestion.type === "SQL" ? "SQL" : "文字作答"}</span><span>工作階段已更新 ✓</span></div><textarea disabled={session.submitted} spellCheck={false} value={session.answers[session.currentQuestion]} onChange={event => dispatch({ type: "update-answer", index: session.currentQuestion, answer: event.target.value })} placeholder={currentQuestion.type === "技術問答" ? "請輸入你的分析、判斷與理由…" : "-- 在這裡輸入你的答案\nSELECT ..."} /></div><div className="exam-nav"><Button kind="secondary" disabled={session.currentQuestion === 0 || session.submitted} onClick={() => dispatch({ type: "select-question", index: session.currentQuestion - 1 })}>← 上一題</Button><span>第 {session.currentQuestion + 1} / 3 題</span><Button disabled={session.currentQuestion === 2 || session.submitted} onClick={() => dispatch({ type: "select-question", index: session.currentQuestion + 1 })}>下一題 →</Button></div></section><aside className="ai-panel"><div className="ai-title"><span>✦</span><div><h3>AI 思考提示</h3><p>幫你推進思路，不提供答案</p></div></div><div className="hint-levels">{[["重新解釋題意", "用不同方式釐清這題在問什麼"], ["提醒思考方向", "提供一個開始分析的角度"], ["檢查邊界條件", "提醒可能遺漏的特殊情況"], ["較明確的解題提示", "給出更具體但非完整答案的提示"]].map((hint, index) => <button disabled={session.submitted} key={hint[0]} onClick={() => requestHint(index + 1)}><span>{index + 1}</span><div><strong>{hint[0]}</strong><small>{hint[1]}</small></div><b>→</b></button>)}</div>{currentHints.length > 0 && <div className="current-hints"><h4>本題提示紀錄</h4>{currentHints.map((hint, index) => <div key={index}><span>L{hint.level}</span><p>{hint.text}</p><small>{hint.time}</small></div>)}</div>}<div className="ai-disclaimer"><Icon name="i" />所有提示使用時間、題號與內容都會記錄供面試官參考。</div></aside></div>{modal === "submit" && <SubmitConfirmation progress={progress} submitting={session.submitted} onClose={() => setModal("")} onSubmit={() => { setModal(""); dispatch({ type: "submit", source: "manual" }); }} />}</main>;
}

type AnswerProgress = { completedCount: number; incompleteCount: number; incompleteIndexes: number[]; incompleteQuestions: string[] };

function SubmitConfirmation({ progress, submitting, onClose, onSubmit }: { progress: AnswerProgress; submitting: boolean; onClose: () => void; onSubmit: () => void }) {
  return <div className="modal-backdrop"><div className="modal small"><div className="danger-icon">!</div><h2>確定要提交面試嗎？</h2><p>提交後將無法繼續修改任何答案。</p><div className="submission-summary"><strong>已完成 {progress.completedCount} 題</strong><strong>未完成 {progress.incompleteCount} 題</strong></div>{progress.incompleteCount > 0 && <div className="form-error" role="alert"><strong>未作答題目：</strong><ul>{progress.incompleteQuestions.map((title, index) => <li key={title}>第 {progress.incompleteIndexes[index] + 1} 題：{title}</li>)}</ul><span>你仍可確認提交未完成答案。</span></div>}<div className="modal-actions"><Button kind="secondary" disabled={submitting} onClick={onClose}>返回檢查</Button><Button kind="danger" disabled={submitting} onClick={onSubmit}>{submitting ? "提交中…" : "確認提交"}</Button></div></div></div>;
}
