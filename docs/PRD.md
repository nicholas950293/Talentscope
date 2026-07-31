# TalentScope Product Requirements Document

## 1. 文件定位與優先順序

本文件是 TalentScope 唯一正式產品規格，描述目前可施工與可驗收的產品邊界。

1. GitHub `main` 中的 `README.md`、`docs/PRD.md` 與 `AGENTS.md` 是正式標準。
2. Google Docs 用於討論、提案與每日紀錄；尚未合入 `main` 的內容不構成規格。
3. `docs/archive/` 只供歷史查閱，不得作為施工、驗收或決策依據。
4. 程式、測試與文件衝突時必須停止並回報，由 PM／整合負責人裁定；AI 不得自行推測。

狀態用語：

| 狀態 | 定義 |
|---|---|
| Current | 已存在於目前程式或測試；不代表已具備正式後端能力 |
| Approved | 團隊已核准但尚未完成；需有明確決議才能使用 |
| Proposed | 建議或待討論，不得當作當期承諾 |
| Deprecated | 已明確停止採用，不得恢復為現行方案 |

Current 功能若依賴硬編碼、前端記憶體或模擬服務，會在「目前限制」明確標示 Mock。

## 2. 產品願景與核心問題

TalentScope 整合 HR 與技術主管的結構化面試協作流程，讓候選人獲得清楚的作答體驗。AI 協助釐清思路與整理評估證據，人類保留技術判斷與最終招募決策權。

核心問題：

- 招募進度、題目、答案與評估證據分散，交接成本高。
- HR 需要摘要，不應被迫閱讀詳細程式碼分析。
- 技術主管需要一致的選題、組卷與人工審核工具。
- 候選人需要清楚的驗證、時間、作答、AI 邊界與提交後果。
- AI 結果若缺少證據與人工覆核，會產生公平性與責任風險。

## 3. 目標使用者與三種角色

| 角色 | 主要目標 | 可見資訊 | 不應操作 |
|---|---|---|---|
| HR | 建立與追蹤候選人、閱讀摘要、記錄招募結果 | 候選人、職缺、主管、期限、狀態、技術摘要 | 編輯技術人工評分或要求 AI 自動決策 |
| 技術主管 | 選題組卷、檢視答案與證據、完成人工審核 | 題庫、試卷、答案、Mock AI 紀錄、AI 初評、人工分數 | 代替 HR 設定最終招募結果 |
| 候選人 | 驗證、閱讀規則、作答、使用協作提示並提交 | 自己的 Demo 面試、題目、答案與逐題對話 | 查看其他候選人、題庫管理或內部審核 |

目前角色隔離只由前端 React state 實作，屬 Mock，不是安全權限邊界。

## 4. 產品原則

1. **人類負責決策**：AI 不得自動設定通過、不通過或待討論。
2. **角色聚焦**：HR 看摘要；技術主管看詳細證據；候選人只接觸自己的流程。
3. **AI 不代答**：Current Mock AI 只協助釐清題意、方向與邊界條件，不提供完整答案。
4. **AI 與人工評分分離**：人工分數不可被 AI 覆寫。
5. **狀態一致**：全站只使用第 10 節定義的九種面試狀態。
6. **Mock 必須揭露**：角色、驗證、Email、AI、資料與持久化不得包裝為正式能力。
7. **不可逆操作明示**：提交前顯示完成度與後果，提交後禁止修改與再次提交。

## 5. MVP 範圍

### Current

- 三角色入口、專屬工作區與主要流程畫面。
- HR 候選人複合篩選、表單驗證、工作階段新增與人工招募結果。
- 技術主管題庫搜尋／複合篩選、選題、排序、估時、空試卷保護及審核介面。
- 候選人固定資料驗證、說明確認、75 分鐘 reducer、切題保留答案、提交完整性與完成頁。
- 逐題 Mock AI 對話、pending／error／retry、延遲回原題、提交後鎖定及禁止完整答案護欄。
- 九種狀態的單一清單、合法轉移純函式與一致 Badge。
- 基本桌面／手機 RWD、可讀性、Modal、Toast、Error 與 Empty State。
- 41 項純邏輯、reducer 與 SSR smoke tests。

