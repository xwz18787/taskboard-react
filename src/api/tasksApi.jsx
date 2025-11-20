const API_BASE = "http://localhost:3001";

// 取得所有任務
export async function getTasks() {
  const res = await fetch(`${API_BASE}/tasks`);
  if (!res.ok) {
    throw new Error("Failed to fetch tasks");
  }
  return res.json();
}

// 新增任務
export async function createTask(task) {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });

  if (!res.ok) {
    throw new Error("Failed to create task");
  }

  return res.json(); // 回傳包含 id 的新任務
}

// 更新任務（編輯 / 改欄位）
export async function updateTask(task) {
  const res = await fetch(`${API_BASE}/tasks/${task.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });

  if (!res.ok) {
    throw new Error("Failed to update task");
  }

  return res.json();
}

// 刪除任務
export async function deleteTask(id) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete task");
  }

  return true;
}
