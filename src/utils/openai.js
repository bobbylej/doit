import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  organization: process.env.OPENAI_API_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
});
const models = {
  chatCompletionModel: process.env.OPENAI_API_CHAT_COMPLETION_MODEL,
  completionModel: process.env.OPENAI_API_COMPLETION_MODEL,
}

export const openAI = new OpenAIApi(configuration);

export const createChatCompletion = (messages) => {
  return openAI.createChatCompletion({
    model: models.chatCompletionModel,
    temperature: 0,
    messages,
  });
};

export const createCompletion = (prompt) => {
  return openAI.createCompletion({
    model: models.completionModel,
    max_tokens: 400,
    temperature: 0,
    prompt,
  });
};
