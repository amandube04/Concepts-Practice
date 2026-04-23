import APIError from "../utils/ApiError";

function errorHandler(err, req, res, next) {
  if (err instanceof APIError) {
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
}

export default errorHandler;
