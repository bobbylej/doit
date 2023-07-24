import { JIRA_OPENAI_GENERATE_REQUESTS_PROMPT } from "../constants/content.constant.js";
import { OPENAI_MESSAGE_ROLE } from "../constants/openai.constant.js";
import { getRejectedPercentage } from "./api.js";
import {
  convertSlackStateObject,
  convertSlackStateObjectToRequests,
  convertTextMessageWithRequests,
  filterIncludedRequests,
} from "./content.js";
import { handleError } from "./error-handler.js";
import { bulkJira } from "./jira.js";
import { createCompletion } from "./openai.js";
import {
  clearMessagesInSession,
  getSession,
  pushMessageToSession,
  pushMessageWithResponsesToSession,
  setSessionAPIKeys,
  validateSessionAPIKeys,
} from "./session.js";
import {
  convertContentObjectToSlackMessage,
  convertResponsesToSlackAttachments,
  convertUserInputToSlackMessage,
  generateProvideAPIKeysMessage,
  mergeSlackMessages,
  sendAPIKeysRequiredResponseMessage,
  sendErrorResponseMessage,
  sendInProgressResponseMessage,
  sendNothingToDoResponseMessage,
  sendPartlyErrorResponseMessage,
  sendResponseMessage,
  sendSuccessResponseMessage,
  sendWhatToDoMessage,
} from "./slack.js";

export const chat = async (payload) => {
  const session = await getSession(payload.user_id);
  if (session) {
    await generateRequestsForUserInput(payload);
  } else {
    await askForAPIKeys(payload);
  }
};

export const askForAPIKeys = async (payload) => {
  try {
    const slackMessage = generateProvideAPIKeysMessage();
    await sendResponseMessage(payload, slackMessage, true);
  } catch (error) {
    await sendErrorResponseMessage(payload);
    handleError(error);
  }
};

export const storeApiKeys = async (payload) => {
  const userId = payload.user.id;
  try {
    const apiKeys = convertSlackStateObject(payload.state.values);
    const areApiKeysValid = validateSessionAPIKeys(apiKeys);
    if (!areApiKeysValid) {
      await sendAPIKeysRequiredResponseMessage(payload);
      return;
    }
    await setSessionAPIKeys(userId, apiKeys);
    await sendWhatToDoMessage(payload);
  } catch (error) {
    await sendErrorResponseMessage(payload);
    handleError(error, userId);
  }
};

export const generateRequestsForUserInput = async (payload) => {
  const userId = payload.user_id || payload.user.id;
  try {
    await sendInProgressResponseMessage(payload);
    const text = payload.text;
    const userInputMessage = convertUserInputToSlackMessage(text);
    const requestsMessage = await generateRequests(text, userId);
    const slackMessage = mergeSlackMessages(userInputMessage, requestsMessage);
    await sendResponseMessage(payload, slackMessage, true);
  } catch (error) {
    await sendErrorResponseMessage(payload);
    handleError(error, userId);
  }
};

export const generateRequestsForPreviousMessage = async (payload) => {
  const userId = payload.user_id || payload.user.id;
  try {
    await sendInProgressResponseMessage(payload);
    const text = JIRA_OPENAI_GENERATE_REQUESTS_PROMPT;
    const slackMessage = await generateRequests(text, userId);
    await sendResponseMessage(payload, slackMessage, false);
  } catch (error) {
    await sendErrorResponseMessage(payload);
    handleError(error, userId);
  }
};

export const submitRequests = async (payload) => {
  const userId = payload.user_id || payload.user.id;
  try {
    const session = await getSession(userId);
    if (!session) {
      await askForAPIKeys(payload);
      return;
    }
    const allRequests = convertSlackStateObjectToRequests(payload.state.values);
    const requests = filterIncludedRequests(allRequests);
    if (requests.length === 0) {
      return sendNothingToDoResponseMessage(payload);
    }
    const areAllRequestsIncluded = allRequests.length === requests.length;
    const responses = await bulkJira(requests, session);
    const slackAttachments = convertResponsesToSlackAttachments(responses);
    await sendSuccessResponseMessage(
      payload,
      {
        attachments: slackAttachments,
      },
      areAllRequestsIncluded && false
    );
    pushMessageWithResponsesToSession(userId, responses);
  } catch (error) {
    handleError(error, userId);
    const rejectedPercentage = Array.isArray(error)
      ? getRejectedPercentage(error)
      : 1;
    const slackAttachments = convertResponsesToSlackAttachments(error);
    if (rejectedPercentage === 1) {
      sendErrorResponseMessage(payload, { attachments: slackAttachments });
    } else {
      sendPartlyErrorResponseMessage(payload, {
        attachments: slackAttachments,
      });
    }
    pushMessageWithResponsesToSession(userId, error);
  }
};

export const clearSessionMessages = async (payload) => {
  const userId = payload.user_id || payload.user.id;
  try {
    await clearMessagesInSession(userId);
    await sendWhatToDoMessage(payload);
  } catch (error) {
    await sendErrorResponseMessage(payload);
    handleError(error, userId);
  }
};

export const generateRequests = async (text, userId) => {
  const session = await pushMessageToSession(
    userId,
    text,
    OPENAI_MESSAGE_ROLE.USER
  );
  const aiMessage = await createCompletion(session.messages, session);
  await pushMessageToSession(
    session.userId,
    aiMessage,
    OPENAI_MESSAGE_ROLE.ASSISTANT
  );
  const content = convertTextMessageWithRequests(aiMessage);
  return convertContentObjectToSlackMessage(content);
};
