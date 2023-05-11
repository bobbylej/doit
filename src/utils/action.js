import { JIRA_OPENAI_GENERATE_REQUESTS_PROMPT } from "../constants/jira-openai-prompts.js";
import { messageWithTwoRequests } from "../mocks/openai.mock.js";
import {
  bulkJira,
  convertSlackStateObjectToRequests,
  convertTextMessageWithRequests,
  filterIncludedRequests,
  generateJiraChatRequests,
  pushJiraResponsesMessage,
} from "./jira.js";
import { prettyPrintJSON } from "./object.js";
import {
  convertContentObjectToSlackMessage,
  convertResponsesToSlackAttachments,
  convertUserInputToSlackMessage,
  mergeSlackMessages,
  sendErrorResponseMessage,
  sendInProgressResponseMessage,
  sendNothingToDoResponseMessage,
  sendResponseMessage,
  sendSuccessResponseMessage,
} from "./slack.js";

export const submitRequests = async (payload) => {
  try {
    const requests = filterIncludedRequests(
      convertSlackStateObjectToRequests(payload.state.values)
    );
    if (!requests.length) {
      return sendNothingToDoResponseMessage(payload);
    }
    const responses = requests && (await bulkJira(requests));
    const slackAttachments = convertResponsesToSlackAttachments(responses);
    await sendSuccessResponseMessage(payload, slackAttachments);
    pushJiraResponsesMessage(responses);
  } catch (error) {
    console.error(error);
    const slackAttachments = convertResponsesToSlackAttachments(error);
    sendErrorResponseMessage(payload, slackAttachments);
    pushJiraResponsesMessage(error);
  }
};

export const generateRequests = async (text) => {
  const message = await generateJiraChatRequests(text);
  const content = convertTextMessageWithRequests(message);
  return convertContentObjectToSlackMessage(content);
};

export const generateRequestsForUserInput = async (payload) => {
  try {
    await sendInProgressResponseMessage(payload);
    const text = payload.text;
    const userInputMessage = convertUserInputToSlackMessage(text);
    const requestsMessage = await generateRequests(text);
    const slackMessage = mergeSlackMessages(userInputMessage, requestsMessage);
    await sendResponseMessage(payload, slackMessage, true);
  } catch (error) {
    console.error(error);
    await sendErrorResponseMessage(payload);
  }
};

export const generateRequestsForPreviousMessage = async (payload) => {
  try {
    await sendInProgressResponseMessage(payload);
    const text = JIRA_OPENAI_GENERATE_REQUESTS_PROMPT;
    const slackMessage = await generateRequests(text);
    await sendResponseMessage(payload, slackMessage, false);
  } catch (error) {
    console.error(error);
    await sendErrorResponseMessage(payload);
  }
};
