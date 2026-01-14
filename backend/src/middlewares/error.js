const notFound = (req, res, next) => {
  res.status(404).json({ message: "Not Found" });
};

const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Server Error";

  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };
