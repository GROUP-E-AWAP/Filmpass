import { query } from "../../config/db.js";

export async function listMovies() {
  const result = await query(
    `SELECT movie_id AS id,
            title,
            description,
            duration_minutes,
            release_date,
            genre,
            poster_url
       FROM movie
      ORDER BY title`
  );
  return result.rows;
}

export async function getMovieById(movieId) {
  const result = await query(
    `SELECT movie_id AS id,
            title,
            description,
            duration_minutes,
            release_date,
            genre,
            poster_url
       FROM movie
      WHERE movie_id = $1`,
    [movieId]
  );
  return result.rows[0] || null;
}

export async function listShowtimesForMovie(movieId, theaterId = null) {
  if (theaterId) {
    const result = await query(
      `SELECT s.showtime_id AS id,
              s.show_date,
              s.start_time,
              s.end_time,
              s.price,
              t.theater_id,
              t.name          AS theater_name,
              t.location      AS theater_location,
              a.auditorium_id,
              a.name          AS auditorium_name
         FROM showtime s
         JOIN theater t       ON t.theater_id = s.theater_id
    LEFT JOIN auditorium a    ON a.auditorium_id = s.auditorium_id
        WHERE s.movie_id = $1
          AND s.theater_id = $2
        ORDER BY s.show_date, s.start_time`,
      [movieId, theaterId]
    );
    return result.rows;
  }

  const result = await query(
    `SELECT s.showtime_id AS id,
            s.show_date,
            s.start_time,
            s.end_time,
            s.price,
            t.theater_id,
            t.name          AS theater_name,
            t.location      AS theater_location,
            a.auditorium_id,
            a.name          AS auditorium_name
       FROM showtime s
       JOIN theater t       ON t.theater_id = s.theater_id
  LEFT JOIN auditorium a    ON a.auditorium_id = s.auditorium_id
      WHERE s.movie_id = $1
      ORDER BY s.show_date, s.start_time`,
    [movieId]
  );
  return result.rows;
}
