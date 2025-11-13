import express from "express";
import pkg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import cors from "cors";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());

// Database connect with SSL (required for Azure PostgreSQL)
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
});

//  Register Route
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Please fill all fields" });
  }

  try {
    // Check if user already exists
    const existing = await pool.query(`SELECT * FROM public."user" WHERE email=$1`, [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Insert new user
    await pool.query(
      `INSERT INTO public."user"(name, email, password) VALUES ($1, $2, $3)`,
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ error: "Please fill all fields" });
  }

  try {
    // Check user exists
    const userResult = await pool.query(`SELECT * FROM public."user" WHERE email=$1`, [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = userResult.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Success response
    res.json({ message: "Login successful!", user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
