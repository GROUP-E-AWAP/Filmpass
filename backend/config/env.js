// backend/config/env.js
import dotenv from "dotenv";

dotenv.config();

// Можно сюда же сложить общие константы, если захочешь
export const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
