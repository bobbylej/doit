import { JIRA_OPENAI_INIT_MESSAGES } from "../constants/content.constant.js";
import { OPENAI_MESSAGE_ROLE } from "../constants/openai.constant.js";
import { SESSION_MAX_AGE } from "../constants/session.constant.js";
import { SESSION_MODEL_API_KEYS, Session } from "../models/session.model.js";

export const getSession = async (userId) => {
  return Session.findOne({ userId }).exec();
};

export const setSession = async (userId, { messages, ...apiKeys }) => {
  const session = (await getSession(userId)) || new Session({ userId });
  if (messages) session.messages = messages;
  Object.values(SESSION_MODEL_API_KEYS).forEach((key) => {
    if (apiKeys[key]) session[key] = apiKeys[key];
  });
  session.expires = new Date().getTime() + SESSION_MAX_AGE;
  await session.save();
  return session;
};

export const destroySession = async (userId) => {
  const session = await getSession(userId);
  if (session) {
    return session.deleteOne();
  }
};

export const setSessionAPIKeys = async (userId, apiKeys) => {
  return setSession(userId, apiKeys);
};

export const validateSessionAPIKeys = (apiKeys) => {
  const requiredApiKeys = Object.values(SESSION_MODEL_API_KEYS).filter(
    (key) => key !== SESSION_MODEL_API_KEYS.OPENAI_ORGANIZATION_ID
  );
  const hasAllRequiredApiKeys = requiredApiKeys.every((key) => {
    return apiKeys[key];
  });
  return hasAllRequiredApiKeys;
};

export const getMessagesFromSession = async (userId) => {
  const session = await getSession(userId);
  if (!session)
    return Promise.reject({
      status: 404,
      message: "Session for user not found",
    });
  return session.messages;
};

export const pushMessageToSession = async (userId, message, role) => {
  const session = await getSession(userId);
  if (!session)
    return Promise.reject({
      status: 404,
      message: "Session for user not found",
    });
  const messages = session?.messages.length
    ? session?.messages
    : JIRA_OPENAI_INIT_MESSAGES;
  messages.push({ role, content: message });
  return setSession(userId, { messages });
};

export const pushMessageWithResponsesToSession = (userId, responses) => {
  const message = responses
    .map((response) => {
      return `For request: ${JSON.stringify(
        response.value?.request || response.reason?.request
      )}\nI got response: ${JSON.stringify(
        response.value?.response || response.reason?.error
      )}`;
    })
    .join("\n\n");
  return pushMessageToSession(userId, message, OPENAI_MESSAGE_ROLE.USER);
};

export const clearMessagesInSession = async (userId) => {
  const session = await getSession(userId);
  if (session) {
    return setSession(userId, { messages: JIRA_OPENAI_INIT_MESSAGES });
  }
};
