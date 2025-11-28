export function errorHandler(err, req, res, _next) {
  console.error("UNHANDLED ERROR:", err);
  const status = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;

  const payload =
    process.env.NODE_ENV === "production"
      ? { error: "Internal server error" }
      : { error: err.message || "Internal server error" };

  res.status(status).json(payload);
}
