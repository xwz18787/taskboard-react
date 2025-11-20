import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../api/tasksApi";

function DashboardPage() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 新增 / 編輯 共用的表單
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
  });

  // 如果不是 null，代表目前在編輯某一個任務
  const [editingId, setEditingId] = useState(null);

  // 搜尋 & 篩選
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // 拖拉中卡片的 id
  const [dragTaskId, setDragTaskId] = useState(null);

  // 沒登入就踢回 /login
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // 載入任務資料
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getTasks();
        setTasks(data);
      } catch (err) {
        console.error(err);
        setError("載入任務失敗，請確認你有執行 npm run server。");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function handleLogout() {
    localStorage.removeItem("authToken");
    navigate("/login");
  }

  // 表單輸入
  function handleInputChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // 送出表單：如果有 editingId 就更新，沒有就新增
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("請輸入任務標題");
      return;
    }

    try {
      if (editingId !== null) {
        // 編輯模式
        const original = tasks.find((t) => t.id === editingId);
        if (!original) return;

        const updatedTask = {
          ...original,
          ...form,
          id: editingId,
        };

        const result = await updateTask(updatedTask);
        setTasks((prev) =>
          prev.map((t) => (t.id === result.id ? result : t))
        );

        setEditingId(null);
      } else {
        // 新增模式
        const newTask = await createTask(form);
        setTasks((prev) => [...prev, newTask]);
      }

      // 清空表單
      setForm({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
      });
    } catch (err) {
      console.error(err);
      alert(editingId !== null ? "更新任務失敗" : "新增任務失敗");
    }
  }

  // 點卡片上的 Edit
  function handleEdit(task) {
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || "",
    });
    setEditingId(task.id);
    // 讓使用者知道在編輯
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // 取消編輯
  function handleCancelEdit() {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
    });
  }

  // 刪除任務
  async function handleDeleteTask(id) {
    const ok = window.confirm("確定要刪除這個任務嗎？");
    if (!ok) return;

    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      // 如果剛好在編輯被刪掉那一筆，也一起清掉表單
      if (editingId === id) {
        handleCancelEdit();
      }
    } catch (err) {
      console.error(err);
      alert("刪除任務失敗");
    }
  }

  // 拖拉開始
  function handleDragStart(id) {
    setDragTaskId(id);
  }

  // 欄位允許放置
  function handleDragOver(e) {
    e.preventDefault();
  }

  // 拖拉放下 → 改變任務 status
  async function handleDrop(status) {
    if (!dragTaskId) return;
    const task = tasks.find((t) => t.id === dragTaskId);
    if (!task || task.status === status) {
      setDragTaskId(null);
      return;
    }

    const updatedTask = { ...task, status };

    try {
      const result = await updateTask(updatedTask);
      setTasks((prev) =>
        prev.map((t) => (t.id === result.id ? result : t))
      );
    } catch (err) {
      console.error(err);
      alert("更新任務狀態失敗");
    } finally {
      setDragTaskId(null);
    }
  }

  // 搜尋 + 優先度篩選
  const keyword = search.trim().toLowerCase();
  const filteredTasks = tasks.filter((t) => {
    if (keyword) {
      const text =
        (t.title || "").toLowerCase() +
        " " +
        (t.description || "").toLowerCase();
      if (!text.includes(keyword)) return false;
    }
    if (priorityFilter !== "all" && t.priority !== priorityFilter) {
      return false;
    }
    return true;
  });

  // 分欄
  const todoTasks = filteredTasks.filter((t) => t.status === "todo");
  const inProgressTasks = filteredTasks.filter(
    (t) => t.status === "in-progress"
  );
  const doneTasks = filteredTasks.filter((t) => t.status === "done");

  return (
    <div className="page">
      <header className="app-header">
        <h1 className="app-logo">TaskBoard</h1>
        <button className="btn btn-secondary" onClick={handleLogout}>
          登出
        </button>
      </header>

      <main className="dashboard-main">
        {/* 上方標題 + 搜尋 / 篩選 */}
        <section className="dashboard-top">
          <div className="dashboard-intro">
            <h2>任務看板</h2>
            <p className="dashboard-subtitle">
              可以新增、編輯、刪除任務，並支援拖拉改欄位、關鍵字搜尋與優先度篩選。
            </p>
            {editingId !== null && (
              <p className="editing-hint">
                ✏️ 目前正在編輯任務（完成後按「儲存修改」，或點「取消編輯」恢復新增模式）
              </p>
            )}
          </div>

          <div className="dashboard-filters">
            <input
              type="text"
              placeholder="搜尋標題或描述..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">全部優先度</option>
              <option value="high">High 重要</option>
              <option value="medium">Medium 中等</option>
              <option value="low">Low 一般</option>
            </select>
          </div>
        </section>

        {/* 新增 / 編輯 表單 */}
        <section className="dashboard-form-section">
          <h3>{editingId !== null ? "編輯任務" : "新增任務"}</h3>
          <form className="task-form" onSubmit={handleSubmit}>
            <label>
              標題（必填）
              <input
                name="title"
                value={form.title}
                onChange={handleInputChange}
                placeholder="例如：完成前端履歷作品"
              />
            </label>

            <label>
              描述
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                placeholder="補充一下這個任務要做什麼..."
              />
            </label>

            <div className="task-form-row">
              <label>
                狀態
                <select
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </label>

              <label>
                優先度
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>

            <label>
              截止日期
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleInputChange}
              />
            </label>

            <div className="task-form-actions">
              {editingId !== null && (
                <button
                  type="button"
                  className="btn btn-text"
                  onClick={handleCancelEdit}
                >
                  取消編輯
                </button>
              )}
              <button type="submit" className="btn btn-primary">
                {editingId !== null ? "儲存修改" : "建立任務"}
              </button>
            </div>
          </form>
        </section>

        {/* 三欄看板 */}
        {loading && <p>載入中...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && (
          <div className="task-board">
            {/* To Do 欄 */}
            <div
              className="task-column"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop("todo")}
            >
              <h3 className="task-column-title">To Do</h3>
              {todoTasks.length === 0 && (
                <p className="task-column-empty">目前沒有待辦任務</p>
              )}
              {todoTasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-card priority-${task.priority}`}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                >
                  <div className="task-card-header">
                    <h4>{task.title}</h4>
                    <div className="task-card-actions">
                      <button
                        className="task-edit-btn"
                        type="button"
                        onClick={() => handleEdit(task)}
                      >
                        Edit
                      </button>
                      <button
                        className="task-delete-btn"
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <p className="task-desc">{task.description}</p>
                  <div className="task-meta">
                    <span className="task-priority">
                      {task.priority.toUpperCase()}
                    </span>
                    <span className="task-due">
                      到期：{task.dueDate || "未設定"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* In Progress 欄 */}
            <div
              className="task-column"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop("in-progress")}
            >
              <h3 className="task-column-title">In Progress</h3>
              {inProgressTasks.length === 0 && (
                <p className="task-column-empty">目前沒有進行中的任務</p>
              )}
              {inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-card priority-${task.priority}`}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                >
                  <div className="task-card-header">
                    <h4>{task.title}</h4>
                    <div className="task-card-actions">
                      <button
                        className="task-edit-btn"
                        type="button"
                        onClick={() => handleEdit(task)}
                      >
                        Edit
                      </button>
                      <button
                        className="task-delete-btn"
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <p className="task-desc">{task.description}</p>
                  <div className="task-meta">
                    <span className="task-priority">
                      {task.priority.toUpperCase()}
                    </span>
                    <span className="task-due">
                      到期：{task.dueDate || "未設定"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Done 欄 */}
            <div
              className="task-column"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop("done")}
            >
              <h3 className="task-column-title">Done</h3>
              {doneTasks.length === 0 && (
                <p className="task-column-empty">目前沒有已完成任務</p>
              )}
              {doneTasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-card priority-${task.priority}`}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                >
                  <div className="task-card-header">
                    <h4>{task.title}</h4>
                    <div className="task-card-actions">
                      <button
                        className="task-edit-btn"
                        type="button"
                        onClick={() => handleEdit(task)}
                      >
                        Edit
                      </button>
                      <button
                        className="task-delete-btn"
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <p className="task-desc">{task.description}</p>
                  <div className="task-meta">
                    <span className="task-priority">
                      {task.priority.toUpperCase()}
                    </span>
                    <span className="task-due">
                      到期：{task.dueDate || "未設定"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;
