import joi from "joi";

export const registerSchema = joi.object({
  name: joi.string().trim().min(2).max(50).required().messages({
    "string.min": "Name must be at least 2 characters",
    "any.required": "Name is required",
  }),
  email: joi.string().trim().lowercase().email().required().messages({
    "string.email": "Must be a valid email",
    "any.required": "Email is required",
  }),
  password: joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters",
    "any.required": "Password is required",
  }),
  age: joi.number().integer().min(0).max(150).optional(),
});

export const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});
