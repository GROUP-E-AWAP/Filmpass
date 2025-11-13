import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import crypto from "crypto";

dotenv.config();

const { Pool } = pkg;

const config = {
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 5432,
  ssl: false, // for local setup
  max: 10, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
};

const pool = new Pool(config);
/**
 * Create database tables if they don't exist.
 * This function is called during application startup to ensure the database schema is ready.
 */
async function createTablesIfNotExists() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS movies (
        id uuid PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description VARCHAR(500),
        duration_minutes int NOT NULL,
        poster_url VARCHAR(500),
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `;
    await pool.query(createTableQuery);
    console.log('Database tables checked/created successfully.');
  } catch (error) {
    console.error('Error creating tables:', error);
    // We exit here because if the table setup fails, the app is in an unusable state.
    process.exit(1); 
  }
}

// Run the table creation logic on startup.
createTablesIfNotExists();

const app = express();
app.use(cors());
app.use(express.json());

function uid(prefix) {
  return `${prefix}-${crypto.randomBytes(6).toString("hex")}`;
}

app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/db-health", async (req, res) => {
  try {
    const r = await pool.query("SELECT 1 AS ok");
    res.json({ ok: r.rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

/* ===== Movies list ===== */
app.get("/movies", async (req, res) => {
  try {
    const q = `
      SELECT id, title, description, duration_minutes, poster_url
      FROM movies
      ORDER BY title
    `;
    const r = await pool.query(q);
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/* ===== Movie details + showtimes ===== */
app.get("/movies/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const m = await pool.query("SELECT * FROM movies WHERE id = $1", [id]);
    if (m.rows.length === 0) return res.status(404).json({ error: "Not found" });
    const s = await pool.query(
      "SELECT * FROM showtimes WHERE movie_id = $1 ORDER BY start_time",
      [id]
    );
    res.json({ movie: m.rows[0], showtimes: s.rows });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/* ===== Seats availability for showtime ===== */
app.get("/showtimes/:id/seats", async (req, res) => {
  const showId = req.params.id;
  const sql = `
    SELECT s.id, s.row_label, s.seat_number,
           CASE WHEN EXISTS (
             SELECT 1 FROM booking_seats bs
             JOIN bookings b ON b.id = bs.booking_id
             WHERE bs.seat_id = s.id AND b.showtime_id = $1 AND b.status = 'CONFIRMED'
           ) THEN 'BOOKED' ELSE 'AVAILABLE' END AS status
    FROM seats s
    WHERE s.auditorium_id = (SELECT auditorium_id FROM showtimes WHERE id = $1)
    ORDER BY s.row_label, s.seat_number
  `;
  try {
    const r = await pool.query(sql, [showId]);
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/* ===== Create booking (transaction) ===== */
app.post("/bookings", async (req, res) => {
  const { showtimeId, customerEmail, seats, ticketType } = req.body;
  if (!showtimeId || !customerEmail || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const priceRow = await client.query(
      "SELECT price_adult, price_child FROM showtimes WHERE id = $1",
      [showtimeId]
    );
    if (priceRow.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Invalid showtime" });
    }
    const price = ticketType === "child" ? priceRow.rows[0].price_child : priceRow.rows[0].price_adult;

    // check conflicts
    const placeholders = seats.map((_, i) => `$${i + 1}`).join(",");
    const params = [...seats, showtimeId];
    const checkSql = `
      SELECT s.id
      FROM seats s
      WHERE s.id IN (${placeholders})
      AND EXISTS (
        SELECT 1 FROM booking_seats bs
        JOIN bookings b ON b.id = bs.booking_id
        WHERE bs.seat_id = s.id AND b.showtime_id = $${seats.length + 1} AND b.status = 'CONFIRMED'
      )
    `;
    const conflicts = await client.query(checkSql, params);
    if (conflicts.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Seat already booked", conflicts: conflicts.rows });
    }

    const bookingId = uid("bk");
    const total = Number(price) * seats.length;
    await client.query(
      "INSERT INTO bookings (id, user_id, showtime_id, status, total_amount, created_at) VALUES ($1, NULL, $2, 'CONFIRMED', $3, now())",
      [bookingId, showtimeId, total]
    );

    for (const seatId of seats) {
      await client.query(
        "INSERT INTO booking_seats (id, booking_id, seat_id, price) VALUES ($1, $2, $3, $4)",
        [uid("bks"), bookingId, seatId, price]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ bookingId, total });
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: String(e) });
  } finally {
    client.release();
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
});
