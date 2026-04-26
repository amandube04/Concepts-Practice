import ApiError from "../utils/ApiError.js";

function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: message.join(", "),
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate value — resource already exists",
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

export default errorHandler;
