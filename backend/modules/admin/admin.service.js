// backend/modules/admin/admin.service.js
import bcrypt from "bcryptjs";
import {
  adminCreateAuditorium,
  adminCreateMovie,
  adminCreateShowtime,
  adminCreateTheater,
  adminCreateUser,
  adminFindUserByEmail,
  adminGenerateSeatsForAuditorium,
  adminLinkEmployeeToTheater,
  adminListAuditoriums,
  adminListBookings,
  adminListEmployees,
  adminListMovies,
  adminListTheaters
} from "./admin.repository.js";

export async function adminListTheatersService() {
  return adminListTheaters();
}

export async function adminCreateTheaterService(payload) {
  return adminCreateTheater(payload);
}

export async function adminListAuditoriumsService(theaterId) {
  return adminListAuditoriums(theaterId);
}

export async function adminCreateAuditoriumService(payload) {
  const auditorium = await adminCreateAuditorium(payload);
  await adminGenerateSeatsForAuditorium(
    auditorium.id,
    auditorium.seat_rows,
    auditorium.seat_cols
  );
  return auditorium;
}

export async function adminListMoviesService() {
  return adminListMovies();
}

export async function adminCreateMovieService(payload) {
  return adminCreateMovie(payload);
}

export async function adminCreateShowtimeService(payload) {
  return adminCreateShowtime(payload);
}

export async function adminCreateEmployeeService(payload) {
  const { name, email, password, theaterId, role } = payload;

  const existing = await adminFindUserByEmail(email);
  if (existing) {
    const err = new Error("User with this email already exists");
    err.statusCode = 409;
    throw err;
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await adminCreateUser({
    name,
    email,
    passwordHash: hash,
    role
  });

  await adminLinkEmployeeToTheater(user.user_id, theaterId);

  return user;
}

export async function adminListEmployeesService() {
  return adminListEmployees();
}

export async function adminListBookingsService(filters) {
  return adminListBookings(filters);
}
