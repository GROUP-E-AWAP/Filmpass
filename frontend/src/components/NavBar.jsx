import { Link } from "react-router-dom";
import { useAuth } from "../auth";

export default function NavBar() {
  const { authUser, logout } = useAuth();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 32px",
        background: "white",
        borderBottom: "1px solid #e5e7eb"
      }}
    >
      {/* ЛОГО + ТЕКСТ */}
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          textDecoration: "none"
        }}
      >
        <img
          src="/north-star-logo.jpg"
          alt="North Star"
          style={{ height: 40, borderRadius: 6 }}
        />
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111" }}>
          FilmPass
        </h1>
      </Link>

      {/* ПРАВАЯ ЧАСТЬ */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Link to="/movies" style={{ fontSize: 16 }}>
          Movies
        </Link>

        {authUser ? (
          <>
            <span style={{ fontSize: 14, color: "#555" }}>
              Logged in as {authUser.email}
            </span>

            <button
              onClick={logout}
              style={{
                background: "#4f46e5",
                color: "white",
                padding: "6px 14px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer"
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ fontSize: 16 }}>
              Login
            </Link>
            <Link to="/register" style={{ fontSize: 16 }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
