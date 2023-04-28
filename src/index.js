import express from "express";
import bodyParser from "body-parser";
import { generateJiraChatRequests } from "./jira.js";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  console.log("BODY", JSON.stringify(req.body));
  const actions = req.body.text;
  const requests = await generateJiraChatRequests(actions);
  res.json({ requests })
});

app.get("/", async (req, res) => {
  res.send("OK")
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
