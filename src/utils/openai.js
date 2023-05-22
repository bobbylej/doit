import { Configuration, OpenAIApi } from "openai";
import { encode } from "gpt-3-encoder";
import { SESSION_MODEL_API_KEYS } from "../models/session.model.js";
import { OPENAI_MAX_TOKENS, OPENAI_MESSAGE_ROLE, OPENAI_MIN_MARGIN_TOKENS } from "../constants/openai.constant.js";

const models = {
  chatCompletionModel: process.env.OPENAI_API_CHAT_COMPLETION_MODEL,
  completionModel: process.env.OPENAI_API_COMPLETION_MODEL,
};

export const createChatCompletion = async (messages, apiKeys) => {
  const configuration = new Configuration({
    organization: apiKeys[SESSION_MODEL_API_KEYS.OPENAI_ORGANIZATION_ID],
    apiKey: apiKeys[SESSION_MODEL_API_KEYS.OPENAI_API_KEY],
  });
  const openAI = new OpenAIApi(configuration);
  const completion = await openAI.createChatCompletion({
    model: models.chatCompletionModel,
    temperature: 0.2,
    messages,
  });
  return completion.data.choices[0].message.content;
};

export const countTokensInMessages = (messages) => {
  const tokens = encode(JSON.stringify(messages));
  return tokens.length;
};

export const countMessagesToKeep = (allMessages) => {
  const systemMessages = allMessages.filter(
    (message) => message.role === OPENAI_MESSAGE_ROLE.SYSTEM
  );
  const systemMessagesTokensAmount = countTokensInMessages(systemMessages);
  const maxTokensAmountInMessages = OPENAI_MAX_TOKENS - OPENAI_MIN_MARGIN_TOKENS - systemMessagesTokensAmount;
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
  const amountOfTokensInMessages = countTokensInMessages(messages);
  const hasMaxTokens = amountOfTokensInMessages >= (OPENAI_MAX_TOKENS - OPENAI_MIN_MARGIN_TOKENS);
  if (!hasMaxTokens) return messages;
  const amountOfMessagesToKeep = countMessagesToKeep(messages);
  return getLastMessages(messages, amountOfMessagesToKeep);
}
