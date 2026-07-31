# TalentScope｜AI 技術面試協作平台

TalentScope 是串連 HR、技術主管與候選人的結構化技術面試協作平台。HR 管理候選人與招募結果，技術主管選題、組卷並人工審核，候選人完成驗證、作答及提交。AI 僅協助釐清思路與整理評估證據；技術建議與招募結果必須由人類確認。

> 目前版本是可操作的前端 MVP。角色、資料、驗證、邀請、Email 與 AI 均包含 Mock 或瀏覽器記憶體行為，不具備正式上線所需的安全與持久化能力。

## 目前版本

目前 `main` 已包含 Sprint 7.5：

- 三角色主要流程與一致的九種面試狀態。
- 正式前端模組邊界；入口為 `TalentScopeApp`，不再使用 `DemoApp` 單體。
- 候選人倒數、答案、單次提交與逐題 Mock AI 對話 reducer。
- HR 複合篩選、候選人表單驗證與人類招募決策。
- 技術主管題庫搜尋／篩選、組卷排序／估時及人工審核。
- 全站文字可讀性與基本桌面／手機 RWD 改善。
- 41 項 Node test runner 測試，包含純邏輯、reducer 與 SSR smoke test。

## 三種角色

| 角色 | 主要操作 | 現行邊界 |
|---|---|---|
| HR | 追蹤候選人、複合篩選、新增候選人、查看摘要、設定招募結果 | 資料只在當次瀏覽器工作階段；決策不保存決策者與時間 |
| 技術主管 | 查看工作台、搜尋題庫、選題組卷、產生邀請、人工審核 | 題庫、邀請、答案與 AI 初評主要為 Mock；審核不持久化 |
| 候選人 | Demo 驗證、閱讀說明、限時作答、使用 Mock AI、提交 | 只操作固定 Demo 面試；重新整理會遺失工作階段 |

角色選擇是展示入口，不是 Authentication 或 RBAC。

## 核心 Demo 功能

- HR Dashboard、候選人列表、關鍵字＋狀態＋職缺篩選及新增候選人表單。
- 12 題 Demo 題庫、題目預覽、複合篩選、選題、排序、移除及估時。
- 面試邀請連結、6 位數驗證碼、期限與寄送／複製回饋。
- 候選人驗證、面試說明、75 分鐘前端倒數、三題作答與提交確認。
- 每題獨立的 Mock AI 對話、pending、錯誤、重試及提交後鎖定。
- 技術審核的固定 Mock AI 初評、獨立人工分數、備註及技術建議。
- HR 人工選擇「通過／不通過／待討論」；AI 不會自動決定結果。

### Current 與 Mock

| 類別 | Current | Mock／限制 |
|---|---|---|
| 前端流程 | 三角色畫面、篩選、表單、組卷、作答、提交與審核介面 | 單一路由、單一瀏覽器工作階段 |
| 面試控制 | 75 分鐘 reducer、切題保留答案、逾時／手動單次提交保護 | 無伺服器時間、autosave 或後端冪等 |
| AI 協作 | 逐題對話狀態、錯誤、重試、安全字串護欄 | 固定 Mock provider；無正式模型或外部 API |
| 資料與權限 | TypeScript 資料契約、角色畫面分流 | 無 API、資料庫、Authentication、RBAC 或 Interview Token |
| 外部服務 | 無 | Email、Clipboard 成功與邀請寄送只顯示 Demo 回饋 |

完整需求、狀態與待決議事項請見 [PRD](docs/PRD.md)。

## Demo 操作

