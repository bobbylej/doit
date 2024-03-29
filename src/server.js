import express from "express";
import bodyParser from "body-parser";
import {
  SLACK_ACTION_GENERATE_REQUESTS,
  SLACK_ACTION_PROVIDE_API_KEYS,
  SLACK_ACTION_SUBMIT_REQUESTS,
} from "./constants/slack.constant.js";
import {
  askForAPIKeys,
  chat,
  clearSessionMessages,
  generateRequestsForPreviousMessage,
  storeApiKeys,
  submitRequests,
} from "./utils/action.js";
import { connectDB } from "./utils/mongoose.js";
import { initTrackingSDK, registerErrorHandler, registerRequestsHandler } from "./utils/error-sdk.js";
import { handleError } from "./utils/error-handler.js";

const port = process.env.PORT || 3000;

const app = express();

initTrackingSDK(app);
registerRequestsHandler(app);

app.use(bodyParser.urlencoded({ extended: true }));

await connectDB();

app.post("/", async (req, res) => {
  try {
    chat(req.body);
    res.send();
  } catch (error) {
    res.status(500);
    handleError(error);
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
    res.status(500);
    handleError(error);
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

registerErrorHandler(app);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
