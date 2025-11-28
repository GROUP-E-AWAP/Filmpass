import { getAuditoriumForShowtime, listSeatsWithStatus } from "./seats.repository.js";

export async function listSeatsForShowtimeController(req, res, next) {
  try {
    const showtimeId = Number(req.params.id);
    const aud = await getAuditoriumForShowtime(showtimeId);
    if (!aud || !aud.auditorium_id) {
      return res.status(400).json({ error: "Showtime has no auditorium" });
    }
    const seats = await listSeatsWithStatus(showtimeId, aud.auditorium_id);
    res.json(seats);
  } catch (e) {
    next(e);
  }
}
