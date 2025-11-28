import Joi from "joi";

export const createBookingSchema = Joi.object({
  showtimeId: Joi.number().integer().required(),
  seats: Joi.array().items(Joi.number().integer()).min(1).required(),
  userEmail: Joi.string().email().optional(),
  userName: Joi.string().max(100).optional(),
  ticketType: Joi.string().valid("adult", "child").default("adult")
});
