import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext.jsx";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await register(name, email, password);
      navigate("/");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div>
      <h2>Register</h2>
      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: 320, display: "grid", gap: 10, marginTop: 10 }}
      >
        <label>
          Name
          <input value={name} onChange={e => setName(e.target.value)} />
        </label>
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
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
        {err && <p style={{ color: "red" }}>{err}</p>}
      </form>
    </div>
  );
}
