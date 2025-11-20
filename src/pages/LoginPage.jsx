import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@taskboard.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // 超簡單版：帳號密碼固定
    if (email === "demo@taskboard.com" && password === "123456") {
      // 存一個假的 token 代表已登入
      localStorage.setItem("authToken", "demo-token");
      navigate("/dashboard");
    } else {
      setError("帳號或密碼錯誤（測試帳號 demo@taskboard.com / 123456）");
    }
  }

  return (
    <div className="page page-center">
      <div className="login-card">
        <h1 className="app-logo">TaskBoard</h1>
        <p className="login-subtitle">React + REST API 任務看板 Demo</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              placeholder="demo@taskboard.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            密碼
            <input
              type="password"
              value={password}
              placeholder="123456"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn btn-primary full-width">
            登入
          </button>

          <p className="login-hint">
            測試帳號：demo@taskboard.com ／ 密碼：123456
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
