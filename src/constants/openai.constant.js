export const OPENAI_MESSAGE_ROLE = {
  ASSISTANT: "assistant",
  USER: "user",
  SYSTEM: "system",
};

export const OPENAI_MAX_TOKENS = +process.env.OPENAI_API_MAX_TOKENS;

export const OPENAI_MIN_MARGIN_TOKENS = 1000;