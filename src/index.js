import express from "express";
import bodyParser from "body-parser";
import {
  SLACK_ACTION_GENERATE_REQUESTS,
  SLACK_ACTION_SUBMIT_REQUESTS,
} from "./constants/slack-actions.js";
import {
  generateRequests,
  generateRequestsForPreviousMessage,
  submitRequests,
} from "./utils/action.js";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  const text = req.body.text;
  const slackMessage = await generateRequests(text);
  res.json(slackMessage);
});

app.post("/interact", async (req, res) => {
  const payload = JSON.parse(req.body.payload);
  try {
    await Promise.all(
      payload.actions.map(async (action) => {
        switch (action.action_id) {
          case SLACK_ACTION_SUBMIT_REQUESTS:
            await submitRequests(payload);
            break;
          case SLACK_ACTION_GENERATE_REQUESTS:
            await generateRequestsForPreviousMessage(payload);
            break;
        }
      })
    );
    res.send();
  } catch (error) {
    console.error(error);
    res.status(500);
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
