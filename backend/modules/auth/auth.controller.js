import { loginUserService, meService, registerUserService } from "./auth.service.js";

export async function registerController(req, res, next) {
  try {
    const result = await registerUserService(req.body);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

export async function loginController(req, res, next) {
  try {
    const result = await loginUserService(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function meController(req, res, next) {
  try {
    const user = await meService(req.user.userId);
    res.json({ user });
  } catch (e) {
    next(e);
  }
}
