import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./modules/auth/auth.routes.js";
import moviesRoutes from "./modules/movies/movies.routes.js";
import bookingsRoutes from "./modules/bookings/bookings.routes.js";
import showtimeSeatsRoutes from "./modules/bookings/seats.routes.js";
import theatersRoutes from "./modules/theaters/theaters.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requireAuth, requireRole } from "./middleware/auth.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(helmet());

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/auth", authRoutes);
  app.use("/movies", moviesRoutes);
  app.use("/bookings", bookingsRoutes);
  app.use("/showtimes", showtimeSeatsRoutes);
  app.use("/theaters", theatersRoutes);

  // всё под /admin только для авторизованных admin
  app.use("/admin", requireAuth, requireRole("admin"), adminRoutes);

  app.use(errorHandler);

  return app;
}
