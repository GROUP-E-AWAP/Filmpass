import {
  getMovieById,
  listMovies,
  listShowtimesForMovie
} from "./movies.repository.js";

export async function listMoviesService() {
  return listMovies();
}

export async function movieDetailsService(movieId, theaterId = null) {
  const movie = await getMovieById(movieId);
  if (!movie) {
    const err = new Error("Movie not found");
    err.statusCode = 404;
    throw err;
  }
  const showtimes = await listShowtimesForMovie(movieId, theaterId);
  return { movie, showtimes };
}
