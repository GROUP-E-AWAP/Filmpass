import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { createBookingSchema } from "../../validation/bookingSchemas.js";
import { createBookingController } from "./bookings.controller.js";

const router = Router();

router.post("/", validate(createBookingSchema), createBookingController);

export default router;
