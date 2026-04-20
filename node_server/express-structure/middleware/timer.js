function timer(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.url} took ${Date.now() - start}ms`);
  });
  next();
}

export default timer;
