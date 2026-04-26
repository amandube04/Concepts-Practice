import ApiError from "../utils/ApiError.js";

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUknown: true,
    });
    if (error) {
      const message = error.details.map((d) => d.message.join("; "));
      return next(ApiError.badRequest(message));
    }

    req.body = value;
    next();
  };
}

export default validate;
