import { listMoviesByTheater, listTheaters } from "./theaters.repository.js";

export async function listTheatersService() {
  return listTheaters();
}

export async function listMoviesByTheaterService(theaterId) {
  const movies = await listMoviesByTheater(theaterId);
  return movies;
}
