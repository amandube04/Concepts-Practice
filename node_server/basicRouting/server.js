const http = require("http");

const users = [
  { id: 1, name: "Aman", age: 25 },
  { id: 2, name: "Anup", age: 98 },
];
const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "content-type": "text/html" });
    res.end("<h1> Welcome to the home Page </h1>");
  } else if (req.method === "GET" && req.url === "/api/users") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(users));
  } else if (req.url === "/about") {
    res.writeHead(200, { "content-type": "text/html" });
    res.end("<h1>This is about section </h1>");
  } // Post
  else if (req.method === "POST" && req.url === "/api/users") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const parsed = JSON.parse(body);
      console.log(parsed);
      res.writeHead(201, { "content-type": "application/json" });
      users.push(parsed);
      res.end(JSON.stringify(parsed));
    });
  } else if (req.method === "PUT" && req.url === "/api/users") {
    let getResponse = "";
    req.on("data", (data) => (getResponse += data));
    req.on("end", () => {
      const parsedData = JSON.parse(getResponse);
      const index = users.findIndex((u) => u.id === parsedData.id);
      if (index !== -1) {
        users[index] = { ...users[index], ...parsedData };
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(users[index]));
      } else {
        res.writeHead(400, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "User not found" }));
      }
    });
  } else if (req.method === "DELETE" && req.url === "/api/users") {
    let bodyDeleteUser = "";
    req.on("data", (id) => (bodyDeleteUser += id));
    req.on("end", () => {
      const parsedID = JSON.parse(bodyDeleteUser);
      const index = users.findIndex((id) => id.id === parsedID.id);
      if (index !== -1) {
        res.writeHead(200, { "content-type": "application/json" });
        users.splice(index, 1);
        res.end(JSON.stringify({ message: "User deleted", id: parsedID.id }));
      } else {
        res.writeHead(404, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "User not found" }));
      }
    });
  } else {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("404: Not Found");
  }
});

server.listen(3001);
