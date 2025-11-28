import { createBookingService } from "./bookings.service.js";

export async function createBookingController(req, res, next) {
  try {
    const result = await createBookingService(req.body, req.headers.authorization || "");
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}
