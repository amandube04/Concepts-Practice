import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";
import logger from "./middleware/logger.js";
import timer from "./middleware/timer.js";
import requireAuth from "./middleware/requireAuth.js";
import usersRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";

const app = express();

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(logger);
app.use(timer);

app.use("/api/auth", authRouter);

app.use("/api/users", requireAuth, usersRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Server error" });
});

const start = async () => {
  await connectDB();
  app.listen(PORT, () =>
    console.log(
      `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`,
    ),
  );
};

start();
