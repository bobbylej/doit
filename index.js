import express from "express";
import { openAI } from "./src/openai.js";

const app = express();

app.get("/", async (req, res) => {
  const message = req.query.message;
  const models = await openAI.listModels();
  const chosenModel = models.data.data.find(
    (model) => model.id === "gpt-3.5-turbo"
  );

  res.json({
    message,
    chosenModel,
  });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
