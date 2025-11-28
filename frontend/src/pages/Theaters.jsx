import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Theaters() {
  const [theaters, setTheaters] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listTheaters()
      .then(data => {
        setTheaters(data);
      })
      .catch(e => {
        console.error("Failed to load theaters", e);
        setError("Failed to load theaters");
      });
  }, []);

  return (
    <div>
      <h2>Choose a cinema</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {theaters.length === 0 && !error && <p>No theaters found.</p>}

      <div className="movie-grid">
        {theaters.map(t => (
          <div className="movie-card" key={t.id}>
            <div className="movie-title">{t.name}</div>
            <div
              style={{
                fontSize: 14,
                opacity: 0.8,
                marginBottom: 10,
                minHeight: 30
              }}
            >
              {t.location}
            </div>
            <Link to={`/theater/${t.id}`}>
              <button type="button">View movies</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