### Approved

目前沒有已具備團隊核准證據、但尚未實作的正式後端或外部服務工作包。新項目須經 PM 明確確認後才能列入 Approved。

### Proposed

- Backend API、正式資料庫 schema、migration 與交易邊界。
- Authentication、RBAC、Interview Token、Email 與 Audit Log。
- Durable autosave、伺服器時間、idempotent submission 與跨角色同步。
- 正式 AI Provider、內容安全、模型／prompt 版本及可稽核評估服務。
- React component、integration、E2E、a11y、安全與隱私測試。

### Deprecated

- 以大型 `DemoApp.tsx` 與 `app/demo/` 大雜燴作為前端架構；已由 `TalentScopeApp` 與責任模組取代。
- Sprint 6A 的正式 Gemini endpoint／provider 串接；已撤回，不得在未重新核准下恢復。
- 以獨立 Vite Preview 啟動此專案；目前統一使用 vinext scripts。

## 6. 非本階段範圍

- 正式 API、資料庫、Authentication、RBAC、Interview Token 或多租戶。
- Email 寄送、正式 AI API、線上程式執行、自動判題。
- 錄影、Webcam、監控、防作弊或 LeetCode 爬蟲。
- 正式資安、隱私、就業法遵、SLA、監控或上線承諾。
- 以 localStorage 冒充正式持久化，或以角色選擇畫面冒充登入。

## 7. 三角色核心流程

### HR

進入 HR 工作區 → 新增候選人與安排 → 追蹤／篩選狀態 → 查看陳怡安摘要 → 人工設定招募結果。

- 表單驗證、篩選與工作階段新增是 Current。
- 候選人與招募結果只存在瀏覽器記憶體。
- 摘要、統計與部分候選人詳情是固定 Mock。

### 技術主管

進入工作台 → 搜尋／篩選題庫 → 選題組卷 → 排序與估時 → 顯示邀請 → 查看作答 → 調整人工分數與備註。

- 題庫、組卷與人工分數互動是 Current in-memory。
- 指派、邀請、Email、答案、停留時間與 AI 初評是固定 Mock。
- 完成審核只顯示回饋，不會持久化或完整同步 HR。

### 候選人

開啟 Demo → 輸入 Email／驗證碼 → 閱讀並勾選說明 → 作答／切題／使用 Mock AI → 檢查未作答清單 → 手動或逾時提交 → 完成頁。

- 驗證是固定前端比對。
- 答案、倒數、提示與對話只存在當次 React 工作階段。
- 手動與逾時提交共用 reducer，僅第一次有效；無後端收件確認。

### 跨角色限制

- 候選人的答案／AI 對話未接到技術審核的固定 Mock 資料。
- 技術主管完成審核未更新 HR 固定能力摘要。
- HR 新增候選人未成為技術主管的新指派。
- 目前只保證單一 `TalentScopeApp` 工作階段內部分共用狀態一致。

## 8. 功能需求與驗收條件

