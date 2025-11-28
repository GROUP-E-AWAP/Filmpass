import {
  listMoviesByTheaterService,
  listTheatersService
} from "./theaters.service.js";

export async function listTheatersController(_req, res, next) {
  try {
    const theaters = await listTheatersService();
    res.json(theaters);
  } catch (e) {
    next(e);
  }
}

export async function listMoviesByTheaterController(req, res, next) {
  try {
    const theaterId = Number(req.params.id);
    if (Number.isNaN(theaterId)) {
      return res.status(400).json({ error: "Invalid theater id" });
    }
    const movies = await listMoviesByTheaterService(theaterId);
    res.json(movies);
  } catch (e) {
    next(e);
  }
}
