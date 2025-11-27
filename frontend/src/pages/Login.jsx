import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, saveAuth } from "../auth";

export default function Login({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { token, user } = await loginUser({ email, password });
      saveAuth(token, user);
      if (onAuth) onAuth(user);
      navigate("/");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
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
