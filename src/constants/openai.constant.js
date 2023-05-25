export const OPENAI_MESSAGE_ROLE = {
  ASSISTANT: "assistant",
  USER: "user",
  SYSTEM: "system",
};

export const OPENAI_COMPLETION_TYPES = {
  CHAT: "chat",
  TEXT: "text",
}

export const OPENAI_COMPLETION_TYPE = process.env.OPENAI_API_COMPLETION_TYPE;

export const OPENAI_CHAT_COMPLETION_MAX_TOKENS = +process.env.OPENAI_API_CHAT_COMPLETION_MAX_TOKENS;

export const OPENAI_COMPLETION_MAX_TOKENS = +process.env.OPENAI_API_COMPLETION_MAX_TOKENS

export const OPENAI_MIN_MARGIN_TOKENS = 1000;

export const OPENAI_COMPLETION_STOP = "END";