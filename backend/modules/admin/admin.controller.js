// backend/modules/admin/admin.controller.js
import {
  adminCreateAuditoriumService,
  adminCreateEmployeeService,
  adminCreateMovieService,
  adminCreateShowtimeService,
  adminCreateTheaterService,
  adminListAuditoriumsService,
  adminListBookingsService,
  adminListEmployeesService,
  adminListMoviesService,
  adminListTheatersService
} from "./admin.service.js";

export async function adminListTheatersController(_req, res, next) {
  try {
    const theaters = await adminListTheatersService();
    res.json(theaters);
  } catch (e) {
    next(e);
  }
}

export async function adminCreateTheaterController(req, res, next) {
  try {
    const theater = await adminCreateTheaterService(req.body);
    res.status(201).json(theater);
  } catch (e) {
    next(e);
  }
}

export async function adminListAuditoriumsController(req, res, next) {
  try {
    const theaterId = Number(req.params.theaterId);
    if (Number.isNaN(theaterId)) {
      return res.status(400).json({ error: "Invalid theater id" });
    }
    const data = await adminListAuditoriumsService(theaterId);
    res.json(data);
  } catch (e) {
    next(e);
  }
}

export async function adminCreateAuditoriumController(req, res, next) {
  try {
    const auditorium = await adminCreateAuditoriumService(req.body);
    res.status(201).json(auditorium);
  } catch (e) {
    next(e);
  }
}

export async function adminListMoviesController(_req, res, next) {
  try {
    const movies = await adminListMoviesService();
    res.json(movies);
  } catch (e) {
    next(e);
  }
}

export async function adminCreateMovieController(req, res, next) {
  try {
    const movie = await adminCreateMovieService(req.body);
    res.status(201).json(movie);
  } catch (e) {
    next(e);
  }
}

export async function adminCreateShowtimeController(req, res, next) {
  try {
    const showtime = await adminCreateShowtimeService(req.body);
    res.status(201).json(showtime);
  } catch (e) {
    next(e);
  }
}

export async function adminCreateEmployeeController(req, res, next) {
  try {
    const user = await adminCreateEmployeeService(req.body);
    res.status(201).json(user);
  } catch (e) {
    next(e);
  }
}

export async function adminListEmployeesController(_req, res, next) {
  try {
    const employees = await adminListEmployeesService();
    res.json(employees);
  } catch (e) {
    next(e);
  }
}

export async function adminListBookingsController(req, res, next) {
  try {
    const { theaterId, fromDate, toDate } = req.query;
    const filters = {
      theaterId: theaterId ? Number(theaterId) : undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined
    };
    const bookings = await adminListBookingsService(filters);
    res.json(bookings);
  } catch (e) {
    next(e);
  }
}
