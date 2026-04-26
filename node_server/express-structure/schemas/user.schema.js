import joi from "joi";

export const createUserSchema = joi.object({
  name: joi.string().trim().min(2).max(50).required(),
  email: joi.string().email().optional(),
  age: joi.number().integer().min(0).max(150).required(),
});

export const updateUserSchema = joi
  .object({
    name: joi.string().trim().min(2).max(50),
    email: joi.string().email(),
    age: joi.number().integer().min(0).max(150),
  })
  .min(1);
