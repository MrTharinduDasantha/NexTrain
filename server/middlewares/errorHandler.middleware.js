// Eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  // Mongoose validation
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Duplicate key
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: `Duplicate value for: ${Object.keys(err.keyValue).join(", ")}`,
    });
  }

  // CastError
  if (err.name === "CastError") {
    return res
      .status(400)
      .json({ success: false, message: `Invalid ${err.path}: ${err.value}` });
  }

  console.error("⛔️", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};
