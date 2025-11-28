import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(email, password);
      navigate("/");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: 320, display: "grid", gap: 10, marginTop: 10 }}
      >
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        {err && <p style={{ color: "red" }}>{err}</p>}
      </form>
    </div>
  );
}
