const notFound = (req, res, next) => {
  const error = new Error("Not Found");
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Server Error";

  // Log server errors for debugging.
  console.error(`[error] ${req.method} ${req.originalUrl}`, err);

  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };
