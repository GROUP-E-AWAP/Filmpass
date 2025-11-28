import Joi from "joi";

export const createTheaterSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  location: Joi.string().min(2).max(255).required()
});

export const createAuditoriumSchema = Joi.object({
  theaterId: Joi.number().integer().required(),
  name: Joi.string().min(1).max(100).required(),
  seatRows: Joi.number().integer().min(1).max(30).required(),
  seatCols: Joi.number().integer().min(1).max(40).required()
});

export const createMovieSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  genre: Joi.string().max(100).allow("", null),
  durationMinutes: Joi.number().integer().min(1).max(600).required(),
  releaseDate: Joi.string().isoDate().allow(null, ""),
  description: Joi.string().allow("", null),
  posterUrl: Joi.string().uri().allow("", null)
});

export const createShowtimeSchema = Joi.object({
  movieId: Joi.number().integer().required(),
  theaterId: Joi.number().integer().required(),
  auditoriumId: Joi.number().integer().required(),
  showDate: Joi.string().isoDate().required(), // формат YYYY-MM-DD
  startTime: Joi.string().required(), // 'HH:MM'
  endTime: Joi.string().required(),   // 'HH:MM'
  price: Joi.number().min(0).required()
});

export const createEmployeeSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  theaterId: Joi.number().integer().required(),
  role: Joi.string().valid("employee", "admin").default("employee")
});

export const listBookingsSchema = Joi.object({
  theaterId: Joi.number().integer().optional(),
  fromDate: Joi.string().isoDate().optional(),
  toDate: Joi.string().isoDate().optional()
});
