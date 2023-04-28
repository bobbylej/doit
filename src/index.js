import express from "express";
import bodyParser from "body-parser";
import {
  bulkJira,
  convertJiraErrorToSlackMessage,
  convertSlackStateObjectToRequests,
  convertTextMessageWithRequests,
  generateJiraChatRequests,
  pushJiraResponsesMessage,
} from "./utils/jira.js";
import {
  convertContentObjectToSlackMessage,
  sendErrorResponseMessage,
  sendSuccessResponseMessage,
} from "./utils/slack.js";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  const actions = req.body.text;
  const message = await generateJiraChatRequests(actions);
  const content = convertTextMessageWithRequests(message);
  const slackMessage = convertContentObjectToSlackMessage(content);
  res.json(slackMessage);
});

app.post("/interact", async (req, res) => {
  try {
    const payload = JSON.parse(req.body.payload);
    const requests = convertSlackStateObjectToRequests(payload.state.values);
    const responses = requests && (await bulkJira(requests));
    sendSuccessResponseMessage(payload, responses);
    pushJiraResponsesMessage(responses);
  } catch (error) {
    const errorText = error.request
      ? convertJiraErrorToSlackMessage(error)
      : `\`\`\`${JSON.stringify(error)}\`\`\``;
    sendErrorResponseMessage(payload, errorText);
  }
  res.json({});
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
