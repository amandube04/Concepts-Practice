class APIError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request") {
    return new APIError(400, message);
  }

  static unauthorized(message = "Unauthorized") {
    return new APIError(401, message);
  }

  static forbidden(message = "Not Found") {
    return new APIError(403, message);
  }

  static conflict(message = "conflict") {
    return new APIError(409, message);
  }
}
export default APIError;
