import { Router } from "express";
import {
  listMoviesByTheaterController,
  listTheatersController
} from "./theaters.controller.js";

const router = Router();

router.get("/", listTheatersController);
router.get("/:id/movies", listMoviesByTheaterController);

export default router;
