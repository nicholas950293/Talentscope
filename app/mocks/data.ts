import type { Candidate, Interview, Question } from "../domain/types";

export const questions: Question[] = [
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

export const demoInterview: Interview = { candidate: "陳怡安", email: "yian.chen@example.com", job: "Junior Data Analyst", lead: "王柏翰", due: "2026/08/02 23:59", code: "482916", url: "talentscope.demo/i/DA-260801", status: "等待人工審核", title: "資料分析技術面試", durationMinutes: 75, questionIds: [1, 2, 8] };

export const seedCandidates: Candidate[] = [
  demoInterview,
  { candidate: "林冠宇", email: "kuanyu.lin@example.com", job: "Backend Engineer", lead: "王柏翰", due: "2026/08/05 18:00", code: "163820", url: "talentscope.demo/i/BE-260805", status: "等待面試者開始" },
  { candidate: "張雅婷", email: "yating@example.com", job: "Product Analyst", lead: "李欣蓉", due: "2026/07/31 23:59", code: "739211", url: "talentscope.demo/i/PA-260731", status: "作答中" },
  { candidate: "周子翔", email: "zixiang@example.com", job: "Data Engineer", lead: "王柏翰", due: "2026/07/28 18:00", code: "550324", url: "talentscope.demo/i/DE-260728", status: "已完成" },
];
