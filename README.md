# TaskBoard – React 任務看板

一個使用 **React + Vite** 開發的輕量任務管理工具，  
透過 **json-server 模擬 REST API** 進行任務資料的新增、讀取與刪除，  
並將任務依照狀態分成 **To Do / In Progress / Done** 三欄顯示。

## Demo 功能介紹

- 🔐 **登入頁**
  - 測試帳號：`demo@taskboard.com`
  - 密碼：`123456`
  - 簡單驗證帳號密碼，登入成功後會在 `localStorage` 儲存 token，並導向 Dashboard

- 📋 **任務看板**
  - 從 `http://localhost:3001/tasks` 取得任務資料
  - 依照 `status` 分為三欄：
    - `todo` → To Do
    - `in-progress` → In Progress
    - `done` → Done
  - 每張卡片顯示：
    - 標題、描述、優先度（Low/Medium/High）、截止日期

- ➕ **新增任務**
  - 表單欄位：標題（必填）、描述、狀態、優先度、截止日期
  - 送出後會呼叫 `POST /tasks` 建立新任務，並即時更新畫面

- ✏️ **編輯任務**
  - 點選卡片上的 `Edit` 按鈕，可修改標題、描述、狀態、優先度與截止日期
  - 送出後呼叫 `PUT /tasks/:id` 更新資料

- 🧲 **拖拉改欄位（Drag & Drop）**
  - 支援拖拉任務卡片到不同欄位，自動更新對應的 `status`

- 🗑 **刪除任務**
  - 卡片右上角 ✕ 按鈕
  - 點選後會跳出確認視窗，確定後呼叫 `DELETE /tasks/:id` 刪除任務

- 🔍 **搜尋 / 篩選**
  - 可輸入關鍵字搜尋標題與描述
  - 可依優先度（High / Medium / Low）篩選任務

## 使用技術

- **前端**
  - React (Vite)
  - React Router (`react-router-dom`)
  - Hooks（`useState`, `useEffect`, `useNavigate`）
  - 原生 CSS，RWD 排版（Grid + Flexbox）

- **假後端 / API**
  - `json-server` 模擬 REST API
  - `GET /tasks`、`POST /tasks`、`PUT /tasks/:id`、`DELETE /tasks/:id`

## 專案結構（節錄）

```bash
src/
  api/
    tasksApi.js        # 封裝 REST API 呼叫
  pages/
    LoginPage.jsx      # 登入頁
    DashboardPage.jsx  # 任務看板頁（新增 / 編輯 / 刪除 / 拖拉）
  App.jsx              # 路由設定
  main.jsx             # React 入口，包 BrowserRouter
  styles.css           # 全站樣式（登入頁 + 看板樣式）
db.json                # json-server 使用的假資料

##開發環境啟動方式
# 安裝依賴
npm install

# 啟動假後端 REST API（http://localhost:3001）
npm run server

# 另開一個終端機，啟動 React 開發伺服器（http://localhost:5173）
npm run dev

##打開瀏覽器前往 http://localhost:5173，使用測試帳號登入即可開始使用 TaskBoard。