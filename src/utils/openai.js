import { Configuration, OpenAIApi } from "openai";
import { SESSION_MODEL_API_KEYS } from "../models/session.model.js";

const models = {
  chatCompletionModel: process.env.OPENAI_API_CHAT_COMPLETION_MODEL,
  completionModel: process.env.OPENAI_API_COMPLETION_MODEL,
}

export const createChatCompletion = (messages, apiKeys) => {
  const configuration = new Configuration({
    organization: apiKeys[SESSION_MODEL_API_KEYS.OPENAI_ORGANIZATION_ID],
    apiKey: apiKeys[SESSION_MODEL_API_KEYS.OPENAI_API_KEY],
  });
  const openAI = new OpenAIApi(configuration);
  return openAI.createChatCompletion({
    model: models.chatCompletionModel,
    temperature: 0.2,
    messages,
  });
};

export const createCompletion = (prompt, apiKeys) => {
  const configuration = new Configuration({
    organization: apiKeys[SESSION_MODEL_API_KEYS.OPENAI_ORGANIZATION_ID],
    apiKey: apiKeys[SESSION_MODEL_API_KEYS.OPENAI_API_KEY],
  });
  const openAI = new OpenAIApi(configuration);
  return openAI.createCompletion({
    model: models.completionModel,
    max_tokens: 400,
    temperature: 0.2,
    prompt,
  });
};
