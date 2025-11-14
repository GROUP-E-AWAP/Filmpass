import { getToken } from "./auth";

const BASE = import.meta.env.VITE_API_BASE || "/api";

async function fetchJSON(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  listMovies: () => fetchJSON("/movies"),
  movieDetails: id => fetchJSON(`/movies/${id}`),
  seats: showId => fetchJSON(`/showtimes/${showId}/seats`),
  createBooking: payload =>
    fetchJSON(`/bookings`, {
      method: "POST",
      body: JSON.stringify(payload)
    })
};
