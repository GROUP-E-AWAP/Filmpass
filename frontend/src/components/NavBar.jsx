import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../authContext.jsx";

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <header>
      {/* ЛОГО + НАЗВАНИЕ */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img
          src="/north-star-logo.jpg"
          alt="North Star"
          style={{ height: 40, borderRadius: 6, objectFit: "cover" }}
        />
        <Link to="/" style={{ textDecoration: "none", color: "black" }}>
          <h1>FilmPass</h1>
        </Link>
      </div>

      {/* НАВИГАЦИЯ / ЛОГИН */}
      <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link to="/">Movies</Link>

        {/* Пункт Admin будет виден, когда появятся роли на бэке */}
        {user && (user.role === "admin" || user.role === "employee") && (
          <Link to="/admin">Admin</Link>
        )}

        {user ? (
          <>
            <span className="username">
              Logged in as <b>{user.email}</b>
            </span>
            <button type="button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
