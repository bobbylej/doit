import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/", async (req, res) => {
  const message = req.query.message;
  res.json({
    message,
  });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
