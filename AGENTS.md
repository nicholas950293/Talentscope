# TalentScope 開發協作規則

## Branch 與交付

- 禁止直接在 `main` 施工；每個工作包必須使用獨立 Branch。
- 完成工作包後只推送自己的 Branch，經整合與驗收後再合入 `main`。
- 規格、測試與程式互相矛盾時，停止修改並向 PM 或整合負責人確認。

## 模組所有權

- HR：`app/flows/HrFlow.tsx`、`app/flows/hr/**`
- 技術主管：`app/flows/TechLeadFlow.tsx`、`app/flows/tech/**`
- 面試者：`app/flows/CandidateFlow.tsx`、`app/flows/candidate/**`
- 共用領域型別與規則：`app/domain/**`。修改前需提出 Integration Request。
- 面試工作階段控制：`app/interview/**`。變更必須維持倒數、答案與單次提交測試護欄。
- Mock 基礎設施：`app/mocks/**`。Mock 能力必須明確標示，不得描述為正式後端服務。
- `app/TalentScopeApp.tsx`、`app/shell/**`、跨角色共用 state、`app/globals.css`、`package.json` 與 lockfile 都是高衝突區；除非工作包明確授權，否則不得修改。

## 依賴與產品邊界

- 新增或升級 npm 套件前必須取得團隊同意。
- 不得把角色選擇宣稱為正式登入、Mock 驗證宣稱為 Interview Token，或前端記憶體 state 宣稱為正式持久化。
- AI 僅協助提示與整理證據；最終招募決策由人類負責。

## 完成前驗證

使用專案指定的 Node.js 22 LTS，依序執行：

```powershell
npm ci
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

不得刪除、跳過或降低既有測試斷言來取得通過結果。
