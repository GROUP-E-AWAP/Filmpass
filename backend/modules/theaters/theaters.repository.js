import { query } from "../../config/db.js";

export async function listTheaters() {
  const result = await query(
    `SELECT theater_id AS id,
            name,
            location
       FROM theater
      ORDER BY name`
  );
  return result.rows;
}

export async function listMoviesByTheater(theaterId) {
  const result = await query(
    `SELECT DISTINCT
            m.movie_id AS id,
            m.title,
            m.description,
            m.duration_minutes,
            m.poster_url
       FROM movie m
       JOIN showtime s ON s.movie_id = m.movie_id
      WHERE s.theater_id = $1
      ORDER BY m.title`,
    [theaterId]
  );
  return result.rows;
}
