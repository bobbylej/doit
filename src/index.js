import express from "express";
import bodyParser from "body-parser";
import {
  SLACK_ACTION_GENERATE_REQUESTS,
  SLACK_ACTION_SUBMIT_REQUESTS,
} from "./constants/slack-actions.js";
import {
  generateRequestsForPreviousMessage,
  generateRequestsForUserInput,
  submitRequests,
} from "./utils/action.js";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  try {
    generateRequestsForUserInput(req.body);
    res.send();
  } catch (error) {
    console.error(error);
    res.status(500);
  }
});

app.post("/interact", async (req, res) => {
  const payload = JSON.parse(req.body.payload);
  try {
    payload.actions.forEach((action) => {
      switch (action.action_id) {
        case SLACK_ACTION_SUBMIT_REQUESTS:
          submitRequests(payload);
          break;
        case SLACK_ACTION_GENERATE_REQUESTS:
          generateRequestsForPreviousMessage(payload);
          break;
      }
    });
    res.send();
  } catch (error) {
    console.error(error);
    res.status(500);
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
