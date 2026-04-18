const express = require("express");
const app = express();

app.use(express.json()); // middleware!! it runs on every request and parse json bodies into req.body

const users = [
  { id: 1, name: "Aman", age: 25 },
  { id: 2, name: "Anup", age: 98 },
];

// Request Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Auth verification
app.use("/api/users", (req, res, next) => {
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    const token = req.headers["x-api-key"];
    if (token !== "secret123") {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }
  next();
});

// Request Timmer
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.url} took ${Date.now() - start}ms`);
  });
  next();
});

// Get users
app.get("/api/users", (req, res) => {
  let result = users;
  if (req.query.name) {
    result = result.filter((u) =>
      u.name.toLowerCase().includes(req.query.name.toLowerCase()),
    );
  }
  if (req.query.minAge) {
    const min = parseInt(req.query.minAge);
    result = result.filter((u) => u.age >= min);
  }
  res.status(200).json(result);
});

// Get single users by URL Params
app.get("/api/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ error: "User not find" });
  res.status(200).json(user);
});

// Post - create user
app.post("/api/users", (req, res) => {
  const newUser = req.body;
  users.push(newUser);
  res.status(201).json(newUser);
});

// Put - update user
app.put("/api/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return res.status(404).json({ error: "User not find" });
  users[index] = { ...users[index], ...req.body };
  res.status(200).json(users[index]);
});

// Delete
app.delete("/api/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return res.status(404).json({ error: "User not find" });
  users.splice(index, 1);
  res.status(200).json({ message: "User Deleted", id });
});

app.listen(3001, () => console.log("Express server on http://localhost:3001"));
