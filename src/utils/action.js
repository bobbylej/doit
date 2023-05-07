import { JIRA_OPENAI_GENERATE_REQUESTS_PROMPT } from "../constants/jira-openai-prompts.js";
import { messageToCreateAttribute, messageWithoutRequest, messageWithTwoRequests } from "../mocks/openai.mock.js";
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
  convertUserInputToSlackMessage,
  mergeSlackMessages,
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
    pushJiraResponsesMessage(error);
  }
};

export const generateRequests = async (text) => {
  const message = await generateJiraChatRequests(text);
  // const message = messageWithoutRequest;
  // const message = messageWithTwoRequests;
  // const message = messageToCreateAttribute;
  const content = convertTextMessageWithRequests(message);
  return convertContentObjectToSlackMessage(content);
};

export const generateRequestsForUserInput = async (payload) => {
  const text = payload.text;
  const userInputMessage = convertUserInputToSlackMessage(text);
  const requestsMessage = await generateRequests(text);
  const slackMessage = mergeSlackMessages(userInputMessage, requestsMessage);
  await sendResponseMessage(payload, slackMessage, true);
}

export const generateRequestsForPreviousMessage = async (payload) => {
  const text = JIRA_OPENAI_GENERATE_REQUESTS_PROMPT;
  const slackMessage = await generateRequests(text);
  await sendResponseMessage(payload, slackMessage, false);
}
