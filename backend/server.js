// backend/server.js
import dotenv from "dotenv";
import { createApp } from "./app.js";
import { pool } from "./config/db.js";

dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("DB config:", {
    host: process.env.DB_HOST,
    db: process.env.DB_NAME,
    user: process.env.DB_USER,
    ssl: process.env.DB_SSL
  });
  console.log(`API listening on http://localhost:${PORT}`);

  pool
    .query("SELECT 1 AS ok")
    .then(r => {
      const row = r.rows[0];
      console.log("DB health check ok:", row);
    })
    .catch(err => {
      console.error("DB health check failed:", err.message);
    });
});
