import { Router } from "express";
import { listSeatsForShowtimeController } from "./seats.controller.js";

const router = Router();

router.get("/:id/seats", listSeatsForShowtimeController);

export default router;
