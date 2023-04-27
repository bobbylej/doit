import express from "express";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  console.log("BODY", JSON.stringify(req.body));
  const text = "OK, I'm gonna"
  res.json({ text: `${text} ${req.body.text}` })
});

app.get("/", async (req, res) => {
  res.send("OK")
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
