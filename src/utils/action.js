import { JIRA_OPENAI_GENERATE_REQUESTS_PROMPT } from "../constants/jira-openai-prompts.js";
import {
  bulkJira,
  convertSlackStateObjectToRequests,
  convertTextMessageWithRequests,
  generateJiraChatRequests,
  pushJiraResponsesMessage,
} from "./jira.js";
import {
  convertContentObjectToSlackMessage,
  convertResponsesToSlackAttachments,
  convertUserInputToSlackMessage,
  mergeSlackMessages,
  sendErrorResponseMessage,
  sendInProgressResponseMessage,
  sendResponseMessage,
  sendSuccessResponseMessage,
} from "./slack.js";

export const submitRequests = async (payload) => {
  try {
    const requests = convertSlackStateObjectToRequests(payload.state.values);
    const responses = requests && (await bulkJira(requests));
    const slackAttachments = convertResponsesToSlackAttachments(responses);
    await sendSuccessResponseMessage(payload, slackAttachments);
    pushJiraResponsesMessage(responses);
  } catch (error) {
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
  await sendInProgressResponseMessage(payload);
  const text = payload.text;
  const userInputMessage = convertUserInputToSlackMessage(text);
  const requestsMessage = await generateRequests(text);
  const slackMessage = mergeSlackMessages(userInputMessage, requestsMessage);
  await sendResponseMessage(payload, slackMessage, true);
};

export const generateRequestsForPreviousMessage = async (payload) => {
  const text = JIRA_OPENAI_GENERATE_REQUESTS_PROMPT;
  const slackMessage = await generateRequests(text);
  await sendResponseMessage(payload, slackMessage, false);
};
