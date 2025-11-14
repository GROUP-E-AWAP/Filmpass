import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listMovies()
      .then(data => {
        // backend /movies возвращает массив [{ id, title, ... }]
        setMovies(data);
      })
      .catch(e => {
        console.error("Failed to load movies", e);
        setError("Failed to load movies");
      });
  }, []);

  return (
    <div>
      <h2>Movies</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="movie-grid">
        {movies.map(m => (
          <div className="movie-card" key={m.id}>
            {m.poster_url && (
    <img
      src={m.poster_url}
      alt={m.title}
      style={{
        width: "100%",
        borderRadius: 8,
        marginBottom: 10,
        objectFit: "cover",
        maxHeight: 260
      }}
    />
  )}
            <div className="movie-title">{m.title}</div>
            <div
              style={{
                fontSize: 14,
                opacity: 0.7,
                marginBottom: 10,
                minHeight: 40
              }}
            >
              {m.description
                ? m.description.slice(0, 80) + (m.description.length > 80 ? "…" : "")
                : "No description yet"}
            </div>
            <Link to={`/movie/${m.id}`}>
              <button>View details</button>
            </Link>
          </div>
        ))}
        {movies.length === 0 && !error && (
          <p style={{ marginTop: 10 }}>No movies found.</p>
        )}
      </div>
    </div>
  );
}
