# Talentscope｜AI 技術面試協作平台 MVP

Talentscope 是一個串起 HR、技術主管與面試者的結構化面試協作原型。HR 管理候選人與招募結果，技術主管選題、組卷並人工審核，面試者完成驗證、作答與提交。AI 只協助提供分級提示與整理評估證據，最終決策保留給人類。

> 目前版本是前端互動 Demo。資料、角色、Email、驗證碼、AI、自動儲存與倒數等多項能力為 Mock，不應視為可正式上線的後端功能。

## 核心功能

- 三角色 Demo 入口與角色專屬導覽。
- HR 招募 Dashboard、候選人列表、新增候選人、面試摘要與結果選擇。
- 技術主管工作台、12 題 Demo 題庫、搜尋篩選、題目預覽、組卷排序與估時。
- Demo 面試連結、6 位驗證碼及有效期限展示。
- 面試者驗證、面試說明、三題作答、逐題 Mock AI 協作對話與提交確認。
- 技術審核頁：答案、停留時間、AI 對話紀錄、六面向 AI 初評、人工分數與備註。
- 九種一致面試狀態與基本響應式介面。

## 三種角色

| 角色 | 主要操作 | 目前邊界 |
|---|---|---|
| HR | 追蹤進度、新增候選人、閱讀摘要、選擇通過／不通過／待討論 | 只看招募摘要；資料只存在瀏覽器記憶體 |
| 技術主管 | 題庫、組卷、邀請、查看答案／提示／AI 證據、人工審核 | AI 初評為固定 Demo；人工結果未持久化 |
| 面試者 | 驗證、閱讀說明、作答、使用提示、提交 | 只接觸固定的陳怡安 Demo 面試 |

目前角色切換由 React state 控制，不是正式 Authentication 或 RBAC。

## Demo 操作