| ID | 角色／模組 | 需求 | 驗收條件 | 狀態 | 目前限制 |
|---|---|---|---|---|---|
| FR-HR-001 | HR | 顯示招募總覽與候選人列表 | 可見指標、近期候選人、期限與一致 Badge | Current | 指標與大部分資料為 Mock |
| FR-HR-002 | HR | 關鍵字、狀態與職缺可複合篩選 | 三條件同時生效；無結果有 Empty State；職缺由資料衍生 | Current | 僅前端資料 |
| FR-HR-003 | HR | 新增候選人與面試安排 | 驗證姓名、Email、職缺、主管與未來期限；成功後加入列表 | Current | 記憶體 state，無 API |
| FR-HR-004 | HR | 顯示招募摘要 | HR 不需看詳細程式碼即可閱讀完成度、能力摘要與技術建議 | Current | 只完整支援陳怡安固定摘要 |
| FR-HR-005 | HR | 人工設定招募結果 | 只接受通過／不通過／待討論；結果由 HR 操作 | Current | 未保存決策者、時間與理由 |
| FR-TECH-001 | 技術主管 | 顯示工作台與指派 | 可從待辦進入組卷或審核 | Current | 固定 Mock 指派與統計 |
| FR-TECH-002 | 技術主管／題庫 | 搜尋、篩選、預覽及選取題目 | 關鍵字、題型、難度、技能可組合；無結果有 Empty State | Current | 12 題固定資料 |
| FR-TECH-003 | 技術主管／組卷 | 排序、移除、估時與空試卷保護 | 題目集合不遺失；統計正確；空試卷不可產生邀請 | Current | 不持久化；拖曳僅視覺 |
| FR-TECH-004 | 技術主管／邀請 | 顯示連結、6 位碼與期限 | 資訊完整且操作有回饋 | Current | 無 token、clipboard 或 Email service |
| FR-TECH-005 | 技術主管／審核 | 查看逐題內容並調整人工分數 | 題序固定；人工分數限 1–5 且不改 AI 初評 | Current | 答案、AI 初評與對話是 Mock；不持久化 |
| FR-CAND-001 | 候選人 | 驗證 Demo 身分 | 正確資料進入說明；錯誤資料留原頁並顯示訊息 | Current | 固定前端 Email／驗證碼 |
| FR-CAND-002 | 候選人 | 確認說明後開始 | 確認框預設未勾；未勾不能開始；開始後顯示作答中 | Current | 無正式 token／到期檢查 |
| FR-CAND-003 | 候選人／作答 | 倒數、切題、輸入與答案保留 | 75 分鐘遞減且不小於零；切題／輸入不重置 | Current | 無伺服器時間、autosave 或斷線恢復 |
| FR-CAND-004 | 候選人／提交 | 提交前顯示完成度與未作答清單 | 可返回；可提交未完成答案；手動／逾時只接受第一次 | Current | 無後端 submission receipt |
| FR-AI-001 | 候選人／AI | 每題獨立 Mock 對話 | 空白／pending 不重複；延遲回原題；錯誤可重試 | Current | Mock provider、記憶體 state |
| FR-AI-002 | 候選人／AI | 提交後完全鎖定 | 不得新增、重試或接受延遲回覆改寫狀態 | Current | 前端 reducer 保護 |
| FR-AI-003 | AI 內容 | Current Mock 不得直接提供完整答案 | 自動護欄測試拒絕完整答案型內容 | Current | 字串護欄不是正式內容安全服務 |
| FR-AI-004 | 技術審核 | 分離 AI 初評與人工評分 | AI 證據保持不變；人工分數可獨立修改 | Current | AI 初評為固定 Mock |
| FR-AI-005 | 招募決策 | AI 不得自動決定結果 | 非 HR 決策來源由純邏輯拒絕 | Current | 正式後端 enforcement 尚未實作 |
| FR-STATUS-001 | 全角色 | 只使用九種合法面試狀態 | runtime 清單、TypeScript union、Badge 與測試共用定義 | Current | UI 未全面透過 transition guard；非正式狀態機 |

## 9. AI 協作規則

### Current

- Provider 固定為 `Mock`，不呼叫任何外部 AI API。
- 候選人可描述理解、做法或卡點；回覆只推進思路，不直接給完整答案。
- 訊息以 interview、question 與 request 關聯；pending、error、retry 與提交鎖由 reducer 管理。
- 技術審核顯示固定六面向 Mock AI 初評與證據；人工分數獨立。
- AI 不得設定技術錄用命令或 HR 招募結果。

### 待團隊決議

- 未來 AI 是否只能提示，或可在特定情境協助產出部分答案；Current 規則維持不提供完整答案。
- 正式 AI 採 Gemini、Claude 或 Provider-neutral adapter；目前沒有核准 Provider。
- AI 評估是否屬於下一階段交付，以及公平性、模型版本、prompt、保存期限與人工申訴規則。

在上述議題完成決議前，不得恢復正式 Provider 或把 Mock 宣稱為正式 AI。

## 10. 面試狀態與主要業務規則

九種合法狀態由 `app/domain/interviewWorkflow.mjs` 單一清單定義：

