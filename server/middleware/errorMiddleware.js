export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (error, req, res, next) => {
  console.error(error);

  let statusCode = 500;
  let message = "Something went wrong on the server.";

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = error.message;
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID.";
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists.";
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};
