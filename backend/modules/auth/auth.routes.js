import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { registerSchema, loginSchema } from "../../validation/authSchemas.js";
import {
  loginController,
  meController,
  registerController
} from "./auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), loginController);
router.get("/me", requireAuth, meController);

export default router;