啟動後開啟終端顯示的 Local URL，通常是 [http://localhost:3000/](http://localhost:3000/)，再選擇 HR、技術主管或候選人 Demo。

候選人測試資料：

```text
Email：yian.chen@example.com
驗證碼：482916
```

三角色共用 Junior Data Analyst／陳怡安／王柏翰的故事背景，但答案、審核與摘要尚未形成正式跨角色同步。

## 技術棧

- Next.js 16 App Router、React 19、TypeScript 5.9
- vinext 0.0.50、Vite 8、Cloudflare Worker 相容 build
- Tailwind CSS 4、PostCSS 與 `app/globals.css` 共用樣式
- Node.js test runner
- Drizzle ORM／D1 骨架；schema 為空，產品尚未啟用資料庫

## 安裝與啟動

需求：Node.js `>=22.13.0`，建議使用 Node.js 22 LTS。

```powershell
npm ci
npm run dev
```

專案統一使用 `vinext dev`，不要與 Vite Preview 混用。請以終端實際輸出的網址為準。

其他指令：

```powershell
npm run typecheck
npm run lint
npm test
npm run build
git diff --check
```

`npm test` 會先 build，再執行 `tests/*.test.mjs`。

## 環境變數

目前 Demo 不需要環境變數，也沒有正式 AI、Email、Auth 或資料庫連線設定。Repository 目前未提供 `.env.example`。

- 不得將 API key、Token、密碼或候選人真實個資提交到 Git。
- `db/index.ts` 的 Cloudflare `DB` binding 只屬未啟用的 D1 骨架；不得把它描述成 Current database。
- 未經核准不得自行新增 Provider、Secret 或環境契約。

## 主要目錄

```text
app/
  TalentScopeApp.tsx    角色、共用工作階段 state 與 Flow 組合
  shell/                角色入口與內部工作區外殼
  flows/
    hr/                 HR 畫面與純邏輯
    tech/               技術主管畫面與題庫／組卷邏輯
    candidate/          候選人驗證與鍵盤規則
  domain/               共用型別、九種狀態與純業務規則
  interview/            倒數、答案、提交與 AI 對話 reducer
  mocks/                Seed data 與 Mock AI service
  shared/               跨角色 UI 元件
  globals.css           設計樣式、可讀性與 RWD
db/                     未啟用的 Drizzle／D1 空白骨架
docs/
  PRD.md                唯一正式產品規格
  archive/              歷史文件，不是現行標準
tests/                  純邏輯、reducer 與 SSR smoke tests
worker/                 vinext Cloudflare Worker 入口
```

## 已知限制

- 所有產品資料位於前端記憶體，重新整理即重置。
- 無正式 API、資料庫、Authentication、RBAC、Interview Token、Email、Audit Log 或外部 AI。
- 技術審核顯示固定 Mock 答案／AI 紀錄，未與候選人工作階段同步。
- HR 新增候選人不會同步成技術主管的新指派。
- 內部畫面沒有獨立 URL；重新整理不能保留所在步驟。
- 目前沒有 React 元件測試或瀏覽器 E2E；RWD、鍵盤、讀屏與對比仍需持續人工驗證。
- 手機寬度會隱藏內部 sidebar，技術主管題庫等次頁導覽仍需產品決策。
- npm audit 的既有相依套件風險應由獨立維護工作包評估。

## Roadmap

以下皆為 Proposed，未排定工期：

1. 核准正式資料契約、Backend API 與資料庫 schema。
2. 建立 Authentication／RBAC 與短效、可撤銷的 Interview Token。
3. 實作 durable autosave、後端提交鎖與跨角色同步。
4. 由團隊決定 AI 協作範圍、Provider 策略與 AI 評估是否進入下一階段。
5. 補齊 Email、Audit Log、E2E、a11y、隱私與安全驗證。

## 開發前必讀

1. 所有人先閱讀本 README。
2. 修改程式前必須閱讀 [AGENTS.md](AGENTS.md)。
3. 開發功能前閱讀 [docs/PRD.md](docs/PRD.md) 的相關段落。
4. Google Docs 是討論區；GitHub `main` 內文件才是正式施工標準。
5. [docs/archive/](docs/archive/) 只供歷史查閱，不得作為新功能依據。
6. 若程式、測試與 PRD 不一致，停止並回報，不得自行猜測。
7. 每個工作包完成時，檢查 README 與 PRD 是否需要同步更新。

## 文件索引

- [README.md](README.md)：所有人必讀的專案入口。
- [AGENTS.md](AGENTS.md)：人類與 AI 的施工、所有權與交付守則。
- [docs/PRD.md](docs/PRD.md)：唯一正式產品需求與驗收基線。
- [docs/archive/](docs/archive/)：已封存的歷史文件。
