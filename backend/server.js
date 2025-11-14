import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
});

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

const app = express();
app.use(cors());
app.use(express.json());

/* ====== helpers ====== */

function generateToken(userRow) {
  return jwt.sign(
    {
      userId: userRow.user_id,
      email: userRow.email,
      role: userRow.role
    },
    JWT_SECRET,
    { expiresIn: "2h" }
  );
}

async function authMiddleware(req, res, next) {
  const header = req.get("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/* ====== health ====== */

app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/db-health", async (req, res) => {
  try {
    const r = await pool.query("SELECT 1 AS ok");
    res.json({ ok: r.rows[0].ok === 1 });
  } catch (e) {
    console.error("DB-HEALTH ERROR:", e);
    res.status(500).json({ ok: false, error: String(e), code: e.code, detail: e.detail });
  }
});

/* ====== auth ====== */

/**
 * POST /auth/register
 * body: { name, email, password }
 */
app.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    const existing = await pool.query(
      `SELECT user_id FROM public."user" WHERE email = $1 LIMIT 1`,
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "User with this email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const insert = await pool.query(
      `INSERT INTO public."user"(name, email, password, role)
       VALUES ($1, $2, $3, 'customer')
       RETURNING user_id, name, email, role`,
      [name || email.split("@")[0], email, hash]
    );

    const user = insert.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (e) {
    console.error("REGISTER ERROR:", e);
    res.status(500).json({ error: "Registration failed" });
  }
});

/**
 * POST /auth/login
 * body: { email, password }
 */
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      `SELECT user_id, name, email, password, role
       FROM public."user"
       WHERE email = $1
       LIMIT 1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (e) {
    console.error("LOGIN ERROR:", e);
    res.status(500).json({ error: "Login failed" });
  }
});

/**
 * GET /auth/me
 * Requires: Authorization: Bearer <token>
 */
app.get("/auth/me", authMiddleware, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT user_id, name, email, role
       FROM public."user"
       WHERE user_id = $1`,
      [req.user.userId]
    );
    if (r.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = r.rows[0];
    res.json({
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (e) {
    console.error("AUTH/ME ERROR:", e);
    res.status(500).json({ error: "Failed to load user" });
  }
});

/* ====== movies & showtimes ====== */

app.get("/movies", async (_req, res) => {
  try {
    const q = `
      SELECT movie_id AS id,
             title,
             description,
             duration_minutes,
             release_date,
             genre,
             poster_url
      FROM movie
      ORDER BY title
    `;
    const r = await pool.query(q);
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get("/movies/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const m = await pool.query(`
      SELECT movie_id AS id,
             title,
             description,
             duration_minutes,
             release_date,
             genre,
             poster_url
      FROM movie
      WHERE movie_id = $1
    `, [id]);

    if (m.rows.length === 0) return res.status(404).json({ error: "Not found" });

    const s = await pool.query(`
      SELECT s.showtime_id AS id,
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
      JOIN theater t     ON t.theater_id = s.theater_id
      LEFT JOIN auditorium a ON a.auditorium_id = s.auditorium_id
      WHERE s.movie_id = $1
      ORDER BY s.show_date, s.start_time
    `, [id]);

    res.json({ movie: m.rows[0], showtimes: s.rows });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get("/showtimes/:id/seats", async (req, res) => {
  const showId = Number(req.params.id);
  try {
    const aud = await pool.query(
      "SELECT auditorium_id FROM showtime WHERE showtime_id = $1",
      [showId]
    );
    if (aud.rows.length === 0 || !aud.rows[0].auditorium_id) {
      return res.status(400).json({ error: "Showtime has no auditorium" });
    }
    const auditoriumId = aud.rows[0].auditorium_id;

    const sql = `
      SELECT s.seat_id AS id,
             s.row_label,
             s.seat_number,
             CASE WHEN EXISTS (
               SELECT 1
               FROM booking_seat bs
               JOIN booking b ON b.booking_id = bs.booking_id
               WHERE bs.seat_id = s.seat_id
                 AND b.showtime_id = $1
                 AND b.status = 'confirmed'
             )
             THEN 'BOOKED' ELSE 'AVAILABLE'
             END AS status
      FROM seat s
      WHERE s.auditorium_id = $2
      ORDER BY s.row_label, s.seat_number
    `;
    const r = await pool.query(sql, [showId, auditoriumId]);
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/* ====== booking with seats ====== */
/*
  body:
  {
    showtimeId: number,
    seats: number[],
    userEmail?: string,
    userName?: string,
    ticketType?: 'adult' | 'child'
  }

  Если есть JWT → используем userId из токена.
  Если нет JWT → создаём/ищем пользователя по email (как раньше).
*/

app.post("/bookings", async (req, res) => {
  const { showtimeId, seats, userEmail, userName, ticketType } = req.body;
  if (!showtimeId || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let userId = null;
    let emailToUse = userEmail;

    // если пользователь залогинен, берём данные из токена
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(
          req.headers.authorization.split(" ")[1],
          JWT_SECRET
        );
        userId = decoded.userId;
        emailToUse = decoded.email;
      } catch {
        // токен битый – игнорируем, пойдём по ветке guest
      }
    }

    // если userId ещё нет – ищем/создаём по email
    if (!userId) {
      if (!emailToUse) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Email required for guest booking" });
      }
      const uSel = await client.query(
        `SELECT user_id FROM public."user" WHERE email = $1 LIMIT 1`,
        [emailToUse]
      );
      if (uSel.rows.length) {
        userId = uSel.rows[0].user_id;
      } else {
        const ins = await client.query(
          `INSERT INTO public."user"(name, email, password, role)
           VALUES ($1, $2, 'guest', 'customer')
           RETURNING user_id`,
          [userName || emailToUse.split("@")[0], emailToUse]
        );
        userId = ins.rows[0].user_id;
      }
    }

    const sh = await client.query(
      "SELECT price FROM showtime WHERE showtime_id = $1",
      [showtimeId]
    );
    if (sh.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Invalid showtime" });
    }
    const basePrice = Number(sh.rows[0].price || 0);
    const price = ticketType === "child" ? basePrice * 0.7 : basePrice;
    const total = price * seats.length;

    const b = await client.query(
      `INSERT INTO booking (user_id, showtime_id, seats, total_amount, status)
       VALUES ($1, $2, $3, $4, 'confirmed')
       RETURNING booking_id`,
      [userId, showtimeId, seats.length, total]
    );
    const bookingId = b.rows[0].booking_id;

    for (const seatId of seats) {
      await client.query(
        `INSERT INTO booking_seat (booking_id, seat_id, ticket_type, price)
         VALUES ($1, $2, $3, $4)`,
        [bookingId, seatId, ticketType || "adult", price]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ bookingId, total });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("BOOKING ERROR:", e);
    res.status(500).json({ error: String(e) });
  } finally {
    client.release();
  }
});

/* ====== start ====== */

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("DB config:", {
    host: process.env.DB_HOST,
    db: process.env.DB_NAME,
    user: process.env.DB_USER,
    ssl: process.env.DB_SSL
  });
  console.log(`API listening on http://localhost:${PORT}`);
});
