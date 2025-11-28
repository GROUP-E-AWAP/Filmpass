import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

/**
 * Требует валидный JWT в Authorization: Bearer <token>
 * Ставит decoded payload в req.user
 */
export function requireAuth(req, res, next) {
  const header = req.get("Authorization");

  if (!header || !header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, email, role }
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Проверяет роль пользователя.
 * requireRole('admin') или requireRole('admin', 'employee')
 */
export function requireRole(...roles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
