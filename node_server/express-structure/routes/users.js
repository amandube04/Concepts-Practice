import express from "express";
import User from "../models/user.js";
import ApiError from "../utils/ApiError.js";
import validate from "../middleware/validate.js";
import { createUserSchema, updateUserSchema } from "../schemas/user.schema.js";

const router = express.Router();

// GET /api/users (with filters)
router.get("/", async (req, res) => {
  const query = {};
  if (req.query.name) {
    query.name = { $regex: req.query.name, $options: "i" };
  }
  if (req.query.minAge) {
    query.age = { $gte: parseInt(req.query.minAge) };
  }
  const users = await User.find(query);
  res.status(200).json({ success: true, data: users });
});

// GET /api/users/:id
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound("User not found");
  res.status(200).json({ success: true, data: user });
});

// POST /api/users
router.post("/", validate(createUserSchema), async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});

// PUT /api/users/:id
router.put("/:id", validate(updateUserSchema), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) throw ApiError.notFound("User not found");
  res.status(200).json({ success: true, data: user });
});

// DELETE /api/users/:id
router.delete("/:id", async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound("User not found");
  res.status(204).send();
});

export default router;
