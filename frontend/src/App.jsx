import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Movie from "./pages/Movie.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import { clearAuth, getStoredUser } from "./auth";

export default function App() {
  const [user, setUser] = useState(() => getStoredUser());

  function handleLogout() {
    clearAuth();
    setUser(null);
  }

  return (
    <div className="container">
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 10,
          paddingBottom: 10
        }}
      >
        {/* Лого + название */}
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

        {/* Навигация / логин */}
        <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/">Movies</Link>

          {user ? (
            <>
              <span className="username">
                Logged in as <b>{user.email}</b>
              </span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<Movie />} />
          <Route path="/register" element={<Register onAuth={setUser} />} />
          <Route path="/login" element={<Login onAuth={setUser} />} />
        </Routes>
      </main>

      <footer>
        <span>North Star Cinemas · Demo project</span>
        <span>© {new Date().getFullYear()}</span>
    </footer>
    </div>
  );
}
