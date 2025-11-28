import React, { createContext, useContext, useState } from "react";
import {
  loginUser,
  registerUser,
  saveAuth,
  clearAuth,
  getStoredUser
} from "./auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(email, password) {
    setLoading(true);
    setError("");
    try {
      const { token, user: u } = await loginUser({ email, password });
      saveAuth(token, u);
      setUser(u);
      return u;
    } catch (e) {
      setError(e.message || "Login failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function register(name, email, password) {
    setLoading(true);
    setError("");
    try {
      const { token, user: u } = await registerUser({ name, email, password });
      saveAuth(token, u);
      setUser(u);
      return u;
    } catch (e) {
      setError(e.message || "Registration failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearAuth();
    setUser(null);
  }

  const value = { user, loading, error, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