| 狀態 | 定義 | 純邏輯允許下一狀態 |
|---|---|---|
| 草稿 | 尚未確認試卷／邀請 | 待寄送 |
| 待寄送 | 邀請已產生但尚未提供 | 等待面試者開始、已過期 |
| 等待面試者開始 | 邀請有效、尚未開始 | 作答中、已過期 |
| 作答中 | 已開始且尚未提交 | 已提交、已過期 |
| 已提交 | 答案已鎖定 | AI 分析中 |
| AI 分析中 | 規劃中的分析階段 | 等待人工審核 |
| 等待人工審核 | 等待技術主管確認 | 已完成 |
| 已完成 | 流程終態 | 無 |
| 已過期 | 期限終態 | 無 |

主要規則：

- 目前是前端工作階段清單與純函式，不是正式後端狀態機。
- 部分 UI 直接更新共用 state，尚未全面使用合法轉移函式。
- 提交後答案與 AI 對話不可修改；手動與逾時競態只接受第一次。
- HR 更新招募結果可顯示「已完成」，但不得由 AI 觸發。
- 正式版須由後端驗證 actor、時間、合法轉移、到期與稽核。

## 11. 核心資料契約

### Current TypeScript／記憶體契約

| 實體 | 核心欄位／規則 | 現況 |
|---|---|---|
| Candidate | `candidate`, `email`, `job`, `lead`, `due`, `code`, `url`, `status` | Seed data／React state |
| Interview | Candidate 欄位＋`title`, `durationMinutes`, `questionIds` | 固定 Demo object |
| Question | `id`, `title`, `type`, `difficulty`, `skills`, `minutes`, `description`, `detail`, `example`, `rubric` | 12 題 Mock data |
| Answer | `questionId`, `content`；controller 實際以同順序字串陣列保存 | 記憶體 state |
| AIConversationMessage | `id`, `interviewId`, `questionId`, `role`, `content`, `createdAt`, `requestId`, `status`, `provider`, `errorCode?` | 記憶體 state；provider=`Mock` |
| RecruitmentDecision | `result`, `decidedBy`, `decidedAt?` | 純邏輯限制 `decidedBy=HR`；UI 未完整保存物件 |

不可任意更名：九種狀態字串、三種 `RecruitmentResult`、AI message 的 question／request 關聯及 submission source（manual／timeout）。修改 `app/domain/**` 前須依 AGENTS 提出 Integration Request。

### Proposed 正式資料模型

User、Job、Candidate、Question、Interview、InterviewQuestion（含題目快照）、Answer、AIConversationMessage、AIEvaluation、ReviewerScore、InterviewDecision、AuditEvent 仍是 Proposed。`db/schema.ts` 目前為空；資料庫欄位、ID、索引、保存期限、租戶與關聯尚未核准。

## 12. 技術架構摘要

### 現行技術棧

- Next.js 16、React 19、TypeScript 5.9。
- vinext 0.0.50、Vite 8、Cloudflare Worker 相容 build。
- Tailwind CSS 4、PostCSS 與手寫 `globals.css`。
- React local state；沒有 global store、API 或持久化。
- Node test runner；沒有 React component test 或 E2E framework。

### 模組責任

| 路徑 | 責任 |
|---|---|
| `app/TalentScopeApp.tsx` | 角色／view、共用工作階段 state、Flow 與 Modal／Toast 協調 |
| `app/shell/**` | 角色入口與內部工作區外殼 |
| `app/flows/hr/**`, `HrFlow.tsx` | HR 畫面、篩選、表單與純邏輯 |
| `app/flows/tech/**`, `TechLeadFlow.tsx` | 題庫、組卷、邀請與審核 |
| `app/flows/candidate/**`, `CandidateFlow.tsx` | 驗證、說明、作答、AI 對話與提交畫面 |
| `app/domain/**` | 共用型別、九種狀態、篩選、完成度與 submission claim |
| `app/interview/**` | 面試 controller 與 AI conversation reducer |
| `app/mocks/**` | Seed data 與 Mock AI service |
| `app/shared/**` | 共用 UI 元件 |

