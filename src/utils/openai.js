import { Configuration, OpenAIApi } from "openai";
import { encode } from "gpt-3-encoder";
import { SESSION_MODEL_API_KEYS } from "../models/session.model.js";
import { OPENAI_COMPLETION_STOP, OPENAI_CHAT_COMPLETION_MAX_TOKENS, OPENAI_MESSAGE_ROLE, OPENAI_MIN_MARGIN_TOKENS, OPENAI_COMPLETION_MAX_TOKENS, OPENAI_COMPLETION_TYPE, OPENAI_COMPLETION_TYPES } from "../constants/openai.constant.js";

const models = {
  chatCompletionModel: process.env.OPENAI_API_CHAT_COMPLETION_MODEL,
  completionModel: process.env.OPENAI_API_COMPLETION_MODEL,
};
const defaultApiKeys = {
  [SESSION_MODEL_API_KEYS.OPENAI_API_KEY]: process.env.OPENAI_API_KEY,
  [SESSION_MODEL_API_KEYS.OPENAI_ORGANIZATION_ID]: process.env.OPENAI_API_ORGANIZATION,
};

const getOpenAIApi = (apiKeys) => {
  const configuration = new Configuration({
    apiKey: apiKeys[SESSION_MODEL_API_KEYS.OPENAI_API_KEY] || defaultApiKeys[SESSION_MODEL_API_KEYS.OPENAI_API_KEY],
    organization: apiKeys[SESSION_MODEL_API_KEYS.OPENAI_ORGANIZATION_ID] || defaultApiKeys[SESSION_MODEL_API_KEYS.OPENAI_ORGANIZATION_ID],
  });
  return new OpenAIApi(configuration);
}

export const createChatCompletion = async (messages, apiKeys) => {
  const openAI = getOpenAIApi(apiKeys);
  const preparedMessages = getMessagesForChatCompletion(messages);
  const completion = await openAI.createChatCompletion({
    model: models.chatCompletionModel,
    temperature: 0.2,
    messages: preparedMessages,
  });
  return completion.data.choices[0].message.content;
};

export const createTextCompletion = async (messages, apiKeys) => {
  const openAI = getOpenAIApi(apiKeys);
  const preparedMessages = getMessagesForTextCompletion(messages);
  const prompt = convertMessagesToPrompt(preparedMessages);
  const amountOfTokensInPrompt = countTokensInMessages(prompt);
  const completion = await openAI.createCompletion({
    model: models.completionModel,
    temperature: 0.2,
    max_tokens: OPENAI_COMPLETION_MAX_TOKENS - amountOfTokensInPrompt,
    stop: OPENAI_COMPLETION_STOP,
    prompt,
  });
  return completion.data.choices[0].text;
};

export const createCompletion = OPENAI_COMPLETION_TYPE === OPENAI_COMPLETION_TYPES.TEXT ? createTextCompletion : createChatCompletion;

export const countTokensInMessages = (messages) => {
  const tokens = encode(typeof messages === "string" ? messages : JSON.stringify(messages));
  return tokens.length;
};

export const countMessagesToKeep = (allMessages) => {
  const systemMessages = allMessages.filter(
    (message) => message.role === OPENAI_MESSAGE_ROLE.SYSTEM
  );
  const systemMessagesTokensAmount = countTokensInMessages(systemMessages);
  const maxTokensAmountInMessages = OPENAI_CHAT_COMPLETION_MAX_TOKENS - OPENAI_MIN_MARGIN_TOKENS - systemMessagesTokensAmount;
  const messagesWithoutSystem = allMessages.filter(
    (message) => message.role !== OPENAI_MESSAGE_ROLE.SYSTEM
  );
  const messagesTokensAmounts = messagesWithoutSystem.map((message) =>
    countTokensInMessages(message)
  );
  let amountOfMessagesToKeep = 0;
  let tokensSoFar = 0;
  for (let i = 0; i < messagesTokensAmounts.length && !amountOfMessagesToKeep; i++) {
    tokensSoFar += messagesTokensAmounts[i];
    if (tokensSoFar >= maxTokensAmountInMessages) {
      amountOfMessagesToKeep = i;
    }
  }

  return amountOfMessagesToKeep;
};

export const getLastMessages = (messages, count = 1) => {
  const systemMessages = messages.filter(
    (message) => message.role === OPENAI_MESSAGE_ROLE.SYSTEM
  );
  const messagesWithoutSystem = messages.filter(
    (message) => message.role !== OPENAI_MESSAGE_ROLE.SYSTEM
  );
  const indexToSlice = messagesWithoutSystem.length - count;
  const messagesToRemember = messagesWithoutSystem?.slice(indexToSlice) || [];
  return [...systemMessages, ...messagesToRemember];
};

export const getMessagesForChatCompletion = (messages) => {
  return getMessagesForCompletion(OPENAI_CHAT_COMPLETION_MAX_TOKENS, messages);
}

export const getMessagesForTextCompletion = (messages) => {
  return getMessagesForCompletion(OPENAI_COMPLETION_MAX_TOKENS, messages);
}

export const getMessagesForCompletion = (maxTokens, messages) => {
  const amountOfTokensInMessages = countTokensInMessages(messages);
  const hasMaxTokens = amountOfTokensInMessages >= (maxTokens - OPENAI_MIN_MARGIN_TOKENS);
  if (!hasMaxTokens) return messages;
  const amountOfMessagesToKeep = countMessagesToKeep(messages);
  return getLastMessages(messages, amountOfMessagesToKeep);
}

export const convertMessagesToPrompt = (messages) => {
  const systemMessages = messages.filter(
    (message) => message.role === OPENAI_MESSAGE_ROLE.SYSTEM
  );
  const messagesWithoutSystem = messages.filter(
    (message) => message.role !== OPENAI_MESSAGE_ROLE.SYSTEM
  );
  let prompt = systemMessages.map((message) => message.content).join("\n");
  prompt += "\n\n";
  prompt += messagesWithoutSystem.map((message) => `${message.role}: ${message.content} ${OPENAI_COMPLETION_STOP}`).join("\n");
  prompt += `\n${OPENAI_MESSAGE_ROLE.ASSISTANT}: `;
  return prompt;
}
