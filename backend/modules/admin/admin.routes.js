// backend/modules/admin/admin.routes.js
import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import {
  createAuditoriumSchema,
  createEmployeeSchema,
  createMovieSchema,
  createShowtimeSchema,
  createTheaterSchema
} from "../../validation/adminSchemas.js";
import {
  adminCreateAuditoriumController,
  adminCreateEmployeeController,
  adminCreateMovieController,
  adminCreateShowtimeController,
  adminCreateTheaterController,
  adminListAuditoriumsController,
  adminListBookingsController,
  adminListEmployeesController,
  adminListMoviesController,
  adminListTheatersController
} from "./admin.controller.js";

const router = Router();

// Theaters
router.get("/theaters", adminListTheatersController);
router.post("/theaters", validate(createTheaterSchema), adminCreateTheaterController);

// Auditoriums
router.get("/theaters/:theaterId/auditoriums", adminListAuditoriumsController);
router.post("/auditoriums", validate(createAuditoriumSchema), adminCreateAuditoriumController);

// Movies
router.get("/movies", adminListMoviesController);
router.post("/movies", validate(createMovieSchema), adminCreateMovieController);

// Showtimes
router.post("/showtimes", validate(createShowtimeSchema), adminCreateShowtimeController);

// Employees
router.get("/employees", adminListEmployeesController);
router.post("/employees", validate(createEmployeeSchema), adminCreateEmployeeController);

// Bookings
router.get("/bookings", adminListBookingsController);

export default router;
