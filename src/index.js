import express from "express";
import bodyParser from "body-parser";
import {
  SLACK_ACTION_GENERATE_REQUESTS,
  SLACK_ACTION_PROVIDE_API_KEYS,
  SLACK_ACTION_SUBMIT_REQUESTS,
} from "./constants/slack-actions.js";
import {
  askForAPIKeys,
  chat,
  clearSessionMessages,
  generateRequestsForPreviousMessage,
  generateRequestsForUserInput,
  storeApiKeys,
  submitRequests,
} from "./utils/action.js";
import {
  clearMessagesInSession,
  destroySession,
  pushMessageToSession,
  setSessionAPIKeys,
} from "./utils/session.js";
import { connectDB } from "./utils/mongoose.js";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

await connectDB();

app.post("/", async (req, res) => {
  try {
    chat(req.body);
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
        case SLACK_ACTION_PROVIDE_API_KEYS:
          storeApiKeys(payload);
      }
    });
    res.send();
  } catch (error) {
    console.error(error);
    res.status(500);
  }
});

app.post("/api-keys", (req, res) => {
  askForAPIKeys(req.body);
  res.send();
});

app.post("/clear", (req, res) => {
  clearSessionMessages(req.body);
  res.send();
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
