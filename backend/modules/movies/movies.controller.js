import { listMoviesService, movieDetailsService } from "./movies.service.js";

export async function listMoviesController(_req, res, next) {
  try {
    const movies = await listMoviesService();
    res.json(movies);
  } catch (e) {
    next(e);
  }
}

export async function movieDetailsController(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid movie id" });
    }

    const theaterIdRaw = req.query.theaterId;
    const theaterId = theaterIdRaw ? Number(theaterIdRaw) : null;
    if (theaterIdRaw && Number.isNaN(theaterId)) {
      return res.status(400).json({ error: "Invalid theater id" });
    }

    const data = await movieDetailsService(id, theaterId);
    res.json(data);
  } catch (e) {
    next(e);
  }
}
