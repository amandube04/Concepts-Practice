import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import ApiError from "../utils/ApiError.js";
import validate from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";

const router = express.Router();

router.post("/register", validate(registerSchema), async (req, res) => {
  const { name, email, password, age } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict("Email already registered");

  const user = await User.create({ name, email, password, age });

  const userObj = user.toObject();
  delete userObj.password;
  res.status(201).json({ success: true, data: userObj });
});

router.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password"); // schema hides password need to fetch seperately
  if (!user) throw ApiError.unauthorized("Invalid credentials");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized("Invalid credentials");

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );
  res.status(200).json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

export default router;
