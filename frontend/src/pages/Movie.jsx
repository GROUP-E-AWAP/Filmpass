import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import SeatMap from "../components/SeatMap.jsx";
import { getStoredUser } from "../auth";

export default function Movie() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [pageError, setPageError] = useState("");
  const [loading, setLoading] = useState(true);

  const [showId, setShowId] = useState("");
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [ticketType, setTicketType] = useState("adult");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const [authUser] = useState(() => getStoredUser()); // текущий залогиненный юзер (или null)

  /* ====== загрузка фильма + сеансов ====== */
  useEffect(() => {
    setLoading(true);
    setPageError("");
    api
      .movieDetails(id)
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error("movieDetails error:", e);
        setPageError(e.message);
        setLoading(false);
      });
  }, [id]);

  /* ====== авто-подстановка имени/почты при логине ====== */
  useEffect(() => {
    if (authUser) {
      setName(authUser.name || authUser.email || "");
      setEmail(authUser.email || "");
    }
  }, [authUser]);

  /* ====== загрузка мест для выбранного сеанса ====== */
  useEffect(() => {
    if (!showId) {
      setSeats([]);
      setSelected([]);
      return;
    }
    api
      .seats(showId)
      .then(setSeats)
      .catch(e => {
        console.error("seats error:", e);
        setMsg("Failed to load seats: " + e.message);
      });
  }, [showId]);

  const currentShow = useMemo(
    () =>
      data?.showtimes?.find(s => String(s.id) === String(showId)) || null,
    [data, showId]
  );

  /* ====== бронирование ====== */
  async function handleBook(e) {
    e.preventDefault();
    setMsg("");

    if (!showId || selected.length === 0) {
      setMsg("Select showtime and at least one seat.");
      return;
    }

    const payload = {
      showtimeId: Number(showId),
      seats: selected,
      ticketType
    };

    // если гость, шлём email и name, иначе полагаемся на JWT
    if (!authUser) {
      if (!email) {
        setMsg("Email is required for guest booking.");
        return;
      }
      payload.userEmail = email;
      if (name) payload.userName = name;
    }

    try {
      const res = await api.createBooking(payload);

      setMsg(
        `Booking #${res.bookingId} confirmed. Total €${Number(
          res.total
        ).toFixed(2)}`
      );

      // обновляем статусы мест
      const updatedSeats = await api.seats(showId);
      setSeats(updatedSeats);
      setSelected([]);
    } catch (err) {
      console.error("booking error:", err);
      setMsg("Error: " + err.message);
    }
  }

  /* ====== состояния загрузки / ошибки ====== */

  if (loading) return <p>Loading...</p>;

  if (pageError)
    return <p style={{ color: "red" }}>Error loading movie: {pageError}</p>;

  if (!data || !data.movie) return <p>Movie not found.</p>;

  const { movie, showtimes = [] } = data;

  /* ====== UI ====== */

  return (
  <div className="movie-page">

    {/* === Постер + информация === */}
    <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
      {movie.poster_url && (
        <img
          src={movie.poster_url}
          alt={movie.title}
          style={{
            width: 200,
            borderRadius: 10,
            objectFit: "cover",
          }}
        />
      )}

      <div>
        <h2>{movie.title}</h2>
        {movie.description && (
          <p style={{ maxWidth: "70%" }}>{movie.description}</p>
        )}
      </div>
    </div>


      <form
        onSubmit={handleBook}
        style={{ marginTop: 16, display: "grid", gap: 12, maxWidth: 420 }}
      >
        <label>
          Showtime:
          <select
            value={showId}
            onChange={e => setShowId(e.target.value)}
            style={{ marginTop: 4 }}
          >
            <option value="">Select showtime</option>
            {showtimes.map(st => {
              const dt = st.start_time
                ? new Date(st.start_time)
                : st.show_date
                ? new Date(st.show_date)
                : null;

              const parts = [];
              if (dt) parts.push(dt.toLocaleString());
              if (st.theater_name) parts.push(st.theater_name);
              if (st.auditorium_name) parts.push(st.auditorium_name);
              if (st.price != null)
                parts.push(`€${Number(st.price).toFixed(2)}`);

              return (
                <option key={st.id} value={st.id}>
                  {parts.join(" — ")}
                </option>
              );
            })}
          </select>
        </label>

        <label>
          Ticket type:
          <select
            value={ticketType}
            onChange={e => setTicketType(e.target.value)}
            style={{ marginTop: 4 }}
          >
            <option value="adult">Adult</option>
            <option value="child">Child</option>
          </select>
        </label>

        {/* Если залогинен – показываем инфо, но не просим вводить */}
        {authUser ? (
          <p style={{ fontSize: 14, color: "#555" }}>
            Booking as <b>{authUser.email}</b>
          </p>
        ) : (
          <>
            <label>
              Name:
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
              />
            </label>

            <label>
              Email:
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
          </>
        )}

        {showId && seats.length > 0 && (
          <div>
            <h3 style={{ marginTop: 10, marginBottom: 6 }}>Select seats</h3>
            <SeatMap
              seats={seats}
              selected={selected}
              toggle={seatId => {
                setSelected(prev =>
                  prev.includes(seatId)
                    ? prev.filter(x => x !== seatId)
                    : [...prev, seatId]
                );
              }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={!showId || selected.length === 0}
          style={{ marginTop: 8 }}
        >
          {selected.length
            ? `Book ${selected.length} seat${
                selected.length > 1 ? "s" : ""
              }`
            : "Book"}
        </button>
      </form>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}
