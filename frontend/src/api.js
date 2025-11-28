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

  // читаем тело ОДИН раз
  let text = "";
  try {
    text = await res.text();
  } catch {
    text = "";
  }

  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // тело не JSON → оставляем как есть
    }
  }

  if (!res.ok) {
    const message =
      (data && data.error) ||
      text ||
      `${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  listMovies: () => fetchJSON("/movies"),
  movieDetails: (id, opts) => {
    const theaterId = opts && opts.theaterId ? opts.theaterId : null;
    const query = theaterId ? `?theaterId=${encodeURIComponent(theaterId)}` : "";
    return fetchJSON(`/movies/${id}${query}`);
  },
  seats: showId => fetchJSON(`/showtimes/${showId}/seats`),
  createBooking: payload =>
    fetchJSON(`/bookings`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  listTheaters: () => fetchJSON("/theaters"),
  listMoviesByTheater: theaterId =>
    fetchJSON(`/theaters/${theaterId}/movies`),

  // ===== admin api =====
  adminListTheaters: () => fetchJSON("/admin/theaters"),
  adminCreateTheater: payload =>
    fetchJSON("/admin/theaters", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  adminListAuditoriums: theaterId =>
    fetchJSON(`/admin/theaters/${theaterId}/auditoriums`),
  adminCreateAuditorium: payload =>
    fetchJSON("/admin/auditoriums", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  adminListMovies: () => fetchJSON("/admin/movies"),
  adminCreateMovie: payload =>
    fetchJSON("/admin/movies", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  adminCreateShowtime: payload =>
    fetchJSON("/admin/showtimes", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  adminListEmployees: () => fetchJSON("/admin/employees"),
  adminCreateEmployee: payload =>
    fetchJSON("/admin/employees", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  adminListBookings: params => {
    const query = new URLSearchParams(
      Object.entries(params || {}).filter(([, v]) => v != null && v !== "")
    ).toString();
    const path = query ? `/admin/bookings?${query}` : "/admin/bookings";
    return fetchJSON(path);
  }
};
