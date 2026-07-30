const catalog = new Map([
  [1, { id: 1, title: "找出連續活躍用戶", type: "SQL", description: "找出連續三天都有登入紀錄的使用者。", detail: "login_events(user_id INT, login_at TIMESTAMP)。同一天多次登入只計一次。", example: "輸出：user_id、streak_start、streak_end" }],
  [2, { id: 2, title: "電商月留存率", type: "SQL", description: "計算每個註冊月份的次月留存率。", detail: "users(id, created_at)、orders(user_id, created_at)。需處理無訂單月份。", example: "2026-01 | 42.5%" }],
  [8, { id: 8, title: "資料品質異常處理", type: "技術問答", description: "儀表板營收突然成長 35%，你會如何驗證與回報？", detail: "請依序描述檢查、定位、溝通與後續預防。", example: "以條列方式說明你的調查步驟。" }],
]);

export const getInterviewQuestion = (interviewId, questionId) => interviewId === "interview-demo-001" ? catalog.get(questionId) : undefined;
