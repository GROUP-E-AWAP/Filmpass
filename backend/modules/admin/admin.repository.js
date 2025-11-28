// backend/modules/admin/admin.repository.js
import { query } from "../../config/db.js";

export async function adminListTheaters() {
  const result = await query(
    `SELECT theater_id AS id, name, location
       FROM theater
      ORDER BY name`
  );
  return result.rows;
}

export async function adminCreateTheater({ name, location }) {
  const result = await query(
    `INSERT INTO theater (name, location)
     VALUES ($1, $2)
     RETURNING theater_id AS id, name, location`,
    [name, location]
  );
  return result.rows[0];
}

export async function adminListAuditoriums(theaterId) {
  const result = await query(
    `SELECT auditorium_id AS id,
            theater_id,
            name,
            seat_rows,
            seat_cols
       FROM auditorium
      WHERE theater_id = $1
      ORDER BY name`,
    [theaterId]
  );
  return result.rows;
}

export async function adminCreateAuditorium({ theaterId, name, seatRows, seatCols }) {
  const result = await query(
    `INSERT INTO auditorium (theater_id, name, seat_rows, seat_cols)
     VALUES ($1, $2, $3, $4)
     RETURNING auditorium_id AS id, theater_id, name, seat_rows, seat_cols`,
    [theaterId, name, seatRows, seatCols]
  );
  return result.rows[0];
}

export async function adminGenerateSeatsForAuditorium(auditoriumId, seatRows, seatCols) {
  await query(
    `DELETE FROM seat WHERE auditorium_id = $1`,
    [auditoriumId]
  );

  await query(
    `
    WITH rows AS (
      SELECT generate_series(1, $1) AS r
    ),
    nums AS (
      SELECT generate_series(1, $2) AS n
    )
    INSERT INTO seat (auditorium_id, row_label, seat_number)
    SELECT $3::int AS auditorium_id,
           chr(64 + r) AS row_label,
           n AS seat_number
    FROM rows CROSS JOIN nums
    `,
    [seatRows, seatCols, auditoriumId]
  );
}

export async function adminListMovies() {
  const result = await query(
    `SELECT movie_id AS id,
            title,
            genre,
            duration_minutes,
            release_date,
            description,
            poster_url
       FROM movie
      ORDER BY title`
  );
  return result.rows;
}

export async function adminCreateMovie({
  title,
  genre,
  durationMinutes,
  releaseDate,
  description,
  posterUrl
}) {
  const result = await query(
    `INSERT INTO movie (title, genre, duration_minutes, release_date, description, poster_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING movie_id AS id,
               title,
               genre,
               duration_minutes,
               release_date,
               description,
               poster_url`,
    [title, genre || null, durationMinutes, releaseDate || null, description || null, posterUrl || null]
  );
  return result.rows[0];
}

export async function adminCreateShowtime({
  movieId,
  theaterId,
  auditoriumId,
  showDate,
  startTime,
  endTime,
  price
}) {
  const result = await query(
    `INSERT INTO showtime (movie_id, theater_id, auditorium_id, show_date, start_time, end_time, price)
     VALUES (
       $1,
       $2,
       $3,
       $4::date,
       ($4::date + $5::time)::timestamp,
       ($4::date + $6::time)::timestamp,
       $7
     )
     RETURNING showtime_id AS id,
               movie_id,
               theater_id,
               auditorium_id,
               show_date,
               start_time,
               end_time,
               price`,
    [movieId, theaterId, auditoriumId, showDate, startTime, endTime, price]
  );
  return result.rows[0];
}

export async function adminFindUserByEmail(email) {
  const result = await query(
    `SELECT user_id, name, email, role
       FROM public."user"
      WHERE email = $1
      LIMIT 1`,
    [email]
  );
  return result.rows[0] || null;
}

export async function adminCreateUser({ name, email, passwordHash, role }) {
  const result = await query(
    `INSERT INTO public."user"(name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING user_id, name, email, role`,
    [name, email, passwordHash, role]
  );
  return result.rows[0];
}

export async function adminLinkEmployeeToTheater(userId, theaterId) {
  const result = await query(
    `INSERT INTO employee_theater (user_id, theater_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, theater_id) DO NOTHING
     RETURNING id, user_id, theater_id`,
    [userId, theaterId]
  );
  return result.rows[0] || null;
}

export async function adminListEmployees() {
  const result = await query(
    `SELECT u.user_id AS id,
            u.name,
            u.email,
            u.role,
            et.theater_id,
            t.name AS theater_name
       FROM public."user" u
  LEFT JOIN employee_theater et ON et.user_id = u.user_id
  LEFT JOIN theater t           ON t.theater_id = et.theater_id
      WHERE u.role IN ('employee', 'admin')
      ORDER BY u.user_id`
  );
  return result.rows;
}

export async function adminListBookings({ theaterId, fromDate, toDate }) {
  const params = [];
  const conditions = [];

  if (theaterId) {
    params.push(theaterId);
    conditions.push(`s.theater_id = $${params.length}`);
  }

  if (fromDate) {
    params.push(fromDate);
    conditions.push(`b.created_at::date >= $${params.length}`);
  }

  if (toDate) {
    params.push(toDate);
    conditions.push(`b.created_at::date <= $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await query(
    `
    SELECT
      b.booking_id        AS id,
      b.created_at,
      b.status,
      b.total_amount,
      u.email             AS customer_email,
      m.title             AS movie_title,
      t.name              AS theater_name,
      a.name              AS auditorium_name,
      s.show_date,
      s.start_time
    FROM booking b
    JOIN public."user" u ON u.user_id = b.user_id
    JOIN showtime s      ON s.showtime_id = b.showtime_id
    JOIN movie m         ON m.movie_id = s.movie_id
    JOIN theater t       ON t.theater_id = s.theater_id
    LEFT JOIN auditorium a ON a.auditorium_id = s.auditorium_id
    ${whereClause}
    ORDER BY b.created_at DESC
    `,
    params
  );

  return result.rows;
}