Mock 與正式 Provider 必須維持 server／client 安全邊界；目前沒有正式 Provider。Drizzle／D1 只有空白骨架，API、DB、Auth、Email 與 Audit Log 均未實作。

## 13. 非功能需求

| ID | 需求 | 驗收方向 | 狀態／限制 |
|---|---|---|---|
| NFR-UX-001 | 正文與主要操作清楚可讀，桌面與手機不裁切主要內容 | 一般文字／輸入／按鈕以 16px 為基準；人工 viewport smoke | Current；完整視覺回歸未自動化 |
| NFR-RWD-001 | 主要頁面具基本 RWD | 390px 與桌面無非預期頁面水平捲動；Modal 在 viewport 內 | Current；手機內部 sidebar 導覽待決議 |
| NFR-A11Y-001 | 表單 label、heading、鍵盤與焦點可理解 | 人工鍵盤／讀屏及自動掃描 | Proposed；尚未完整驗證 |
| NFR-SEC-001 | 不提交 Secret 或真實候選人個資 | Git review、secret scan、資料最小化 | Current repository rule；正式安全架構 Proposed |
| NFR-MAINTAIN-001 | 角色、domain、interview、mock 與 shared 邊界清楚 | typecheck、lint、tests、code review | Current |
| NFR-FEEDBACK-001 | 重要操作有 Error、Disabled、Empty、Modal 或 Toast | 三角色人工 smoke test | Current；網路／API loading 尚不存在 |
| NFR-INTEGRITY-001 | 倒數不小於零、提交只一次、提交後不可修改 | reducer 單元測試 | Current（前端）；後端冪等 Proposed |

## 14. 測試與 Definition of Done

目前自動測試共 41 項，涵蓋：

- 候選人表單、篩選、決策與純 HR workflow。
- 題庫搜尋／篩選／選取、組卷排序／估時／空試卷及審核分數純邏輯。
- 驗證、答案完成度、倒數、切題、單次提交與提交鎖。
- AI 對話 pending、隔離、延遲回覆、錯誤、重試、鎖定與內容護欄。
- 九種狀態及首頁 SSR smoke test。

每個工作包完成前必須執行：

```powershell
npm ci
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

並人工確認受影響的 HR、技術主管與候選人流程。只有實際執行成功的項目可標示 Passed；Not Run 不得推定為 Passed。新增功能需同步需求、測試與 Mock／Current 邊界。

## 15. 已知限制

- 單一路由，內部 view 無 URL、重整復原或 deep link。
- 所有產品資料只存在記憶體，沒有 API 或資料庫。
- 角色切換、候選人驗證、邀請、Email 與 AI 均為 Mock。
- 候選人答案／AI 對話、技術審核與 HR 摘要沒有正式跨角色同步。
- AI 初評是固定資料；人工評分、備註與決策未持久化。
- 沒有正式 autosave、伺服器倒數、收件確認或跨請求冪等。
- 沒有完整 component、E2E、a11y、安全、隱私或負載測試。
- 手機內部 sidebar 隱藏，部分次頁只能由已有工作台操作進入。
- D1／Drizzle、Cloudflare bindings 與 `chatgpt-auth.ts` 不代表產品已接入正式服務。

## 16. 待團隊決議

1. AI 的未來協作界線：只提示，或允許特定答案產出。
2. 正式 AI 架構：Gemini、Claude 或 Provider-neutral；是否及何時恢復外部 Provider。
3. AI 評估是否屬於下一階段，以及模型／prompt 版本、公平性、內容安全與保存規則。
4. 正式資料庫 schema、ID、題目快照、分數粒度、索引、租戶與 migration 策略。
5. Candidate 是否屬於 User，及 Authentication／RBAC／Interview Token 邊界。
6. 招募決策是否可修改；若可修改，版本與稽核方式為何。
7. 個資、答案、AI 對話、評估與 AuditEvent 的保存／刪除期限。
8. 未完成答案是否永遠允許提交，或由面試設定控制。
9. 手機內部角色導覽與候選人完整作答是否列入正式支援範圍。
10. 成功指標、埋點、目標值、專案 owner、Sprint 時程與正式完成條件。