啟動後開啟終端顯示的 Local URL，通常為 [http://localhost:5173/](http://localhost:5173/)，再選擇：

- **HR Demo**：查看招募總覽、新增候選人，並從陳怡安開啟面試摘要。
- **技術主管 Demo**：進入題庫、選題組卷、產生 Demo 邀請或開啟審核中心。
- **面試者 Demo**：輸入下列測試資料，完成說明、作答、提示與提交。

```text
Email：yian.chen@example.com
驗證碼：482916
```

所有角色共用 Junior Data Analyst／陳怡安／王柏翰的核心 Demo 情境，但部分跨角色結果是固定展示資料，並非真實同步。

## 技術棧

- Next.js 16 App Router、React 19、TypeScript 5.9
- Tailwind CSS 4、PostCSS 與手寫共用樣式
- vinext、Vite 8、Cloudflare Worker 相容 build
- Drizzle ORM／D1 骨架；目前 schema 為空且未啟用 D1 binding
- Node.js test runner 的 domain/reducer 單元測試與 SSR smoke test

## 安裝與啟動

需要 Node.js `>=22.13.0` 與 npm。

```bash
npm install
npm run dev
```

本專案統一使用 `vinext dev`，不使用獨立的 Vite Preview 啟動方式。若需完全依 lockfile 安裝，可使用：

```bash
npm ci
```

## 品質檢查

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

`npm test` 會先執行 build，再驗證首頁 SSR、頁面標題、三角色入口與 starter metadata 已移除。

## 專案目錄

```text
app/
  DemoApp.tsx          Demo 入口、共用 state 與角色流程協調
  demo/                共用型別、Demo 資料、UI 與面試 reducer
  flows/               HR、Tech Lead、Candidate 角色流程邊界
  globals.css          設計 token、元件樣式與 RWD
  page.tsx             首頁路由
  layout.tsx           根 layout 與 metadata
db/
  index.ts             D1／Drizzle 連線 helper
  schema.ts            目前為空
docs/                  專案規格與協作文件
tests/                 純邏輯／reducer 測試與 SSR smoke test
worker/                vinext Cloudflare Worker 入口
```

`examples/d1/` 是範本示例，不是目前 Talentscope 資料模型。

## 文件索引

建議依下列順序閱讀：

1. [專案總覽](docs/PROJECT_OVERVIEW.md)－背景、定位、範圍與限制。
2. [產品設計文件](docs/PDD.md)－角色、體驗、資訊架構與產品原則。
3. [軟體需求規格書](docs/SRS.md)－編號需求、狀態、規則與驗收。
4. [使用流程](docs/USER_FLOWS.md)－三角色 Happy Path、錯誤與 Mock 邊界。
5. [系統架構](docs/ARCHITECTURE.md)－Current MVP 與 Proposed Architecture。
6. [資料模型](docs/DATA_MODEL.md)－目前資料 shape 與 Proposed ER Model。
7. [測試計畫](docs/TEST_PLAN.md)－測試案例與實際執行狀態。
8. [工作說明書](docs/SOW.md)－交付範圍、里程碑、風險與變更管理。

## Mock 功能

- Demo 登入與角色權限。
- 候選人、職缺、題目、答案、統計與面試狀態資料。
- Email 邀請、專屬連結、驗證碼、複製與寄送回饋。
- 候選人 Mock AI 對話與六面向 Mock AI 初評；未串接正式 AI API。

## Sprint 5：Candidate AI 協作

- 作答頁支援每題獨立的自由文字 AI 對話、Enter 傳送與 Shift + Enter 換行。
- 對話以 `interviewId`、`questionId`、`requestId` 關聯，具 pending、success、error 與重試狀態。
- 候選人可自由使用內建 AI 協作；AI 回覆可能不完全正確，最終答案仍由候選人負責。提交後答案與對話均鎖定。

### Candidate AI 設定

前端只呼叫 `POST /api/candidate-ai`，Gemini key 僅由 server route 讀取。複製 `.env.example` 為 `.env.local` 後，可選擇：

- `AI_PROVIDER=mock`：預設，不需要網路或金鑰。
- `AI_PROVIDER=gemini`：需設定 `GEMINI_API_KEY` 與固定模型 `GEMINI_MODEL=gemini-2.5-flash`。

Gemini 使用官方 `@google/genai` Interactions API、`store: false`、Prompt version `v1`，不使用 Gemini 伺服器端對話保存。單次訊息上限 2,000 字、近期歷史 8 則、總 prompt 8,000 字、輸出上限 800 tokens、timeout 15 秒。Free Tier 的 RPM、TPM、RPD 依 Google AI Studio 專案配額為準。
- 所有資料只存在單一瀏覽器工作階段；技術審核頁的對話目前是隔離的 Mock 展示資料，並非跨角色同步。
- 自動儲存、各題停留時間與分析進度；倒數雖有前端 reducer，仍沒有持久化或伺服器時間來源。
- 人工評分、備註、技術建議與 HR 結果的資料持久化。

AI 不會、也不應自動決定錄取或淘汰。

## 已知限制

- 單一路由；角色 flow、共用型別與候選人 reducer 已拆分，但技術主管部分展示 view 仍集中於 `DemoApp.tsx`。
- 所有產品資料在記憶體中，重新整理即重置。
- 無正式 API、資料庫、身分驗證、RBAC、Interview Token 或 Audit Log。
- `chatgpt-auth.ts` helper 存在，但目前產品頁未使用。
- 無正式 Email、AI、程式碼執行、自動判題、錄影或防作弊功能。
- 自動化測試涵蓋核心 reducer、篩選／狀態純邏輯與首頁 SSR；React 元件、完整互動、RWD 與無障礙仍待補齊。

## Roadmap

建議下一階段依序處理：

1. 建立資料庫 schema、Backend API 與合法面試狀態機。
2. 實作 Authentication／RBAC 與短效、可撤銷的 Interview Token。
3. 完成 durable autosave、提交鎖定與跨角色審核同步。
4. 串接 Email 與可稽核的 AI Service。
5. 補齊 unit、integration、E2E、RWD、a11y、隱私與安全驗證。

Roadmap 是 Planned，不代表已排定工期或承諾日期。
