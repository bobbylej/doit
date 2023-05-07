import { JIRA_OPENAI_GENERATE_REQUESTS_PROMPT } from "../constants/jira-openai-prompts.js";
import { messageWithoutRequest, messageWithTwoRequests } from "../mocks/openai.mock.js";
import {
  bulkJira,
  convertJiraErrorToSlackMessage,
  convertSlackStateObjectToRequests,
  convertTextMessageWithRequests,
  generateJiraChatRequests,
  pushJiraResponsesMessage,
} from "./jira.js";
import { prettyPrintJSON } from "./object.js";
import {
  convertContentObjectToSlackMessage,
  sendErrorResponseMessage,
  sendResponseMessage,
  sendSuccessResponseMessage,
} from "./slack.js";

export const submitRequests = async (payload) => {
  try {
    const requests = convertSlackStateObjectToRequests(payload.state.values);
    const responses = requests && (await bulkJira(requests));
    await sendSuccessResponseMessage(payload, responses);
    pushJiraResponsesMessage(responses);
  } catch (error) {
    const errorText = error.request
      ? convertJiraErrorToSlackMessage(error)
      : `\`\`\`${prettyPrintJSON(error)}\`\`\``;
    await sendErrorResponseMessage(payload, errorText);
  }
};

export const generateRequests = async (text) => {
  const message = await generateJiraChatRequests(text);
  // const message = messageWithoutRequest;
  // const message = messageWithTwoRequests;
  const content = convertTextMessageWithRequests(message);
  return convertContentObjectToSlackMessage(content);
};

export const generateRequestsForPreviousMessage = async (payload) => {
  const text = JIRA_OPENAI_GENERATE_REQUESTS_PROMPT;
  const slackMessage = await generateRequests(text);
  await sendResponseMessage(payload, slackMessage, true);
}