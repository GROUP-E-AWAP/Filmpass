import { Router } from "express";
import {
  listMoviesController,
  movieDetailsController
} from "./movies.controller.js";

const router = Router();

router.get("/", listMoviesController);
router.get("/:id", movieDetailsController);

export default router;
